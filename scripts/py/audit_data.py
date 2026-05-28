import os
import asyncio
import logging
from supabase import create_client, Client
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# Load environment
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async def audit_data():
    logger.info("Starting data audit...")
    
    try:
        # Fetch words with low confidence or missing critical fields
        response = supabase.table("words").select("*").or_("confidence.lt.0.7,source_url.is.null,english.is.null").execute()
        problematic_records = response.data
        
        if not problematic_records:
            logger.info("No problematic records found. Data quality is high!")
            return

        logger.info(f"Found {len(problematic_records)} records needing attention.")
        
        for record in problematic_records:
            issues = []
            if record.get("confidence", 1.0) < 0.7:
                issues.append(f"low confidence ({record['confidence']})")
            if not record.get("source_url"):
                issues.append("missing source_url")
            if not record.get("english"):
                issues.append("missing english definition")
            
            logger.warning(f"Word: '{record['bikol']}' - Issues: {', '.join(issues)}")

        # Summary of issues
        low_conf = len([r for r in problematic_records if r.get("confidence", 1.0) < 0.7])
        no_source = len([r for r in problematic_records if not r.get("source_url")])
        
        logger.info("--- Audit Summary ---")
        logger.info(f"Total problematic records: {len(problematic_records)}")
        logger.info(f"Low confidence (< 0.7): {low_conf}")
        logger.info(f"Missing source URL: {no_source}")

    except Exception as e:
        logger.error(f"Audit failed: {e}")

if __name__ == "__main__":
    asyncio.run(audit_data())
