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

**Name**: [FILL IN — e.g., "my-flutter-app"]
**Type**: [FILL IN — e.g., "Flutter mobile app with Supabase backend"]
**Primary language**: [FILL IN — e.g., TypeScript / Dart / Python / Go]
**Framework**: [FILL IN — e.g., Next.js 15 / Flutter 3.x / FastAPI]
**Package manager**: [FILL IN — e.g., bun / npm / pnpm / pub]

## Architecture Overview

[FILL IN — 3-5 sentences describing the system.  Example:]
<!-- The app is a Flutter mobile client that talks to a Supabase PostgreSQL backend.
     Business logic lives in lib/services/. UI components are in lib/widgets/.
     Authentication is handled by Supabase Auth with JWT tokens stored in secure storage.
     The Dart code uses the Repository pattern: services never call Supabase directly — 
     they go through a repository interface to allow testing. -->

## Directory Layout (Most Important Paths)

```
[FILL IN — paste the output of: find . -type f -name "*.ts" | head -40]

Examples:
src/
  app/            Next.js app router pages
  components/     Reusable React components
  lib/
    db/           Drizzle ORM schema and queries
    auth/         NextAuth configuration
    utils/        Shared utility functions
  api/            tRPC routers
tests/
  unit/
  integration/
```

## Key Files (Read These Before Editing Anything)

| File | Role |
|------|------|
| [FILL IN] | [what it does] |
| [FILL IN] | [what it does] |

Examples (delete these and replace with your actual files):
<!-- 
| src/lib/db/schema.ts        | All Drizzle table definitions — source of truth for data shape |
| src/lib/auth/config.ts      | NextAuth providers and session config |
| src/app/api/trpc/[trpc].ts  | tRPC entry point |
| lib/models/user.dart        | User domain model |
| lib/services/auth_service.dart | All auth calls go here |
-->

## Import Conventions

[FILL IN — how imports work in this project.  Examples:]
<!--
- Path alias `@/` maps to `src/`
- `@/components` → React components
- `@/lib/db` → database utilities
- Barrel exports exist in each folder's index.ts
- In Dart: all imports use relative paths within lib/
-->

## Naming Conventions

[FILL IN.  Examples:]
<!--
- Files: kebab-case (my-component.tsx)
- React components: PascalCase
- Functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Database tables: snake_case (user_profiles, auth_sessions)
- Dart classes: PascalCase, files: snake_case
-->

## Type System Notes

[FILL IN — important types/interfaces the model might reference.  Examples:]
<!--
- User object shape: { id: string, email: string, role: 'admin' | 'user' }
- ApiResponse<T> wrapper: { data: T, error: string | null }
- All DB queries return Promise<Result<T, DbError>>
- Flutter: UserModel is in lib/models/user_model.dart
-->

## Database / Backend

**Type**: [FILL IN — e.g., PostgreSQL via Supabase / SQLite via Drizzle / MongoDB]
**ORM/Client**: [FILL IN — e.g., Drizzle ORM / Prisma / Supabase JS SDK]

Key tables/collections:
[FILL IN — list the main tables and their purpose]

Migration approach: [FILL IN — e.g., "Drizzle migrations in drizzle/migrations/"]

## Test Setup

**Framework**: [FILL IN — e.g., Vitest / Jest / pytest / Go testing / Flutter test]
**Test file location**: [FILL IN — e.g., co-located as *.test.ts / tests/ folder]
**Run command**: [FILL IN — e.g., `bun test` / `npx vitest` / `flutter test`]

## Known Gotchas

[FILL IN — things that caused bugs before.  MetaBuff uses these to avoid repeating mistakes.]

Examples (replace with your project's actual gotchas):
<!--
- DO NOT use `process.env` directly — always use `src/lib/env.ts` which validates vars at startup
- Supabase client must be created server-side in API routes; never import the client-side client in server code
- The User type from Supabase Auth is different from the User row in our users table — don't mix them up
- All date handling must use UTC — never local timezone
- Flutter: never call setState after dispose — always check mounted first
-->

## Anti-Hallucination Anchors

These are real, verified facts about this codebase.
DeepSeek Flash: treat these as ground truth; do not contradict them.

- [FILL IN — e.g., "The entry point is src/app/page.tsx, not src/index.tsx"]
- [FILL IN — e.g., "Authentication middleware is in src/middleware.ts"]
- [FILL IN — e.g., "There is NO Redux in this project — state is managed with Zustand"]
- [FILL IN — e.g., "The Supabase URL and anon key are in .env.local as NEXT_PUBLIC_SUPABASE_URL"]

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
