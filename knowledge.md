# Project Knowledge — Bikol Dictionary (bikoldict)

## What This Is
A full-stack Bikol language dictionary and learning platform ("The Living Archive"). Preserves and promotes Bikol through AI-enriched data, multi-dialect support, cross-platform utility (web + Android/iOS via Capacitor), and interactive learning tools.

## Quickstart

### Prerequisites
- [Bun](https://bun.sh/) — primary runtime/package manager
- Python 3.10+ (for scrapers/audit/data pipeline)
- Supabase project + Groq AI API key

### Commands
```bash
bun install          # Install JS dependencies
bun dev              # Start Next.js dev server (localhost:3000)
bun run build        # Production build (add NEXT_PUBLIC_PLATFORM=mobile for mobile)
bun run start        # Start production server
bun run lint         # Next.js lint (ESLint)
bun test             # Run TS/JS tests (bun test)
pip install -r requirements.txt  # Install Python deps
pytest               # Run Python tests
bunx prisma generate # Generate Prisma client
bunx prisma db push  # Push schema to Supabase
bunx prisma migrate dev  # Create & apply new migration
```

### CI
- GitHub Actions: `nextjs-ci.yml` (lint + build) on push/PR to main
- Weekly data pipeline: `data-pipeline.yml` (scrapers + audit)

## Project Structure

```
app/          — Next.js App Router pages + API routes (16 routes)
  api/        — API endpoints: search, word, conjugations, browse, frequency, learn, drills, submit
components/  — React components (SearchBar, WordCard, VerbConjugator, Quiz, Flashcards, etc.)
lib/         — Shared utilities (prisma, conjugator, supabase, groq, offline, utils, word-search)
scripts/     — Data pipeline scripts
  py/       — Python scripts (scrapers, audit, frequency, PDF extraction)
  ts/       — TypeScript scripts (merge, migrate, enrichment, sync, dedup)
  js/       — JavaScript scripts
prisma/      — DB schema (Prisma 7) + migrations (PostgreSQL via Supabase)
tests/       — Test files (bun:test for TS, pytest for Python)
data/        — Audit progress, purge queue, Mintz verb extracts
hooks/       — Custom React hooks (useLanguageMode)
android/     — Capacitor Android native app
```

## Architecture

### Data Flow
1. **Scraping pipeline** (Python): Wiktionary → raw word data → Supabase
2. **AI enrichment** (Groq SDK, qwen3-32b): Generates example sentences, missing Tagalog, dialect tags, confidence scores
3. **Mintz PDF extraction** (Python/pdfplumber): Extracts normalized linguistic data from authoritative texts
4. **Normalized schema**: Roots → Definitions → Conjugations → ExampleSentences; plus legacy `words` table
5. **Client rendering**: Next.js SSR/SSG → Supabase/Prisma queries → React components

### Design System ("The Living Archive")
- **Resting Rigor**: Cards at rest have 1px borders, no shadows. Flat appearance.
- **Responsive Bloom**: On hover — blue-tinted shadow, -4px lift, border shifts to blue-500/30.
- **Colors**: Deep zinc background (#09090b), Bicolano Sea Blue (#3b82f6), Community Purple (#a855f7).
- **Typography**: Clash Display (headings) + Inter (body). Bold word vs. regular definition.
- **Dark mode**: Class-based (`.dark` on `<html>`), toggled by `ThemeToggle` component.
- **Glass cards**: `glass-effect` class with backdrop-blur.
- **Touch targets**: Minimum 44×44px for all interactive elements.

### Key Libraries
- `next`, `react` 19 — Framework
- `tailwindcss` v4 — Styling (`@import "tailwindcss"`, class-based dark mode via `@custom-variant dark`)
- `framer-motion` — Animations (respects `prefers-reduced-motion`)
- `@prisma/client` 7 — ORM (PostgreSQL via Supabase)
- `groq-sdk` — AI enrichment
- `clsx` + `tailwind-merge` — Class merging (`cn()` utility in `lib/utils.ts`)
- `@capacitor/*` v8 — Mobile bridge
- `lucide-react` — Icons
- `zod` — Validation
- `next-themes` — Theme provider
- `idb` — Offline/local DB

### Notable Python Dependencies
- `beautifulsoup4`, `aiohttp` — Scraping
- `pdfplumber`, `pdfminer.six` — PDF extraction
- `tenacity`, `pybreaker`, `aiolimiter` — Resilience & rate limiting
- `groq` / `google-genai` — AI enrichment

## Key Patterns & Conventions

### Code Patterns
- **Path alias**: `@/` maps to project root (e.g., `@/components/SearchBar`, `@/lib/utils`)
- **CSS utility**: `cn(...)` for conditional class merging
- **Prisma**: Singleton via `lib/prisma.ts` (global for dev hot reload)
- **Conjugator**: `conjugateVerbMintz(root, focusClass)` + `conjugateBikolVerb(root, affixPair, preferredFocus?)` in `lib/conjugator.ts`
- **API routes**: App Router route handlers in `app/api/<name>/route.ts`
- **Bun runtime**: Use `bun` instead of `node`, `bunx` instead of `npx`
- **Environment**: `.env` file auto-loaded by Bun (no dotenv needed)

### Styling Conventions
- Tailwind CSS v4: Use `@import "tailwindcss"` not `@tailwind base/components/utilities`
- Dark mode via `.dark` class on `<html>` — set via `next-themes` ThemeProvider
- No static shadows on cards at rest
- Word entries: Bikol = Blue-500 bold, English/Tagalog = Zinc-400 muted
- Semantic HTML for entries: `<dl>`, `<dt>`, `<dd>` with ARIA labels

### Database Conventions
- Two schemas: legacy `words` table + normalized `roots`/`definitions`/`conjugations`/`example_sentences`
- Focus classes: `ON_CLASS`, `I_CLASS`, `AN_CLASS`, `MAG_INTRANSITIVE`, `UNKNOWN`
- User submissions go to `user_submissions` table (status: pending/approved/rejected)
- Flashcards tracked in `user_flashcards` with spaced repetition fields

### Design Guidelines
- Avoid "Sterile Machine Translation" look — no generic Google Translate clone feel
- Avoid "Web 1.0 Text Wall" — use spacing and cards to break up content
- Avoid "Overly Gamified/Childish" — no Duolingo-style aggressive gamification
- Use vertical spacing and card containers to structure content
- Ensure WCAG AA compliance (high-contrast legibility)
- Disable complex motion for `prefers-reduced-motion` users

## Implicit Rules & Gotchas

- **Always use Bun**, not Node.js (`bun dev`, `bun test`, `bunx`, etc.)
- **PostCSS** is used for Tailwind v4 (`@tailwindcss/postcss` plugin)
- **No `next-pwa`** currently active (commented out in next.config.mjs)
- **Mobile builds**: Set `NEXT_PUBLIC_PLATFORM=mobile` env var for static export
- **Prisma 7**: Uses `@prisma/adapter-pg` with `pg` pool — SSL enabled for Supabase connections
- **TypeScript strict mode** enabled with `noUncheckedIndexedAccess` and `verbatimModuleSyntax`
- **Prettier**: semicolons, double quotes, trailing commas, 90 print width

## AI Agent Instructions

### Context7 / Live Docs
- **Always use `researcher_docs` (powered by Context7) when you need up-to-date library/framework documentation** — before writing code that uses any library, check the latest API via `researcher_docs` to avoid hallucinated or outdated APIs.
- In particular, use `researcher_docs` for: Next.js, React, Prisma, Tailwind CSS, Framer Motion, Capacitor, Supabase, Groq SDK, and any other dependency in `package.json` or `requirements.txt`.
- **Do not rely on training data alone** for specific API signatures, configuration options, or version-specific behavior.
