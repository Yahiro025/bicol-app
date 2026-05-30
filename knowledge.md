# MetaBuff Knowledge File
# ─────────────────────────────────────────────────────────────────────────────
# This file is read by Codebuff/Freebuff at the start of every session.
# It primes DeepSeek V4 Flash with codebase context to reduce hallucinations.
#
# HOW TO USE:
#   1. Fill in every section marked [FILL IN] before using MetaBuff
#   2. Keep this file updated when the project structure changes
#   3. The more accurate this file, the fewer hallucinations you'll see
# ─────────────────────────────────────────────────────────────────────────────

## Project Identity

**Name**: bikoldict (Bikol Dictionary)
**Type**: Next.js web app + Capacitor Android wrapper + Python data pipeline — a Bikol language dictionary with AI-enhanced learning features
**Primary language**: TypeScript
**Framework**: Next.js 16 (App Router) with React 19
**Package manager**: bun

## Architecture Overview

The app is a full-stack Next.js 16 web application for a Bikol (Bicolano) language dictionary. The frontend uses React 19 with Tailwind CSS v4 for styling, Framer Motion for page transitions, and lucide-react for icons. The backend uses Prisma ORM with @prisma/adapter-pg connecting to a PostgreSQL database hosted on Supabase, with API routes in the Next.js App Router. Data is sourced from Wiktionary (Python scraper) and AI-enriched via Groq, then merged into a normalized Mintz-based schema (roots → definitions → conjugations → example sentences). Learning features include AI-generated quizzes, substitution drills, applied fluency dialogues, and flashcards. The app also has a Capacitor Android wrapper for mobile deployment and a PWA manifest for installability.

## Directory Layout (Most Important Paths)

```
app/
  page.tsx              Homepage (hero, search, WOTD, categories, popular)
  layout.tsx            Root layout (nav bar, theme providers, PWA prompt)
  providers.tsx         Client-side ThemeProvider wrapper
  browse/page.tsx       Browse dictionary with pagination/filtering
  word/[bikol]/page.tsx Word detail page with conjugator and definitions
  learn/page.tsx        Learning hub (quiz, substitution drills, fluency)
  flashcards/page.tsx   Flashcard study page
  contribute/page.tsx   User word submission form
  frequency-list/       Frequency-ranked word list
  admin/submissions/    Admin panel for reviewing user submissions
  api/                  App Router API route handlers (browse, search, word,
                        conjugations, learn, drills, submit, frequency, admin)
components/             Reusable React components
  SearchBar.tsx         Autocomplete search with fuzzy matching
  WordCard.tsx          Word display card
  BrowseClient.tsx      Client-side browsing with infinite scroll
  VerbConjugator.tsx    Interactive verb conjugation table
  Flashcards.tsx        Flashcard study component
  Quiz.tsx              Quiz component
  GrammarHighlight.tsx  Grammatical feature highlighting
  LanguageToggle.tsx    Language mode toggle (Bikol/English/Tagalog/All)
  ThemeToggle.tsx       Dark/light mode toggle
  DesktopNav.tsx        Desktop navigation links
  MobileNav.tsx         Mobile hamburger menu (portal-based)
  PageTransition.tsx    Framer Motion page transition wrapper
  WordOfTheDay.tsx      Daily featured word card
  CategoryGrid.tsx      Category browsing grid
  SuggestEditModal.tsx  Suggest edit dialog for word entries
  AudioPlayer.tsx       Pronunciation audio player
  PwaInstallPrompt.tsx  PWA install banner
  dictionary/           Sub-components for word pages
    VerbConjugator.tsx  Verb conjugation display component
  learn/                Learning exercise components
    SubstitutionDrill.tsx  AI-powered substitution drill
    AppliedFluency.tsx     AI dialogue practice
    TransformationChallenge.tsx Transformation exercise
  ui/                   Base UI primitives (Button, LoadingBar, ThemeToggle)
    index.ts            Barrel exports
lib/                    Core business logic and utilities
  prisma.ts             Prisma client init with pgPool connection pooling
  supabase.ts           Supabase client (legacy, for Python scripts)
  word-search.ts        Browse, count, search across roots + words tables
  conjugator.ts         Bikol verb conjugator (Mintz grammar rules)
  fuzzy.ts              Damerau-Levenshtein fuzzy matching for search
  lexicography.ts       POS normalization and definition text formatting
  constants.ts          Category metadata (icons/colors), nav links, popular words
  utils.ts              cn() utility (clsx + tailwind-merge)
  groq.ts               Groq AI client (quiz gen, dialogues, linguistic audit)
  offline.ts            IndexedDB offline search history
  admin-auth.ts         HMAC-based admin authentication
  types/
    word.ts             WordDisplayData, EnrichedRoot, DisplayDefinition types
    learn.ts            QuizQuestion, DialogueScenario, FlashcardSession types
hooks/
  useLanguageMode.ts    Custom hook for language mode state (localStorage + events)
scripts/                Data processing and maintenance
  ts/                   migrate-to-mintz, enrich_with_ai, sync-supabase-to-local,
                        fix_examples, merge_definitions, deduplicate_case, etc.
  py/                   audit_data, calculate_frequency, extract_mintz_pdfs,
                        count_bikol_words, python_utils, fix_inaccurate_translations
  js/                   generate_tagalog
tests/                  Test files
  fuzzy.test.ts        Fuzzy matching unit tests
  conjugator.test.ts   Conjugation unit tests
  test_*.py            Python tests for scrapers, integration, and utils
prisma/
  schema.prisma        Database schema (7 models: Root, Definition, Conjugation,
                       ExampleSentence, Word, UserSubmission, UserFlashcard,
                       DialogueScenario)
  migrations/          Prisma migration files
```

## Key Files (Read These Before Editing Anything)

| File | Role |
|------|------|
| prisma/schema.prisma | Database schema — source of truth for all 7 models and the FocusClass enum |
| lib/word-search.ts | Main data access layer: browse, count, and search across both normalized (roots) and legacy (words) tables |
| lib/conjugator.ts | Bikol verb conjugation logic based on Mintz grammar rules (FocusClass: ON, I, AN, MAG) |
| lib/fuzzy.ts | Client-side Damerau-Levenshtein fuzzy string matching for typo-tolerant search |
| lib/groq.ts | Groq AI client using qwen-3-32b for quiz generation, dialogue processing, and linguistic audit |
| lib/prisma.ts | Prisma client singleton with @prisma/adapter-pg connection pooling |
| app/layout.tsx | Root layout — navigation bar, ThemeProvider, LanguageToggle, PWA prompt, page transitions |
| app/page.tsx | Homepage — hero section, search bar, WOTD, categories grid, popular words, verb demo |
| app/word/[bikol]/page.tsx | Word detail page — definitions, conjugator, example sentences, suggest edit |

## Import Conventions

- Path alias `@/` maps to project root (e.g., `import { prisma } from '@/lib/prisma'`)
- `@/components` → React components
- `@/lib` → utilities and business logic
- `@/app` → app router pages
- `@prisma/client` → generated Prisma types
- All imports use ESM syntax (no require); project has `"type": "module"` in package.json

## Naming Conventions

- Files: kebab-case (`word-search.ts`, `VerbConjugator.tsx`)
- React components: PascalCase (`WordCard`, `SearchBar`)
- Functions: camelCase (`conjugateVerbMintz`, `normalizePOS`)
- Constants: SCREAMING_SNAKE_CASE (`POPULAR_WORDS`, `ADMIN_SESSION_COOKIE`) or camelCase for local exports
- Database tables: snake_case (`roots`, `definitions`, `user_submissions`, `user_flashcards`)
- Prisma models: PascalCase (`Root`, `Definition`, `Conjugation`, `ExampleSentence`)
- Database columns: camelCase in Prisma (`rootId`, `focusType`, `aiConfidence`), mapped to snake_case in SQL via `@@map`
- Enums: PascalCase (`FocusClass`), values: UPPER_SNAKE (`ON_CLASS`, `I_CLASS`)
- TypeScript types: PascalCase (`WordSearchEntry`, `FuzzyMatch<T>`, `ConjugationSet`)

## Type System Notes

- `WordDisplayData`: Union type for both normalized (Root) and legacy (Word) data paths. Has `definitions` (DisplayDefinition[]) when normalized, flat fields (english, tagalog) when legacy.
- `EnrichedRoot = Root & { definitions: EnrichedDefinition[] }` — Root with fully included Definition children (each Definition includes conjugations + exampleSentences)
- `DisplayDefinition`: Flattened definition shape with english, tagalog, dialect, synonyms, source, conjugations[], exampleSentences[]
- `FuzzyMatch<T>`: Generic result type with `item: T`, `score: number`, `matchedField: string`
- `ConjugationSet`: `{ actorFocus: ConjugationForms; objectFocus: ConjugationForms }` where each ConjugationForms has infinitive, future, past, progressive
- `WordSearchEntry`: Unified search/browse result type with bikol, english, tagalog, pos, category, pronunciation, dialect, frequency_rank, source ('normalized' | 'legacy')
- `LanguageMode`: Type from LanguageToggle — values 'all' | 'english' | 'tagalog' (controls what translations are shown)
- `QuizQuestion`: `{ id, question, options[], correctAnswer, explanation, word }`
- `LinguisticAudit`: `{ comprehension: string, focus: string, particles: string, score: number }` — post-dialogue evaluation
- API responses return `NextResponse` with JSON; no shared ApiResponse wrapper type

## Database / Backend

**Type**: PostgreSQL (hosted on Supabase)
**ORM/Client**: Prisma v7 with @prisma/adapter-pg and pg.Pool connection pooling

Key tables/collections:
- `roots` — Normalized Mintz lexicon entries. Fields: bikol, pos, category, pronunciation, etymology, frequency_rank, audio_url, focusClass (enum), isTransitive. One-to-many with definitions.
- `definitions` — Word meanings per root. Fields: english, dialect, synonyms, tagalog, aiConfidence, source_url, source, affixPair, focusType, series, isVerified, notes. One-to-many with conjugations and example_sentences.
- `conjugations` — Verb forms per definition. Unique on (definitionId, tense, focus). Fields: tense, focus, form.
- `example_sentences` — Usage examples per definition. Fields: bikol, english, source.
- `words` — Legacy table (Wiktionary / learnbikol.com import, pre-Mintz migration).
- `user_submissions` — User-contributed word suggestions. Fields: word, definition, pos, dialect, status (default "pending"), target_table, admin_notes.
- `user_flashcards` — User study progress. Fields: user_id, word_bikol, proficiency_score, next_review.
- `dialogue_scenarios` — AI dialogue practice scenarios. Fields: title, description, goal, difficulty, visualCue, vocabulary (String[]).

Migration approach: Prisma migrations in `prisma/migrations/`. Schema URL configured in `prisma.config.ts`.

## Test Setup

**Framework**: bun test (TypeScript) + pytest (Python)
**Test file location**: `tests/` folder — `*.test.ts` for TypeScript, `test_*.py` for Python
**Run command**: `bun test` for TypeScript tests | `pytest` for Python tests

## Known Gotchas

- DO NOT query only the `words` (legacy) table — always UNION ALL both `roots` and `words` for complete results. Many words exist only in the normalized schema.
- The Prisma client uses `@prisma/adapter-pg` with a raw `pg.Pool` — not the default Prisma driver. Never create multiple PrismaClient instances; the singleton in `lib/prisma.ts` handles this via globalThis.
- Groq AI (lib/groq.ts) has a 30 RPM rate limit. The `getCompletion` function retries with 2s/5s delays. MODEL is hardcoded to `qwen-3-32b` — do NOT change without explicit user request.
- Admin auth is custom HMAC-based (lib/admin-auth.ts): ADMIN_PASSWORD must be >= 12 chars, ADMIN_SESSION_SECRET must be >= 32 chars. There is NO NextAuth, Supabase Auth, or any third-party auth.
- Verb conjugator uses Mintz grammar rules for 4 focus classes: ON_CLASS (-on suffix), I_CLASS (i- prefix), AN_CLASS (-an suffix), MAG_INTRANSITIVE (mag-). Always use `conjugateVerbMintz()` for new code; `conjugateBikolVerb()` is legacy wrapper.
- React `cache()` is used from `'react'` to deduplicate database queries within a single SSR render — this is NOT the deprecated `React.cache` from `react/cache`.
- `prisma.config.ts` (v7+) is used for datasource URL config, separate from `schema.prisma`.
- Tailwind CSS v4 uses `@tailwindcss/postcss` plugin (NOT the old `tailwindcss` PostCSS plugin). Configuration is in `postcss.config.mjs`.
- `next.config.mjs` has a conditional static export for Capacitor mobile builds — set `NEXT_PUBLIC_PLATFORM=mobile` to enable.
- There is NO Redux, Zustand, or any client-side state library — state is managed via React state, hooks (useLanguageMode), localStorage events, and URL search params.

## Anti-Hallucination Anchors

These are real, verified facts about this codebase.
DeepSeek Flash: treat these as ground truth; do not contradict them.

- The entry point is `app/page.tsx`, not any custom server or `index.tsx`
- Database is queried via Prisma (`lib/prisma.ts`), NOT directly via Supabase client (Supabase client exists but is legacy/unused in the TS app)
- There is NO NextAuth, Supabase Auth, or any authentication library — admin auth is custom HMAC-based in `lib/admin-auth.ts`
- The verb conjugator uses Mintz grammar rules defined in `lib/conjugator.ts` — 4 focus classes: ON, I, AN, MAG
- React `cache()` from `'react'` is used for deduplicating DB queries within a single SSR render
- The project uses Tailwind CSS v4 with `@tailwindcss/postcss` plugin (NOT v3)
- TypeScript config has `strict: true`, `noUncheckedIndexedAccess: true`, `verbatimModuleSyntax: true`
- Bun is the package manager AND test runner (`bun install`, `bun test`)
- Prisma adapter is `@prisma/adapter-pg` using a raw `pg.Pool` connection pool
- The Python scraper (`ai_wiktionary_scraper.py`) and data scripts are separate from the Next.js app — they run in GitHub Actions workflows or manually

## Context7 — Live Documentation (Integrated)

This project uses **Upstash Context7** to fetch live, version-specific documentation for all major libraries and frameworks. This prevents hallucinated APIs by replacing stale training data with current docs.

### How to Use

**Before writing code that involves external libraries**, resolve and fetch docs:

```bash
# Step 1: Resolve library to Context7 ID
npx ctx7 library <library> "<what-you-want-to-do>"

# Step 2: Fetch live docs
npx ctx7 docs <library-id> "<specific-question>"
```

### Key Library IDs for This Project

| Library | Context7 ID |
|---------|-------------|
| Prisma | `/prisma/web` or `/prisma/prisma` |
| Next.js | `/vercel/next.js` |
| React | `/facebook/react` |
| Tailwind CSS | `/tailwindlabs/tailwindcss` |
| Framer Motion | `/framer/motion` |
| Groq SDK | `/groq/groq-sdk` |
| Zod | `/colinhacks/zod` |
| Supabase | `/supabase/supabase` |

### When to Always Use Context7

- Framework APIs (Next.js route handlers, layouts, metadata, middleware)
- ORM queries (Prisma relations, raw queries, connection pooling, migrations)
- UI libraries (Tailwind CSS v4 patterns, Framer Motion, lucide-react)
- React hooks and patterns (`useActionState`, `useOptimistic`, Server Components, `cache()`)
- Database (PostgreSQL, Supabase, pg.Pool)
- Package configuration (`next.config.mjs`, `postcss.config.mjs`, `tsconfig.json`)

### Skill File

Context7 skill documentation is at `.agents/skills/context7/SKILL.md`. Codebuff auto-discovers skills in this directory at session start.

### How Agents Should Use Context7

When writing code that involves an external library, agents should:
1. Run `npx ctx7 library <name> "<question>"` to resolve the library
2. Run `npx ctx7 docs <library-id> "<question>"` to fetch live docs
3. Use the retrieved API signatures and patterns as ground truth

This is especially critical for: Prisma relations/raw queries, Next.js App Router patterns, React 19 hooks, Tailwind CSS v4, Framer Motion, and any PostgreSQL/Supabase interactions.

## MetaBuff Configuration

```yaml
# Complexity thresholds (affects which pipeline MetaBuff chooses)
simple_max_files: 2       # tasks touching <= 2 files → simple pipeline
complex_max_files: 10     # tasks touching 3-10 files → complex pipeline
mega_threshold: 11        # 11+ files or architectural changes → mega pipeline

# Model override (leave blank to use MetaBuff's default = deepseek/deepseek-v4-flash)
model_override: ""

# Parallel agent limit for metabuff-mega
max_parallel_agents: 8

# Run validator after every pipeline (recommended: true)
always_validate: true
```
