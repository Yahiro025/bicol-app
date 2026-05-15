import os
import asyncio
from python_utils import logger, supabase_breaker
from supabase import create_client, Client
from collections import Counter
import re

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async def calculate_frequency() -> None:
    """Calculate frequency rank based on occurrence in example sentences."""
    logger.info("Calculating word frequency ranks...")
    
    try:
        # Fetch all words and their examples
        response = supabase.table("words").select("bikol, example_bikol").execute()
        records = response.data
        
        # Aggregate all example text
        all_text = " ".join([r.get("example_bikol") or "" for r in records]).lower()
        # Simple word tokenization
        words_in_corpus = re.findall(r'\b\w+\b', all_text)
        
        counts = Counter(words_in_corpus)
        # Sort words by frequency (descending)
        sorted_words = [w for w, _ in counts.most_common()]
        
        # Map words to their rank (1-based)
        rank_map = {word: i + 1 for i, word in enumerate(sorted_words)}
        
        logger.info(f"Calculated ranks for {len(rank_map)} unique words from corpus.")
        
        # Update records in Supabase
        for record in records:
            bikol = record["bikol"]
            rank = rank_map.get(bikol.lower())
            if rank:
                supabase.table("words").update({"frequency_rank": rank}).eq("bikol", bikol).execute()
        
        logger.info("Successfully updated frequency ranks in database.")

    except Exception as e:
        logger.error(f"Frequency calculation failed: {e}")

if __name__ == "__main__":
    asyncio.run(calculate_frequency())
