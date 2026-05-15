import pytest
import os
import asyncio
from aioresponses import aioresponses
from ai_wiktionary_scraper import scrape_word_details, get_wiktionary_words
from python_utils import ScrapedWord

@pytest.fixture
def mock_wiktionary():
    with open("tests/mocks/wiktionary_response.html", "r") as f:
        return f.read()

@pytest.mark.asyncio
async def test_scrape_word_details(mock_wiktionary):
    word = "magayon"
    url = f"https://en.wiktionary.org/w/api.php?action=parse&format=json&page={word}&prop=wikitext"
    
    with aioresponses() as m:
        # Mocking the wikitext response (simplified for unit test)
        mock_json = {
            "parse": {
                "wikitext": {
                    "*": "==Central Bikol==\n===Adjective===\n# beautiful"
                }
            }
        }
        m.get(url, payload=mock_json)
        
        result = await scrape_word_details(word)
        assert result is not None
        assert result.bikol == word
        assert result.english == "beautiful"
        assert "Central Bikol" in result.wiktionary_dialect
