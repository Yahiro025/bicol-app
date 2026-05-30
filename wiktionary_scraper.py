import aiohttp
import asyncio
from bs4 import BeautifulSoup
import time
import logging
from python_utils import (
    logger, api_retry, wiktionary_breaker, supabase_breaker, 
    ExternalServiceError, DictionaryEntry, async_cached
)
from supabase import create_client, Client
import os
from aiolimiter import AsyncLimiter
from typing import Any

# --- CONFIGURATION ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Wiktionary API endpoint
WIKI_API_URL = "https://en.wiktionary.org/w/api.php"

# MediaWiki API recommends a descriptive User-Agent
HEADERS = {
    "User-Agent": "BikolDictScraper/1.0 (bennettpayoyo3.14@gmail.com)"
}

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

wiktionary_limiter = AsyncLimiter(1, 1)

@api_retry
@wiktionary_breaker
@async_cached(ttl=3600)
async def get_word_list(limit: int = 100) -> list[str]:
    """Fetches a list of Central Bikol lemma titles from English Wiktionary."""
    words: list[str] = []
    params = {
        "action": "query",
        "format": "json",
        "list": "categorymembers",
        "cmtitle": "Category:Central Bikol lemmas",
        "cmlimit": 50
    }
    
    async with aiohttp.ClientSession(headers=HEADERS) as session:
        while len(words) < limit:
            async with wiktionary_limiter:
                try:
                    async with session.get(WIKI_API_URL, params=params, timeout=10) as response:
                        response.raise_for_status()
                        data = await response.json()

                        if 'query' in data and 'categorymembers' in data['query']:
                            batch = [page['title'] for page in data['query']['categorymembers']]
                            words.extend(batch)
                            
                            if 'continue' in data:
                                params.update(data['continue'])
                            else:
                                break
                        else:
                            break
                except Exception as e:
                    logger.error(f"Request failed: {e}")
                    break
        
    return words[:limit]

@api_retry
@wiktionary_breaker
@async_cached(ttl=604800)
async def parse_word_data(word_title: str) -> dict[str, Any] | None:
    """Parses definition and other data for a specific word from en.wiktionary.org."""
    params = {
        "action": "parse",
        "format": "json",
        "page": word_title,
        "prop": "text|images|wikitext"
    }
    source_url = f"https://en.wiktionary.org/wiki/{word_title.replace(' ', '_')}"
    
    async with wiktionary_limiter:
        async with aiohttp.ClientSession(headers=HEADERS) as session:
            try:
                async with session.get(WIKI_API_URL, params=params, timeout=10) as response:
                    response.raise_for_status()
                    data = await response.json()
                    
                    if "parse" not in data: return None
                    
                    html_content = data['parse']['text']['*']
                    wikitext = data['parse']['wikitext']['*']
                    images = data['parse'].get('images', [])
                    soup = BeautifulSoup(html_content, 'html.parser')
                    
                    word_data = {
                        "bikol": word_title,
                        "english": None,
                        "pos": None,
                        "dialect": "General Bikol",
                        "example_bikol": None,
                        "example_english": None,
                        "synonyms": [],
                        "etymology": None,
                        "pronunciation": None,
                        "source_url": source_url,
                        "confidence": 0.8
                    }

                    # Heuristic for Central Bikol section
                    import re
                    # Look for Central Bikol header and its content
                    cb_match = re.search(r'==\s*Central Bikol\s*==\n(.*?)(?=\n==[^\s=])', wikitext, re.DOTALL | re.IGNORECASE)
                    cb_wikitext = cb_match.group(1) if cb_match else wikitext

                    # 2. Etymology
                    etym_match = re.search(r'===\s*Etymology\s*===\n(.*?)\n\n', cb_wikitext, re.DOTALL | re.IGNORECASE)
                    if etym_match:
                        word_data["etymology"] = etym_match.group(1).strip()

                    # 3. Synonyms
                    syn_match = re.search(r'===\s*Synonyms\s*===\n(.*?)\n\n', cb_wikitext, re.DOTALL | re.IGNORECASE)
                    if syn_match:
                        word_data["synonyms"] = [s.strip('* ') for s in syn_match.group(1).split('\n') if s.strip().startswith('*')]

                    # 4. Translation & POS (from HTML for better structure)
                    # Find the Central Bikol header in HTML
                    cb_header = soup.find(['h2', 'h3'], string=lambda x: x and 'Central Bikol' in x)
                    if cb_header:
                        container = cb_header.find_parent() or soup
                        # Look for POS headers within this section
                        for h in container.find_all(['h3', 'h4']):
                            if h.get_text().strip() in ['Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun']:
                                word_data["pos"] = h.get_text().strip()
                                def_list = h.find_next_sibling('ol')
                                if def_list:
                                    first_def = def_list.find('li')
                                    if first_def:
                                        word_data["english"] = first_def.get_text().split('\n')[0].strip()
                                        # Examples often inside the same <li>
                                        example = first_def.find('i')
                                        if example:
                                            word_data["example_bikol"] = example.get_text().strip()
                                            ex_trans = example.find_next_sibling('span', class_='e-translation')
                                            if ex_trans: word_data["example_english"] = ex_trans.get_text().strip()
                                break

                    return word_data

            except Exception as e:
                logger.error(f"Error parsing {word_title}: {e}")
                return None


@supabase_breaker
def upsert_to_supabase(data: dict[str, Any]) -> Any:
    """Upserts word data into Supabase with validation."""
    try:
        # Validate with Pydantic before upsert
        entry = DictionaryEntry(**data)
        result = supabase.table("words").upsert(entry.model_dump(), on_conflict="bikol").execute()
        return result
    except Exception as e:
        logger.error(f"Error upserting to Supabase: {e}")
        raise ExternalServiceError("Supabase", str(e))

async def main() -> None:
    logger.info("Fetching word list from bcl.wiktionary.org...")
    try:
        word_titles = await get_word_list(limit=100)
    except ExternalServiceError as e:
        logger.error(f"Failed to fetch word list: {e}")
        return

    logger.info(f"Found {len(word_titles)} words. Starting extraction...")
    
    count = 0
    for title in word_titles:
        logger.info(f"Processing: {title}")
        try:
            word_data = await parse_word_data(title)
            if word_data and word_data["bikol"]:
                await upsert_to_supabase(word_data)
                count += 1
        except ExternalServiceError as e:
            logger.error(f"  [!] Skipping {title} due to service error: {e}")
        
    logger.info(f"Finished. Processed and upserted {count} words.")

if __name__ == "__main__":
    asyncio.run(main())
