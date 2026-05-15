import os
import sys
import asyncio
from supabase import create_client, Client

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from python_utils import logger, supabase_breaker

# Get credentials after python_utils has potentially loaded them from config/
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

async def audit_data(confidence_threshold: float = 0.7) -> None:
    """Audit Supabase entries for low confidence or missing source attribution."""
    if not SUPABASE_URL or SUPABASE_URL == "your_dev_supabase_url":
        logger.error("SUPABASE_URL is missing or using placeholder. Please check config/.env.development")
        return

    logger.info(f"Starting data audit (Confidence Threshold: {confidence_threshold})...")
    
    try:
        # Initialize Supabase client locally to catch URL errors
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        
        # Fetch entries
        response = supabase.table("words").select("bikol, confidence, source_url").execute()
        records = response.data
        
        low_confidence = []
        missing_source = []
        
        for record in records:
            bikol = record.get("bikol")
            confidence = record.get("confidence", 0.0)
            source_url = record.get("source_url")
            
            if confidence < confidence_threshold:
                low_confidence.append((bikol, confidence))
            
            if not source_url:
                missing_source.append(bikol)
        
        # Report results
        logger.info("-" * 40)
        logger.info(f"Total Records Audited: {len(records)}")
        
        if low_confidence:
            logger.warning(f"Found {len(low_confidence)} Low Confidence Records (< {confidence_threshold}):")
            for bikol, conf in low_confidence[:10]:
                logger.warning(f"  - {bikol}: {conf}")
            if len(low_confidence) > 10:
                logger.warning(f"  ... and {len(low_confidence) - 10} more.")
        else:
            logger.info("No low confidence records found!")
            
        if missing_source:
            logger.warning(f"Found {len(missing_source)} Records Missing Source Attribution:")
            for bikol in missing_source[:10]:
                logger.warning(f"  - {bikol}")
            if len(missing_source) > 10:
                logger.warning(f"  ... and {len(missing_source) - 10} more.")
        else:
            logger.info("No records missing source attribution found!")
            
        logger.info("-" * 40)
        logger.info("Audit complete.")

    except Exception as e:
        logger.error(f"Audit failed: {e}")

if __name__ == "__main__":
    asyncio.run(audit_data())
