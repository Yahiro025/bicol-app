import os
import time
import json
import logging
from groq import Groq
from python_utils import (
    logger, api_retry, groq_breaker, supabase_breaker, ExternalServiceError
)
from supabase import create_client, Client

# --- CONFIG ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
groq_client = Groq(api_key=GROQ_API_KEY)

@api_retry
@groq_breaker
def fix_translation(bikol: str, english: str, pos: str) -> str | None:
    """Force-fixes a single translation using the English definition."""
    prompt = f"""
    Task: Fix an inaccurate Tagalog translation in a dictionary.
    
    Source:
    - Bikol Word: {bikol}
    - English Meaning: {english}
    - Part of Speech: {pos}
    
    INSTRUCTIONS:
    1. Translate the English Meaning "{english}" into Tagalog.
    2. STRICT RULE: DO NOT use the word "{bikol}" in your translation. 
    3. The translation MUST be actual Tagalog (e.g., if Bikol is 'Magayon' and English is 'Beautiful', the Tagalog MUST be 'Maganda').
    4. Return ONLY the Tagalog word, no extra text.
    """
    try:
        completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            timeout=20
        )
        content = completion.choices[0].message.content
        return content.strip() if content else None
    except Exception as e:
        logger.error(f"Error fixing {bikol}: {e}")
        raise ExternalServiceError("Groq", str(e))

def main() -> None:
    logger.info("Searching for suspicious translations (where Bikol == Tagalog)...")
    
    # 1. Fetch words where Tagalog might be a hallucination of the Bikol word
    try:
        res = supabase.table("words").select("bikol", "english", "pos", "tagalog").execute()
    except Exception as e:
        logger.error(f"Error querying Supabase: {e}")
        return
    
    to_fix = []
    for row in res.data:
        # If Bikol and Tagalog are identical, it's likely wrong (like Magayon/Magayon)
        bikol_val = row.get('bikol', '')
        tagalog_val = row.get('tagalog', '')
        if bikol_val.lower() == tagalog_val.lower() or not tagalog_val:
            to_fix.append(row)
            
    logger.info(f"Found {len(to_fix)} words to re-verify.")
    
    if not to_fix:
        return

    # Process in small batches to respect quota
    count = 0
    for item in to_fix[:50]: # Process 50 at a time
        bikol = item['bikol']
        logger.info(f"Fixing: {bikol}...")
        try:
            new_tagalog = fix_translation(bikol, item['english'], item['pos'])
            
            if new_tagalog and new_tagalog.lower() != bikol.lower():
                with supabase_breaker:
                    supabase.table("words").update({"tagalog": new_tagalog}).eq("bikol", bikol).execute()
                logger.info(f"  [✓] Updated to: {new_tagalog}")
                count += 1
            else:
                logger.info(f"  [!] AI still returned same word or failed.")
        except ExternalServiceError as e:
            logger.error(f"  [!] Skipping {bikol} due to service error: {e}")
            if "CircuitBreaker" in str(e):
                logger.warning("Circuit breaker is open. Sleeping for 30s...")
                time.sleep(30)
            
        time.sleep(3) # Heavy rate limiting for fixing
        
    logger.info(f"Finished. Fixed {count} translations.")

if __name__ == "__main__":
    main()
