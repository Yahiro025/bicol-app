# 🌋 Bikol Dictionary & Learning App

A professional, full-stack Bikol dictionary platform featuring AI-powered enrichment, multi-dialect support, and cross-platform accessibility (Web, Android, iOS).

## ✨ Key Features
- **🔍 Intelligent Search**: Fuzzy matching across Bikol, English, and Tagalog using `pg_trgm`.
- **🤖 AI-Powered Enrichment**: Automatic Tagalog translations, example sentences, and confidence scoring via Groq AI.
- **🔊 Pronunciation**: Audio support extracted from Wiktionary with a built-in player.
- **📱 True Cross-Platform**: Next.js App Router frontend compiled to native mobile apps via Capacitor.
- **🌐 Offline-First**: PWA support with IndexedDB caching for recently viewed words.
- **🎓 Learning Module**: Spaced-repetition flashcards for vocabulary building.

## 🚀 Deployment

### Web (Vercel)
The web version is optimized for Vercel with full support for API routes and SSR.
1. Connect your repository to Vercel.
2. Configure environment variables (see `.env.example`).
3. Deploy!

### Mobile (Capacitor)
To generate the static bundle for native apps:
```bash
# Export as static site
NEXT_PUBLIC_PLATFORM=mobile bun run build
npx cap sync
```

### Data Automation (GitHub Actions)
The project includes a `data-pipeline` workflow that runs weekly to:
- Scrape new Bikol lemmas from Wiktionary.
- Enrich data with Groq AI.
- Audit database quality.

## 🛠 Tech Stack
- **Frontend**: Next.js (App Router), TypeScript, TailwindCSS, Lucide.
- **Mobile**: Capacitor.
- **Backend**: Python (Scrapers, Audit Tools).
- **Database**: Supabase (PostgreSQL) + Prisma ORM.
- **AI**: Groq (Llama 3.3 / Qwen).

## 📄 License
MIT
