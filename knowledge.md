# Project knowledge

Bikol Dictionary ("BIKOL") — a full-stack dictionary & learning platform for the Bikol language (Next.js + Supabase + Prisma).

## Quickstart
- **Setup:** `bun install` (runs `prisma generate` as postinstall)
- **Dev:** `bun dev` (Next.js dev server)
- **Test:** `bun test` (uses Bun's native test runner)
- **Lint:** `bun lint` (next lint)
- **Build:** `bun run build` (also used by Vercel)
- **Start prod:** `bun start`

## Architecture
- **Framework:** Next.js 16 App Router, React 19, TypeScript 6 (strict)
- **Styling:** Tailwind CSS v4 via `@tailwindcss/postcss`, Framer Motion for animations
- **Database:** Supabase (PostgreSQL), Prisma 7 ORM
- **Package manager / runtime:** Bun (exclusively — no npm/yarn)
- **Mobile:** Capacitor 8 for Android; set `NEXT_PUBLIC_PLATFORM=mobile` to trigger static export in `next.config.mjs`
- **AI:** Groq SDK (`qwen/qwen3-32b`) for data enrichment

### Key directories
| Path | Purpose |
|------|---------|
| `app/` | Next.js App Router pages, layouts, API routes |
| `components/` | React components (UI, dictionary, learn modules) |
| `lib/` | Core library: Prisma client, Groq, conjugator, fuzzy search, word-search, offline, constants, utils |
| `hooks/` | Client hooks (useLanguageMode) |
| `prisma/` | Schema & migrations |
| `scripts/ts/` | TypeScript data pipeline scripts (migration, enrich, dedup, sync) |
| `scripts/py/` | Python data pipeline (PDF extraction, frequency calc, data audit) |
| `tests/` | Test files (Bun for TS, pytest for Python) |

### Data flow
- **Prisma schema:** Normalized "Mintz" architecture — `Root` → `Definition` → `Conjugation` / `ExampleSentence`. Legacy `Word` table also exists. User-generated content via `UserSubmission` and `UserFlashcard`.
- **API routes:** `/api/search`, `/api/browse`, `/api/word`, `/api/learn`, `/api/submit`, `/api/conjugations/[word]`, `/api/drills`, `/api/dialogue`, `/api/frequency`
- **Python pipeline:** Scrapes Wiktionary & extracts Mintz PDFs; TypeScript scripts handle migration and enrichment via Groq AI.

## Conventions
- **Formatting:** Prettier — semicolons on, double quotes, trailing commas all, print width 90
- **Imports:** `verbatimModuleSyntax: true` — use `import type` for type-only imports. Path alias `@/*` maps to `./*`.
- **Strict TS:** `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`, strict mode on. Avoid `as any` casts.
- **Components:** Client components need `"use client"` directive. Prefer server components by default.
- **Design system:** "Living Archive" — "Resting Rigor" (clean 1px borders, zinc neutrals, no shadows at rest) + "Responsive Bloom" (blue-tinted shadows, subtle lifts on hover). Bikol words: Blue-500 bold; bridge languages (English/Tagalog): Zinc-400.
- **Testing:** Use `bun test` for TS tests. Use `pytest` for Python tests.
- **Environment:** `NEXT_PUBLIC_PLATFORM` (mobile vs web), `NEXT_PUBLIC_SITE_URL`, Supabase & Groq API keys required.

## Gotchas
- `postinstall` runs `prisma generate` — always run `bun install` after pulling schema changes.
- The `next.config.mjs` has commented-out `next-pwa` config (PWA handled differently now).
- `next.config.mjs` uses `output: 'export'` only when `NEXT_PUBLIC_PLATFORM === 'mobile'` — SSR otherwise.
- Prisma adapter uses `@prisma/adapter-pg` with `pg` driver for direct Postgres connections.
- `lib/prisma.ts` exports the Prisma client singleton — import from there, don't create new instances.
- Python scripts in `scripts/py/` depend on `pdfplumber`, `BeautifulSoup4` (via `requirements.txt`).
