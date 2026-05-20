# 🌋 Bikol Dictionary: The Living Archive

A professional, full-stack dictionary and learning platform for the Bikol language, bridging academic precision with modern accessibility. This project serves as a "Living Archive," preserving cultural heritage through high-fidelity data extraction, AI-enriched linguistics, multi-dialect support, and cross-platform utility.

---

## ✨ Core Pillars & Features

### 🏛️ Academic Authority & The Mintz Architecture
Data is treated with the reverence of an archive. The core database schema implements a normalized architecture based on the authoritative works of Malcolm W. Mintz. 
- **Normalized Linguistic Models:** Roots, Definitions, Conjugations, and Example Sentences are strictly modeled.
- **Automated PDF Extraction:** Sophisticated Python pipelines (`scripts/extract_mintz_pdfs.py`) parse complex focus types (Actor/Object) and series (Ability/Causative) directly from linguistic texts.
- **Wiktionary Integration:** Automated fetching and parsing of Central Bikol lemmas, etymologies, and IPA pronunciations.

### 🤖 AI-Powered Data Enrichment
Leveraging the Groq API (specifically `qwen/qwen3-32b`), the platform automatically enriches scraped data.
- Generates natural example sentences in Bikol and English.
- Identifies missing Tagalog translations and regional dialects.
- Assigns AI confidence scores to ensure data integrity before surfacing to users.

### 🎯 Interactive Learning & Practice
Beyond a static database, the app features dynamic tools for functional fluency:
- **Substitution Drills:** Interactive modules (`/learn`) based on Mintz's sentence patterns to build instinctual grammar recall.
- **Verb Conjugator:** Real-time morphological breakdowns showing how roots like *bakal* transform across tenses and focus types.
- **Spaced Repetition Flashcards:** User-specific mastery tracking for long-term vocabulary retention.

### 📱 Modern Accessibility & Cross-Platform
Built for the diaspora and local learners alike.
- **Web:** Optimized for speed and SEO on Vercel with Next.js App Router.
- **PWA:** Installable on any device with offline-first capabilities.
- **Native Mobile:** Compiled to Android and iOS via Capacitor (`NEXT_PUBLIC_PLATFORM=mobile`).

---

## 🛠 Tech Stack

### Frontend & Mobile
- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS v4 (Vanilla CSS philosophy)
- **Motion:** Framer Motion (Responsive Bloom effects)
- **Bridge:** Capacitor (Native Mobile)

### Backend & Data
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma 7
- **AI Integration:** Groq SDK (`qwen3-32b` for enrichment)
- **Data Pipeline:** Python 3.10+ (BeautifulSoup4, aiohttp, pdfplumber)
- **Runtime:** Bun (Primary package manager and test runner)

---

## 🤖 Agentic Architecture

This repository is maintained and governed by specialized AI subagents (located in `.gemini/agents/`):
- **Archive Designer:** Enforces the "Living Archive" design system, Tailwind v4, and WCAG AA compliance.
- **Data Specialist:** Manages Python scrapers, async rate-limiting (Tenacity/aiolimiter), and Qwen enrichment prompts.
- **Bikol Expert:** Ensures linguistic integrity, semantic contrast, and a dignified tone.
- **DB Architect:** Manages Prisma schema evolution and Supabase migrations.
- **Mobile Expert:** Handles Capacitor Web-to-Native bridging and touch-target accessibility.
- **Learn Engine:** A self-improvement agent activated via `\learn` to diagnose bugs and audit rulesets.

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (Primary package manager/runtime)
- [Python 3.10+](https://www.python.org/)
- [Supabase](https://supabase.com/) account and project
- [Groq AI](https://groq.com/) API Key

### 1. Web Development
```bash
# Install dependencies
bun install

# Configure environment
cp .env.example .env

# Initialize database
bunx prisma generate
bunx prisma db push

# Run development server
bun dev
```

### 2. Data Pipeline
The scrapers and audit tools are located in the root and `/scripts`.
```bash
# Setup Python environment
python -m venv venv
source venv/bin/activate # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Run the AI-enriched Wiktionary scraper
python ai_wiktionary_scraper.py

# Run the Mintz PDF extractor
python scripts/extract_mintz_pdfs.py

# Migrate flat data to Mintz Normalized Schema
bun run scripts/migrate-to-mintz.ts
```

### 3. Mobile Deployment
```bash
# Export static bundle
NEXT_PUBLIC_PLATFORM=mobile bun run build

# Sync with Capacitor
bunx cap sync android
bunx cap open android
```

---

## 🎨 Design Philosophy: The Living Archive

This system balances **Resting Rigor** with **Responsive Bloom**.
- **Resting Rigor:** Surfaces at rest use clean 1px borders and zinc-based neutrals. Shadows are prohibited to maintain a structured, authoritative feel.
- **Responsive Bloom:** Interactive elements come alive on hover with blue-tinted shadows ("Bicolano Sea Blue") and subtle lifts, inviting community interaction.
- **Semantic Contrast:** Bikol words are given visual prominence (Blue-500, bold), while bridge languages (English/Tagalog) are secondary (Zinc-400).

---

## 📄 License
This project is licensed under the MIT License.
