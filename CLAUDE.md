# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Writing style

When writing plans or documentation, use: ASD-STE100 Simplified Technical English (STE for short).

## Project

`bikoldict` — Next.js 16 (App Router) + React 19 + TypeScript, Prisma 7 + PostgreSQL. Also wrapped as an Android app via Capacitor (static export only, see below).

## Commands

The lockfile is `package-lock.json`, so **npm is the package manager** — there is no `bun.lockb`. Bun is only referenced by the `test` script.

- `npm run dev` / `npm run build` / `npm start`
- `npm run lint` → eslint
- `npm run typecheck` → `tsc --noEmit`
- `npm test` → runs `bun test`. **Bun may not be installed** — check with `which bun` before assuming tests can run.
- `prisma generate` runs automatically via `postinstall`
- `tsconfig.json` excludes `tests`, so `typecheck` never covers test files.

## Architecture: hybrid modular monolith

This structure is a deliberate decision (see `architecture-organization-spec.md`), not an accident:

- `app/api/` **is** the backend. It will not move to a separate folder/service unless there's a second client needing the API, independent scaling needs, background workers, or a separate backend team — none of that exists yet.
- Server/client boundary is enforced by convention, not tooling: `lib/server/` holds Prisma, Groq/Gemini clients, and admin auth, and is marked with the `server-only` package. **Never import from `lib/server/` in client components, and never import Prisma runtime types directly into client code** — use `lib/types/` for display/transport types instead.
- `lib/dictionary/` = client-safe domain logic (conjugation, lexicography, definitions). `lib/server/dictionary/search.ts` = DB-backed search. Same domain, split across the server boundary — don't merge them.
- Capacitor/mobile is a second-class, static-only build path: `NEXT_PUBLIC_PLATFORM=mobile` triggers `output: 'export'` in `next.config.mjs`, which cannot run Prisma or `app/api` route handlers on-device. There is no separately deployed API for mobile yet, so API-backed features won't work in the mobile build.
- Root-level `pyproject.toml`/`requirements.txt` are intentionally not moved into a subfolder — there are currently no active Python scripts in the repo backing them; treat as unresolved/legacy until real scripts exist.

## Gotchas

- `tests/bugs/duplicate-definitions.test.ts` imports from `'../../lib/definitions'`, but the real file is `lib/dictionary/definitions.ts` — this import is stale and the test will fail to resolve until fixed.
- `config/.env.production` and `config/.env.test` are stale templates: they reference unused vars (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`) and are missing `ADMIN_PASSWORD`/`ADMIN_SESSION_SECRET`/`NEXT_PUBLIC_SITE_URL`/`NEXT_PUBLIC_PLATFORM`. Use `.env.example` as the source of truth for required vars instead.
- `prisma/schema.prisma` has a `Word` model marked `// Legacy table for migration` alongside newer normalized models (`Root`, `Definition`, `Conjugation`, `ExampleSentence`) plus gamification models (`Profile`, `Contribution`, `Badge`, `ActivityLog`, `QuizAttempt`, `DrillSession`). Two schema eras coexist — check which model a feature should actually use.
- AI features (Groq for quiz/dialogue, Gemini for substitution drills) are optional and degrade gracefully; some drills fall back to built-in examples if the API is unreachable.
- Migrations create schema only, no seed data.

## Required env vars

`DATABASE_URL`, `GROQ_API_KEY`, `GEMINI_API_KEY`, `ADMIN_PASSWORD` (≥12 chars), `ADMIN_SESSION_SECRET` (≥32 chars), `NEXT_PUBLIC_SITE_URL`, optional `NEXT_PUBLIC_PLATFORM` (set to `"mobile"` only for Capacitor builds).

## Code style (non-default)

- `tsconfig.json`: strict, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`, `@/*` path alias to root, `moduleResolution: bundler`, `verbatimModuleSyntax: true`.
- `.prettierrc`: double quotes (`singleQuote: false`), `printWidth: 90`, trailing commas everywhere.
- `eslint.config.mjs` disables several rules by default: `no-explicit-any`, `no-require-imports`, some `react-hooks/*` rules, `react/no-unescaped-entities`.
