import aiohttp
import asyncio
import logging
from aiolimiter import AsyncLimiter
from python_utils import logger, api_retry, wiktionary_breaker, ExternalServiceError, async_cached

# --- CONFIGURATION ---
WIKI_API_URL = "https://en.wiktionary.org/w/api.php"
HEADERS = {
    "User-Agent": "BikolDictScraper/1.0 (https://github.com/Yahiro025)"
}

CATEGORIES = [
    "Category:Central Bikol lemmas",
    "Category:Rinconada Bikol lemmas",
    "Category:Masbateño lemmas",
    "Category:Northern Catanduanes Bikol lemmas",
    "Category:Southern Catanduanes Bikol lemmas",
    "Category:Northern Sorsogon Bikol lemmas",
    "Category:Southern Sorsogon Bikol lemmas",
    "Category:Bikol lemmas"
]

wiktionary_limiter = AsyncLimiter(1, 1)

@api_retry
@wiktionary_breaker
@async_cached(ttl=3600)
async def get_category_count(category_name: str) -> int:
    """Fetches the number of pages in a given category."""
    params = {
        "action": "query",
        "format": "json",
        "titles": category_name,
        "prop": "categoryinfo"
    }
    
    async with wiktionary_limiter:
        async with aiohttp.ClientSession(headers=HEADERS) as session:
            try:
                async with session.get(WIKI_API_URL, params=params, timeout=10) as response:
                    response.raise_for_status()
                    data = await response.json()
                    
                    pages = data.get('query', {}).get('pages', {})
                    for page_id in pages:
                        info = pages[page_id].get('categoryinfo', {})
                        return int(info.get('pages', 0))
            except aiohttp.ClientError as e:
                raise ExternalServiceError("Wiktionary", f"Request failed: {str(e)}")
            except Exception as e:
                logger.error(f"Error fetching count for {category_name}: {e}")
                return 0
    return 0

async def main() -> None:
    logger.info(f"{'Category':<45} | {'Word Count':<10}")
    logger.info("-" * 58)
    
    tasks = [get_category_count(cat) for cat in CATEGORIES]
    counts = await asyncio.gather(*tasks)
    
    grand_total = 0
    for cat, count in zip(CATEGORIES, counts):
        logger.info(f"{cat:<45} | {count:<10}")
        grand_total += count
        
    logger.info("-" * 58)
    logger.info(f"{'GRAND TOTAL':<45} | {grand_total:<10}")

if __name__ == "__main__":
    asyncio.run(main())
