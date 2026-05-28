import pdfplumber
import re
import json
import os
from typing import List, Dict, Any

# Configuration
HOME = os.path.expanduser("~")
SOURCE_PDF = os.path.join(HOME, "Documents/PROJECTS/Bicol(sources)/Bicol Dictionary.pdf")
OUTPUT_JSON = "data/mintz_verbs_extracted.json"

# Diagnostic Flags
DEBUG_MODE = True
DEBUG_PAGES = range(46, 52) 

def determine_focus_type(affixes: List[str]) -> str:
    all_affixes = " ".join(affixes).upper()
    if any(x in all_affixes for x in ["-ON", "I-", "-AN", "-HON", "-HAN"]):
        return "OBJECT"
    if any(x in all_affixes for x in ["MAG-", "MANG-"]):
        return "ACTOR"
    return "ACTOR"

def determine_series(affixes: List[str]) -> str:
    all_affixes = " ".join(affixes).upper()
    if any(x in all_affixes for x in ["MAKA", "MA-"]):
        return "ABILITY"
    if "PA-" in all_affixes:
        return "CAUSATIVE"
    return "REGULAR"

# STRICT AFFIX REGEX: Only Uppercase, Hyphens, Plus, Comma
STRICT_AFFIX_REGEX = r"([A-Z0-9+\s,-]+[-])"

def parse_mintz_line(line: str) -> List[Dict[str, Any]]:
    entries = []
    # Strict Pattern to isolate Root, Affix, and Meaning
    # 1. Headword (Root): Uppercase/Accented, at start
    # 2. Affix Block: Stops before the first lowercase English word
    # 3. Meaning: Lowercase English text, stops before any trailing Uppercase Bikol examples
    pattern = re.compile(
        r"^(?P<headword>[A-ZÁÉÍÓÚ’\']{2,})\s+(?P<affix_block>" + STRICT_AFFIX_REGEX + r")\s*(?P<remainder>.*)",
        re.MULTILINE
    )

    match = pattern.search(line)
    if match:
        hw = match.group('headword').strip()
        if ' ' in hw:
            return entries
        
        affix_str = match.group('affix_block').strip()
        remainder = match.group('remainder').strip()

        # The remainder contains the English meaning followed by potential Bikol examples
        # English meanings start with lowercase (to, a, the, etc.)
        # Bikol examples are usually Uppercase/Accented
        # We also need to strip trailing digits (page numbers)
        
        # Regex to split English meaning from trailing Bikol examples/page numbers
        # English meaning is lowercase-heavy text.
        meaning_match = re.search(r"^(?P<meaning>[a-z\s\(\)\'\,\;\.\/]+)(?P<garbage>.*)", remainder)
        
        if meaning_match:
            meaning = meaning_match.group('meaning').strip()
            # Clean up trailing page numbers/garbage from the meaning itself
            meaning = re.sub(r'\s*\d+\s*$', '', meaning).strip()
            
            # If the meaning is empty or too short, reject
            if not meaning:
                return entries

            senses = [s.strip() for s in re.split(r';', meaning) if s.strip()]
            affix_list = [a.strip().upper() for a in affix_str.split(',') if a.strip()]
            
            if affix_list and senses:
                entries.append({
                    "headword": hw.lower(),
                    "affixPair": ", ".join(affix_list),
                    "senses": senses,
                    "focusType": determine_focus_type(affix_list),
                    "series": determine_series(affix_list)
                })
            
    return entries

def main():
    if not os.path.exists(SOURCE_PDF):
        print(f"Error: Source PDF not found at {SOURCE_PDF}")
        return

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    all_extracted_data = []
    
    print(f"Opening {SOURCE_PDF}...")
    try:
        with pdfplumber.open(SOURCE_PDF) as pdf:
            total_pages = len(pdf.pages)
            start_page = 46 
            end_page = 435 
            
            print(f"Processing pages {start_page+1} to {end_page+1}...")
            
            for i in range(start_page, end_page + 1):
                if i >= total_pages: break
                
                page = pdf.pages[i]
                text = page.extract_text()
                
                if DEBUG_MODE and i in DEBUG_PAGES:
                    print(f"\n--- DEBUG RAW TEXT: PAGE {i+1} ---")
                    print(text)
                    print(f"--- END DEBUG RAW TEXT: PAGE {i+1} ---\n")

                if text:
                    lines = text.split('\n')
                    buffer = ""
                    for line in lines:
                        # Logic to detect new entry start
                        if re.match(r"^[A-ZÁÉÍÓÚ’\']{2,}\s+[A-Z+-]+", line):
                            if buffer:
                                entries = parse_mintz_line(buffer)
                                all_extracted_data.extend(entries)
                            buffer = line
                        else:
                            buffer += " " + line
                    
                    if buffer:
                        entries = parse_mintz_line(buffer)
                        all_extracted_data.extend(entries)
                
                if (i + 1) % 50 == 0 or i == end_page:
                    print(f"Processed {i + 1}/{total_pages} pages... Found {len(all_extracted_data)} entries.")
        
        merged_data = {}
        for entry in all_extracted_data:
            key = (entry['headword'], entry['affixPair'])
            if key not in merged_data:
                merged_data[key] = entry
            else:
                for s in entry['senses']:
                    if s not in merged_data[key]['senses']:
                        merged_data[key]['senses'].append(s)

        final_data = list(merged_data.values())

        with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
            json.dump(final_data, f, indent=2, ensure_ascii=False)
        print(f"Extraction complete. Found {len(final_data)} unique verb entries.")
        if DEBUG_MODE:
            print(f"Debug mode: Extraction results saved to {OUTPUT_JSON} for verification.")
            
    except Exception as e:
        print(f"An error occurred during extraction: {e}")

if __name__ == "__main__":
    main()
