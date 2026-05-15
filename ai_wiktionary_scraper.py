import os
import re
import asyncio
import json
import logging
import aiohttp
from aiolimiter import AsyncLimiter
from python_utils import (
    logger, api_retry, wiktionary_breaker, groq_breaker, supabase_breaker,
    ExternalServiceError, ScrapedWord, EnrichedData, DictionaryEntry, async_cached
)
from groq import AsyncGroq
from supabase import create_client, Client
from typing import Any

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# User-Agent for Wiktionary
USER_AGENT = "BikolDictScraper/1.0 (https://github.com/Yahiro025)"

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Initialize Async Groq client
groq_client = AsyncGroq(api_key=GROQ_API_KEY)

# Rate limiter: 1 request per second for Wiktionary
wiktionary_limiter = AsyncLimiter(1, 1)

# Concurrency semaphore for Groq
groq_semaphore = asyncio.Semaphore(2)

def clean_wiki_markup(text: str) -> str:
    """Removes wiki markup like [[...]], {{...}}, and other common wikitext elements."""
    if not text:
        return ""

    # Special handling for common definition templates
    text = re.sub(r'\{\{alt form\|[^|]+\|([^|}]+)[^}]*\}\}', r'alternative form of \1', text)
    text = re.sub(r'\{\{nonstandard form of\|[^|]+\|([^|}]+)[^}]*\}\}', r'nonstandard form of \1', text)
    text = re.sub(r'\{\{gloss\|([^}]+)\}\}', r'(\1)', text)
    text = re.sub(r'\[\[(?:[^|\]]+\|)?([^\]]+)\]\]', r'\1', text)
    text = re.sub(r'\{\{[^\}]+\}\}', '', text)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r"''+", "", text)
    return text.strip()

@api_retry
@wiktionary_breaker
@async_cached(ttl=86400) # Cache word lists for 24 hours
async def get_wiktionary_words(limit: int = 5000) -> list[str]:
    """Fetches words across various Bikol lemma categories with pagination support."""
    categories = [
        "Category:Central Bikol lemmas",
        "Category:Rinconada Bikol lemmas",
        "Category:Northern Catanduanes Bikol lemmas",
        "Category:Southern Catanduanes Bikol lemmas",
        "Category:Masbateño lemmas",
        "Category:Northern Sorsogon Bikol lemmas",
        "Category:Southern Sorsogon Bikol lemmas",
        "Category:Bikol lemmas",
        "Category:Albay Bikol lemmas",
        "Category:Pandán Bikol lemmas"
    ]

    all_titles: set[str] = set()
    url = "https://en.wiktionary.org/w/api.php"

    logger.info(f"Fetching word lists from {len(categories)} categories...")
    headers = {"User-Agent": USER_AGENT}

    async with aiohttp.ClientSession(headers=headers) as session:
        for cat in categories:
            if len(all_titles) >= limit:
                break

            cmcontinue = None
            while True:
                async with wiktionary_limiter:
                    params = {
                        "action": "query",
                        "format": "json",
                        "list": "categorymembers",
                        "cmtitle": cat,
                        "cmtype": "page",
                        "cmnamespace": 0,
                        "cmlimit": 500
                    }
                    if cmcontinue:
                        params["cmcontinue"] = cmcontinue

                    try:
                        async with session.get(url, params=params, timeout=10) as response:
                            response.raise_for_status()
                            data = await response.json()

                            if "query" in data and "categorymembers" in data["query"]:
                                for item in data["query"]["categorymembers"]:
                                    all_titles.add(item["title"])

                                logger.info(f"  [+] {cat}: Collected {len(all_titles)} total titles...")

                                if "continue" in data and "cmcontinue" in data["continue"]:
                                    cmcontinue = data["continue"]["cmcontinue"]
                                    if len(all_titles) >= limit:
                                        break
                                else:
                                    break
                            else:
                                break
                    except aiohttp.ClientError as e:
                        raise ExternalServiceError("Wiktionary", f"Request failed: {str(e)}")
                    except Exception as e:
                        logger.error(f"Error fetching category {cat}: {e}")
                        break

    return list(all_titles)

@api_retry
@wiktionary_breaker
@async_cached(ttl=604800) # Cache word details for 7 days
async def scrape_word_details(word: str) -> ScrapedWord | None:
    """Fetches raw wikitext and parses details including etymology and synonyms."""
    url = "https://en.wiktionary.org/w/api.php"
    source_url = f"https://en.wiktionary.org/wiki/{word.replace(' ', '_')}"
    params = {
        "action": "parse",
        "format": "json",
        "page": word,
        "prop": "wikitext" # Only need wikitext
    }

    headers = {"User-Agent": USER_AGENT}
    async with wiktionary_limiter:
        async with aiohttp.ClientSession(headers=headers) as session:
            try:
                async with session.get(url, params=params, timeout=10) as response:
                    response.raise_for_status()
                    data = await response.json()

                    if "parse" not in data or "wikitext" not in data["parse"]:
                        return None

                    wikitext = data["parse"]["wikitext"]["*"]
                    
                    valid_dialects = [
                        "Central Bikol", "Rinconada Bikol", "Masbateño",
                        "Northern Catanduanes Bikol", "Southern Catanduanes Bikol",
                        "Northern Sorsogon Bikol", "Southern Sorsogon Bikol", "Bikol"
                    ]

                    lines = wikitext.split('\n')
                    current_dialect = "Bikol"
                    found_bikol_section = False
                    
                    etymology = ""
                    synonyms = []
                    results: list[dict] = []
                    
                    # Extract Etymology (Level 3 or 4)
                    etym_match = re.search(r'===\s*Etymology\s*===\n(.*?)\n\n', wikitext, re.DOTALL | re.IGNORECASE)
                    if etym_match:
                        etymology = clean_wiki_markup(etym_match.group(1))

                    # Extract Synonyms (Level 3 or 4)
                    syn_match = re.search(r'===\s*Synonyms\s*===\n(.*?)\n\n', wikitext, re.DOTALL | re.IGNORECASE)
                    if syn_match:
                        syn_block = syn_match.group(1)
                        synonyms = [clean_wiki_markup(s.lstrip('* ')) for s in syn_block.split('\n') if s.strip().startswith('*')]

                    pronunciation = ""
                    audio_url = ""
                    ipa_match = re.search(r'\{\{IPA\|bcl\|/([^/]+)/', wikitext)
                    if ipa_match:
                        pronunciation = ipa_match.group(1)
                    
                    # Extract Audio (Wiktionary template {{audio|bcl|...}})
                    audio_match = re.search(r'\{\{audio\|bcl\|([^|}]+)', wikitext)
                    if audio_match:
                        filename = audio_match.group(1).replace(' ', '_')
                        # Construct a generic Wiktionary file URL (requires md5 hashing for precise paths, but often follows this pattern)
                        # We'll use a placeholder or try to get the actual URL from the parse API in a more robust way if needed
                        audio_url = f"https://commons.wikimedia.org/wiki/Special:FilePath/{filename}"

                    pos = ""
                    for line in lines:
                        line = line.strip()
                        dialect_match = re.match(r'^==\s*([^=]+?)\s*==$', line)
                        if dialect_match:
                            dialect_header = dialect_match.group(1).strip()
                            if dialect_header in valid_dialects:
                                current_dialect = dialect_header
                                found_bikol_section = True
                            else:
                                found_bikol_section = False
                            continue

                        if not found_bikol_section:
                            continue

                        pos_match = re.match(r'^={3,5}\s*([^=]+?)\s*={3,5}$', line)
                        if pos_match:
                            potential_pos = pos_match.group(1).strip()
                            if potential_pos not in ["Etymology", "Pronunciation", "References", "Further reading", "Derived terms", "Related terms", "Anagrams", "Synonyms"]:
                                pos = potential_pos
                            continue

                        if pos and line.startswith('#'):
                            clean_def = clean_wiki_markup(line.lstrip('#').strip())
                            if clean_def:
                                results.append({
                                    "bikol": word,
                                    "english": clean_def,
                                    "pos": pos,
                                    "wiktionary_dialect": current_dialect,
                                    "pronunciation": pronunciation,
                                    "audio_url": audio_url,
                                    "etymology": etymology,
                                    "synonyms": synonyms,
                                    "source_url": source_url
                                })
                                pos = ""

                    if results:
                        return ScrapedWord(**results[0])
                    return None

            except aiohttp.ClientError as e:
                raise ExternalServiceError("Wiktionary", f"Request failed: {str(e)}")
            except Exception as e:
                logger.error(f"Error scraping {word}: {e}")
                return None

@api_retry
@groq_breaker
@async_cached(ttl=604800)
async def enrich_with_ai(data: ScrapedWord) -> EnrichedData:
    """Uses Groq API (Qwen model) with JSON mode to enrich word data with confidence scores."""
    system_prompt = "You are a specialized dictionary data generator for Bikol languages. You MUST output ONLY raw JSON. No markdown. Your output must perfectly match the requested schema."

    user_prompt = f"""
    Enrich this dictionary entry:
    Bikol: {data.bikol}
    English: {data.english}
    POS: {data.pos}
    Wiktionary Header: {data.wiktionary_dialect}

    Required JSON keys:
    1. "tagalog": Translate the English definition into Tagalog. Be precise.
    2. "dialect": Map "{data.wiktionary_dialect}" to the best match in: ["Central Bikol (Naga)", "Central Bikol (Albay)", "Rinconada Bikol", "Northern Catanduanes Bikol", "Southern Catanduanes Bikol", "Masbateño", "Northern Sorsogon Bikol", "Southern Sorsogon Bikol", "General Bikol"].
    3. "category": Best fit in: ["Greetings", "Basic", "People", "Family", "Body", "Food", "Nature", "Animals", "Actions", "Descriptors", "Numbers", "Colors", "Time", "Places", "Health & Medicine", "Daily Life", "Relationships", "Weather", "Clothing", "Education", "Technology", "Sports", "Music", "Travel", "Shopping", "Emotions", "House", "Work", "Culture", "Religion", "Tools", "Transportation", "Kitchen", "Environment"].
    4. "example_bikol": A short, natural sentence in Bikol using the word.
    5. "example_english": The English translation of the Bikol sentence.
    6. "confidence": A float from 0.0 to 1.0 representing your confidence in this translation and enrichment. If the input is ambiguous or technical, lower the score.

    Format: {{"tagalog": "...", "dialect": "...", "category": "...", "example_bikol": "...", "example_english": "...", "confidence": 0.0}}
    """

    fallback = EnrichedData()

    async with groq_semaphore:
        try:
            # Respect rate limits for Groq
            completion = await groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.1,
                timeout=25
            )

            content = completion.choices[0].message.content
            if not content:
                return fallback

            try:
                enriched_json = json.loads(content)
                return EnrichedData(**enriched_json)
            except (json.JSONDecodeError, ValueError) as e:
                logger.warning(f"  [!] AI validation failed for {data.bikol}: {e}")
                return fallback

        except Exception as e:
            logger.error(f"[!] Groq error for {data.bikol}: {e}")
            raise ExternalServiceError("Groq", str(e))

@supabase_breaker
async def upsert_batch(batch: list[dict]) -> None:
    """Helper to upsert a batch of words with circuit breaker protection."""
    try:
        supabase.table("words").upsert(batch, on_conflict="bikol").execute()
    except Exception as e:
        logger.error(f"  [!] Batch upsert error: {e}")
        raise ExternalServiceError("Supabase", str(e))

async def process_word(word: str) -> dict | None:
    """Complete pipeline for a single word."""
    try:
        scraped_data = await scrape_word_details(word)
        if not scraped_data:
            return None

        enriched_info = await enrich_with_ai(scraped_data)

        # Combine and validate with Pydantic
        entry = DictionaryEntry(
            bikol=scraped_data.bikol,
            english=scraped_data.english,
            tagalog=enriched_info.tagalog,
            pos=scraped_data.pos,
            dialect=enriched_info.dialect,
            pronunciation=scraped_data.pronunciation,
            audio_url=scraped_data.audio_url,
            category=enriched_info.category,
            example_bikol=enriched_info.example_bikol,
            example_english=enriched_info.example_english,
            confidence=enriched_info.confidence,
            source_url=scraped_data.source_url
        )
        return entry.model_dump()

    except Exception as e:
        logger.error(f"  [!] Error processing {word}: {e}")
        return None

async def main() -> None:
    logger.info("Step 1: Checking database for existing words...")
    try:
        response = supabase.table("words").select("bikol, tagalog").execute()
        existing_data = response.data
        existing_words = {item["bikol"] for item in existing_data}
        words_needing_tagalog = [item["bikol"] for item in existing_data if not item.get("tagalog")]
    except Exception as e:
        logger.error(f"Error querying Supabase: {e}")
        return

    logger.info("\nStep 2: Fetching word list from Wiktionary...")
    all_wiktionary_words = await get_wiktionary_words(limit=5000)
    new_words = [w for w in all_wiktionary_words if w not in existing_words]
    words_to_process = words_needing_tagalog + new_words

    if not words_to_process:
        logger.info("No words to process. Exiting.")
        return

    logger.info(f"\nStep 3: Processing {len(words_to_process)} total words concurrently...")
    
    batch_size = 10
    for i in range(0, len(words_to_process), batch_size):
        chunk = words_to_process[i:i + batch_size]
        logger.info(f"Processing chunk {i//batch_size + 1} ({len(chunk)} words)...")
        
        tasks = [process_word(w) for w in chunk]
        results = await asyncio.gather(*tasks)
        
        valid_results = [r for r in results if r]
        if valid_results:
            logger.info(f"  [↑] Upserting batch of {len(valid_results)}...")
            await upsert_batch(valid_results)

if __name__ == "__main__":
    asyncio.run(main())
