# 🌋 Bikol Dictionary: The Living Archive

A professional, full-stack dictionary and learning platform for the Bikol language, bridging academic precision with modern accessibility. This project serves as a "Living Archive," preserving cultural heritage through AI-enriched data, multi-dialect support, and cross-platform utility.

---

## ✨ Core Pillars

### 🏛️ Academic Authority
Data is treated with the reverence of an archive. We source core lemmas from authoritative sources like Wiktionary, ensuring high-contrast, precisely gridded presentation of linguistic data.

### 🤖 AI-Powered Enrichment
Leveraging Groq AI (Llama 3.3 / Qwen), the platform automatically generates Tagalog translations, natural example sentences, and confidence scores to provide a rich context for every word.

### 🤝 Community & Growth
Beyond a static database, the app features a **Learning Module** with spaced-repetition flashcards and a **Submission System** for users to contribute new words and regional dialects.

### 📱 Modern Accessibility
Built for the diaspora and local learners alike.
- **Web**: Optimized for speed and SEO on Vercel.
- **PWA**: Installable on any device with offline-first caching via IndexedDB.
- **Native Mobile**: Compiled to Android and iOS via Capacitor.

---

## 🛠 Tech Stack

### Frontend & Mobile
- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS v4 (Vanilla CSS philosophy)
- **Motion**: Framer Motion (Responsive Bloom effects)
- **Bridge**: Capacitor (Native Mobile)

### Backend & Data
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **AI**: Groq SDK (Llama 3.3 / Qwen)
- **Pipeline**: Python 3.10+ (BeautifulSoup4, Scrapy)
- **Runtime**: Bun (Primary recommendation)

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

# Run a scraper
python wiktionary_scraper.py
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
- **Resting Rigor**: Surfaces at rest use clean 1px borders and zinc-based neutrals. Shadows are prohibited to maintain a structured, authoritative feel.
- **Responsive Bloom**: Interactive elements come alive on hover with blue-tinted shadows ("Bicolano Sea Blue") and subtle lifts, inviting community interaction.

---

## 📄 License
This project is licensed under the MIT License.
