# Session Log — May 27, 2026

## Overview
Database analysis + multi-source data merge with source tracking badges.

---

## Part 1: Database Analysis

### Databases Accessed
| Database | Type | Access Method | Status |
|---|---|---|---|
| Local PostgreSQL (`localhost:5432/bikoldict`) | Development | Prisma (via Docker `bikoldict-pg`) | Connected |
| Supabase (`ayvxqbxnrbcgbffrzbia.supabase.co`) | Production | REST API with service_role key | Connected |
| SQLite cache (`.cache/bikoldict/cache.db`) | Offline cache | Direct SQLite3 | Connected |

### Supabase Schema (9 tables)
| Table | Records | Purpose |
|---|---|---|
| `bikol_dictionary` | 6,672 | Mintz PDF raw data (headword, JSON definitions, book_page) |
| `words` | 3,403 | Legacy flat table (Wiktionary + learnbikol.com) |
| `roots` | 9,881 | Normalized root words (normalized schema) |
| `definitions` | 10,809 | Definitions linked to roots |
| `example_sentences` | 4,321 | Usage examples |
| `conjugations` | 488 | Verb conjugation forms |
| `user_submissions` | 0 | User-contributed words |
| `user_flashcards` | 0 | Flashcard data |
| `dialogue_scenarios` | — | Learning dialogue scenarios |

### Key Findings
- `bikol_dictionary` had **6,672 entries** but was NOT connected to the frontend
- All 6,672 headwords matched existing roots (normalized match)
- Many secondary fields were empty: `synonyms`, `audio_url`, `etymology`, `frequency_rank`
- `user_submissions` and `user_flashcards` remain unused

---

## Part 2: Multi-Source Merge Implementation

### Problem
Three separate data sources existed with no cross-referencing:
1. **bikol_dictionary** (Supabase) — Mintz academic dictionary (6,672 entries)
2. **words** (legacy table) — Wiktionary + learnbikol.com (3,403 entries)
3. **roots + definitions** (normalized schema) — Previously migrated from `words` only

The frontend only queried `roots` (Wiktionary/learnbikol data), completely ignoring the rich Mintz data.

### Solutions Implemented

#### 1. Schema Change
- Added `source` field to `Definition` model (`String?` default `"unknown"`)
- Migration applied locally: `prisma/migrations/20260527164907_add_source_field`
- SQL for Supabase: `ALTER TABLE "definitions" ADD COLUMN IF NOT EXISTS "source" TEXT DEFAULT 'unknown';`

#### 2. Merge Script (`scripts/ts/merge-mintz-into-roots.ts`)
- Reads all 6,672 entries from `bikol_dictionary` via Supabase REST API (paginated)
- Fetches all existing `roots` and `definitions` for dedup
- Normalizes headwords (NFD strip diacritics, case-insensitive) for matching
- Matching priority:
  - **Root level**: Normalized bikol → match existing root or create new
  - **Definition level**: (rootId, source, English) → skip duplicate Mintz defs
- Batch inserts with error fallback to single-row retry
- Generates UUIDs locally (since Supabase REST API bypasses Prisma's cuid defaults)
- Provides `createdAt`/`updatedAt` timestamps (required NOT NULL without DB defaults)

**Results:**
| Metric | Count |
|---|---|
| Mintz entries processed | 6,672 |
| Roots matched (already exist) | 6,672 |
| New roots created | 0 |
| New definitions inserted (`source: 'mintz_book'`) | 404 |
| Duplicate definitions skipped | 5,942 |
| New example sentences inserted | 98 |

#### 3. Source Badges on Word Page (`app/word/[bikol]/WordClientPage.tsx`)
- **`SourceBadge` component** renders colored attribution badges:
  - 📖 **Mintz Dictionary** (blue) — `source: 'mintz_book'`
  - 🌐 **Wiktionary** (green) — `source: 'wiktionary'`
  - 🎓 **LearnBikol.com** (purple) — `source: 'learnbikol'`
- Badges display **outside** the language toggle (always visible)
- Page citations shown on desktop: `Mintz Dictionary, p.142`
- Legacy (non-normalized) definitions infer source from `source_url` field

### Files Changed
| File | Change |
|---|---|
| `prisma/schema.prisma` | Added `source String? @default("unknown")` to `Definition` |
| `prisma/migrations/20260527164907_add_source_field/migration.sql` | New migration |
| `scripts/ts/merge-mintz-into-roots.ts` | **New** — complete merge script |
| `app/word/[bikol]/WordClientPage.tsx` | Added `SourceBadge` component + source display per definition |

### Design Decisions
| Concern | Decision |
|---|---|
| Same word, different sources | Both shown with respective source badges |
| Same word, same source, same definition | **Skipped** (true duplicate) |
| Same word, different source, same definition text | Both shown intentionally — user wants source attribution |
| Legacy words (non-normalized path) | Source inferred from `source_url` field |

### Future Improvements (Not Implemented)
1. Tag existing definitions with correct sources (`wiktionary`/`learnbikol`) based on `source_url`
2. Enrich matched roots with Mintz metadata (pronunciation, focusClass, etymology)
3. Show source badges in search results
4. Merge identical-text definitions from different sources into one with combined attribution
