# Environment Variable Audit Report

**Date:** 2025-01-XX (auto-generated)
**Branch:** `chore/env-audit`
**Scope:** Full codebase scan of all `process.env` references in TypeScript source files

---

## Summary of Changes to `.env.example`

### Variables Added

| Variable | Reason |
|----------|--------|
| `GEMINI_API_KEY` | Referenced in `lib/gemini.ts` (line 6) via `process.env.GEMINI_API_KEY`. Consumed by the `/api/drills` endpoint for substitution drill generation using Google Generative AI. Was missing from `.env.example`. |

### Variables Removed

| Variable | Reason |
|----------|--------|
| `SUPABASE_URL` | NOT referenced by `process.env` anywhere in the TypeScript codebase. The `@supabase/supabase-js` package exists in `package.json` but is never imported in any source file. No Python scripts exist in the repo that use it either. |
| `SUPABASE_SERVICE_KEY` | Same as above -- not referenced anywhere in code. Legacy entry with no active consumer. |

### Variables Corrected

None. All variable names and casing in the existing `.env.example` matched their actual usage in code.

---

## Complete Variable Inventory (Verified)

| # | Variable | Source File(s) | Purpose |
|---|----------|---------------|---------|
| 1 | `DATABASE_URL` | `lib/prisma.ts` (line 5), `prisma.config.ts` (lines 4, 14) | PostgreSQL connection string for Prisma ORM |
| 2 | `GROQ_API_KEY` | `lib/groq.ts` (line 5) | Groq AI SDK authentication key |
| 3 | `GEMINI_API_KEY` | `lib/gemini.ts` (line 6) | Google Generative AI (Gemini) SDK key |
| 4 | `ADMIN_PASSWORD` | `lib/admin-auth.ts` (line 6) | Admin authentication password (>= 12 chars) |
| 5 | `ADMIN_SESSION_SECRET` | `lib/admin-auth.ts` (line 11) | HMAC session signing secret (>= 32 chars) |
| 6 | `NEXT_PUBLIC_SITE_URL` | `app/layout.tsx` (line 33), `app/robots.ts` (line 3), `app/sitemap.ts` (line 5), `components/WordJsonLd.tsx` (line 33) | Canonical base URL for SEO metadata |
| 7 | `NEXT_PUBLIC_PLATFORM` | `next.config.mjs` (line 9) | Set to `"mobile"` for Capacitor static export builds |

**Note:** `NODE_ENV` is also used in `lib/prisma.ts`, `app/api/admin/session/route.ts`, and `app/api/drills/route.ts`, but it is framework-provided by Next.js and NOT user-configured. It is intentionally excluded from `.env.example`.

---

## Per-Endpoint Environment Variable Dependencies

Each API route's dependencies were traced through actual import chains (not guessed from naming).

| Endpoint | Environment Variables Required |
|----------|-------------------------------|
| `/api/admin/session` | `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` |
| `/api/admin/word-original` | `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` |
| `/api/browse` | `DATABASE_URL` |
| `/api/conjugations/[word]` | `DATABASE_URL` |
| `/api/drills` | `DATABASE_URL`, `GEMINI_API_KEY` |
| `/api/frequency` | `DATABASE_URL` |
| `/api/learn` | `DATABASE_URL`, `GROQ_API_KEY` |
| `/api/learn/dialogue` | `DATABASE_URL`, `GROQ_API_KEY` |
| `/api/profile/[id]` | `DATABASE_URL` |
| `/api/search` | `DATABASE_URL` |
| `/api/submit` | `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` |
| `/api/word` | `DATABASE_URL` |

---

## Security Flags

### Hardcoded Credential in `.env.migration`

The file `.env.migration` contained a hardcoded real database credential:

```
DATABASE_URL=postgresql://postgres.ayvxqbxnrbcgbffrzbia:R7DTSp9tTBzoOYuF@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
```

**Remediation performed:**
- `.env.migration` has been removed from git tracking (`git rm --cached`)
- `.env.migration` has been added to `.gitignore` to prevent re-addition

**Additional actions required (human review):**
1. Rotate this credential immediately in the Supabase dashboard
2. The credential still exists in git history -- consider using `git filter-repo` or BFG to purge it if this is a public repository
3. If this password was used elsewhere, rotate those credentials as well

---

## Known Drift: `config/` Templates

The files `config/.env.production` and `config/.env.test` are out of date relative to this audit:

- They still list `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`, which are dead variables (no code references them).
- They are missing `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL`, and `NEXT_PUBLIC_PLATFORM`.

These config templates were not modified as part of this audit (they are deployment config files, not documentation). If they are used as deployment checklists, they should be updated separately to match `.env.example`.

---

## Minimal Setup for Local Development

To run the full app locally, you need at minimum:

1. **`DATABASE_URL`** - Required for any data access (all API routes)
2. **`ADMIN_PASSWORD`** + **`ADMIN_SESSION_SECRET`** - Required for admin panel and word submission
3. **`GROQ_API_KEY`** - Required for the learn/quiz features
4. **`GEMINI_API_KEY`** - Required for the drills feature
5. **`NEXT_PUBLIC_SITE_URL`** - Required for correct SEO metadata (can use `http://localhost:3000` locally)

`NEXT_PUBLIC_PLATFORM` is only needed for mobile Capacitor builds and can be omitted for standard web development.
