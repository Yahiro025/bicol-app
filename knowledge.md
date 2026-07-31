# Project knowledge

## What this is

Bikol Dictionary (`bikoldict`) is an early-stage Next.js web app for searching and browsing Bikol vocabulary, viewing definitions and conjugations, practicing grammar and dialogue, studying flashcards, and submitting community corrections or new entries. Dictionary coverage and generated learning content are incomplete and should be reviewed by fluent speakers or language researchers.

## Where code lives

- `app/` — Next.js App Router pages, layouts, loading/error boundaries, metadata, and API route handlers in `app/api/`.
- `components/` — shared and feature UI; dictionary components are in `components/dictionary/`, learning components in `components/learn/`.
- `lib/server/` — server-only Prisma/database access, dictionary search, admin auth, and Groq/Gemini clients.
- `lib/dictionary/` — client-safe dictionary, lexicography, and conjugation logic.
- `lib/types/` and `types/` — shared TypeScript types and project/agent utility types.
- `prisma/` — PostgreSQL schema and checked-in migrations.
- `hooks/` — reusable React hooks; `public/` — static assets and web-app manifests.
- `android/` — optional Capacitor Android wrapper. Web development is the primary target.

The app is a hybrid modular monolith: there are no separate frontend/backend folders. Pages and API handlers are deployed together, with database and AI integrations kept server-side.

## Commands

Prerequisite: Bun and a PostgreSQL database. Install dependencies and prepare Prisma:

```bash
bun install
bunx prisma generate
bunx prisma migrate deploy
```

Run the app and quality checks:

```bash
bun run dev          # Next.js development server
bun run build        # Production build
bun run start        # Serve a production build
bun run lint         # ESLint
bun run typecheck    # tsc --noEmit
bun test             # Bun test runner (no test files are currently checked in)
```

For the optional Capacitor bundle:

```bash
NEXT_PUBLIC_PLATFORM=mobile bun run build
bunx cap sync android
bunx cap open android
```

## Configuration and data

Set `DATABASE_URL` and usually `NEXT_PUBLIC_SITE_URL` (`http://localhost:3000` locally). `GROQ_API_KEY` enables quiz/dialogue features; `GEMINI_API_KEY` enables substitution-drill generation; `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` protect admin/submission workflows. Keep credentials server-side and never commit environment files or secrets.

Migrations create the schema but do not populate dictionary entries. A working database with data is required for meaningful search and learning behavior. AI-generated content can be unavailable, rate-limited, or incorrect; some drills fall back to built-in examples, while live dialogue requires the API.

## Conventions and gotchas

- TypeScript is strict, uses ESNext/bundler resolution, `@/*` path aliases, and `noUncheckedIndexedAccess`; run typecheck after changes.
- Follow existing ESLint/Prettier style and reuse existing components/helpers before adding new abstractions.
- Client components must not import `lib/server/` or Prisma server runtime code. Keep secrets and database access in server code/API handlers.
- Preserve dictionary source references and dialect information when editing content or submission flows.
- `next.config.mjs` enables static export only when `NEXT_PUBLIC_PLATFORM=mobile`; the static Capacitor output is not a standalone API, database, or server.
- Images are configured as unoptimized, and the project uses Tailwind CSS via PostCSS plus Framer Motion for UI motion.
- Before changing an exported symbol, search all references and update consumers consistently.
