import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY is missing in .env file")
    exit()

client = genai.Client(api_key=GEMINI_API_KEY)

print("Listing available models for your API key...")
print("--------------------------------------------------")

try:
    for m in client.models.list():
        # Just print the model name and its display name
        print(f"  {m.name} | {m.display_name}")
except Exception as e:
    print(f"Error listing models: {e}")
    print("\n[!] If you get a 403 or 404 error here, it means the 'Generative Language API' is not enabled on your Google Cloud Project. Let me know if you see this!")