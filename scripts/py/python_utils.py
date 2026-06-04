import os
import logging
import asyncio
from typing import Any
from dotenv import load_dotenv
from pydantic import BaseModel, Field, field_validator
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from groq import RateLimitError
import pybreaker
from aiocache import cached, Cache
from aiocache.serializers import JsonSerializer, NullSerializer

# --- LOGGING SETUP ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-5s %(name)s — %(message)s"
)
logger = logging.getLogger(__name__)

# --- ENVIRONMENT LOADING ---
ENV = os.getenv("ENV", "development")
env_file = f"config/.env.{ENV}"
if os.path.exists(env_file):
    load_dotenv(env_file)
    logger.info(f"Loaded environment config from {env_file}")
else:
    load_dotenv() # Fallback to .env in root
    logger.info("Loaded environment config from root .env or environment variables")

# --- CUSTOM EXCEPTIONS ---
class ExternalServiceError(Exception):
    """Custom exception for errors when calling external APIs."""
    def __init__(self, service: str, message: str):
        self.service = service
        self.message = message
        super().__init__(f"[{service}] {message}")

# --- CIRCUIT BREAKERS ---
# Trip after 5 consecutive failures, 30s recovery timeout
supabase_breaker = pybreaker.CircuitBreaker(fail_max=5, reset_timeout=30)
groq_breaker = pybreaker.CircuitBreaker(fail_max=5, reset_timeout=30)
wiktionary_breaker = pybreaker.CircuitBreaker(fail_max=5, reset_timeout=30)

# --- RETRY DECORATOR ---
# Optimized for Groq's RateLimitError (429)
# Try up to 5 times, exponential backoff starting at 4s up to 60s
api_retry = retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=4, max=60),
    retry=retry_if_exception_type(RateLimitError),
    reraise=True
)

# Global model config
GROQ_MODEL = "qwen/qwen3-32b"
from aiocache.backends.memory import SimpleMemoryCache
from diskcache import Cache as DiskCache

# --- CACHING SETUP ---
# Memory-based cache
def async_cached(ttl=3600):
    return cached(
        ttl=ttl,
        cache=SimpleMemoryCache,
        namespace="bikoldict",
        serializer=NullSerializer(),
    )

# Persistent file-based cache for expensive scrapers/API calls
disk_cache = DiskCache(".cache/bikoldict")

def disk_cached(ttl=604800):
    def decorator(func):
        def wrapper(*args, **kwargs):
            key = f"{func.__name__}:{args}:{kwargs}"
            if key in disk_cache:
                return disk_cache[key]
            result = func(*args, **kwargs)
            disk_cache.set(key, result, expire=ttl)
            return result
        return wrapper
    return decorator

# --- MODELS ---
class DictionaryEntry(BaseModel):
    bikol: str
    english: str | None = None
    tagalog: str | None = None
    pos: str | None = None
    dialect: str | None = "General Bikol"
    pronunciation: str | None = None
    etymology: str | None = None
    category: str | None = "General"
    example_bikol: str | None = None
    example_english: str | None = None
    synonyms: list[str] | None = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    source_url: str | None = None
    audio_url: str | None = None
    frequency_rank: int | None = None

    @field_validator('bikol')
    @classmethod
    def bikol_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Bikol word cannot be empty')
        return v.strip()

    @field_validator('synonyms', mode='before')
    @classmethod
    def empty_list_to_none(cls, v: Any) -> Any:
        if v == []:
            return None
        return v

class ScrapedWord(BaseModel):
    bikol: str
    english: str
    pos: str
    wiktionary_dialect: str
    pronunciation: str | None = ""
    etymology: str | None = None
    synonyms: list[str] | None = None
    audio_url: str | None = None
    source_url: str

    @field_validator('synonyms', mode='before')
    @classmethod
    def empty_list_to_none(cls, v: Any) -> Any:
        if v == []:
            return None
        return v


class EnrichedData(BaseModel):
    tagalog: str = ""
    dialect: str = "General Bikol"
    category: str = "General"
    example_bikol: str = ""
    example_english: str = ""
    synonyms: list[str] | None = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)

    @field_validator('synonyms', mode='before')
    @classmethod
    def empty_list_to_none(cls, v: Any) -> Any:
        if v == []:
            return None
        return v
