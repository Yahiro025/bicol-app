import pytest
import os
import json
from ai_wiktionary_scraper import clean_wiki_markup, scrape_word_details
from python_utils import ScrapedWord

def test_clean_wiki_markup():
    assert clean_wiki_markup("[[test]]") == "test"
    assert clean_wiki_markup("{{gloss|note}}") == "(note)"
    assert clean_wiki_markup("''bold''") == "bold"
    assert clean_wiki_markup("") == ""

@pytest.mark.asyncio
async def test_scrape_word_details_mock(mocker):
    # Mocking aiohttp session is complex, better use aioresponses for network
    # For now, let's test a simple logic if we can mock the session response
    pass
