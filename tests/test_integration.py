import pytest
import os
from supabase import create_client, Client
from python_utils import DictionaryEntry

@pytest.fixture(scope="session")
def supabase_test_client():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or "your-test-project" in url:
        pytest.skip("Test Supabase credentials not configured")
    return create_client(url, key)

@pytest.mark.asyncio
async def test_supabase_upsert_and_delete(supabase_test_client):
    test_entry = DictionaryEntry(
        bikol="test_word_123",
        english="test english",
        tagalog="test tagalog",
        confidence=1.0
    )
    
    # Upsert
    try:
        supabase_test_client.table("words").upsert(test_entry.model_dump()).execute()
        
        # Verify
        res = supabase_test_client.table("words").select("*").eq("bikol", "test_word_123").execute()
        assert len(res.data) == 1
        assert res.data[0]["english"] == "test english"
        
        # Cleanup
        supabase_test_client.table("words").delete().eq("bikol", "test_word_123").execute()
    except Exception as e:
        pytest.fail(f"Supabase integration failed: {e}")
