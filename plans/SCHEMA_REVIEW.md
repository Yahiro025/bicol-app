# Database Schema Review — Gamification Plan vs. Existing Schema

**Review Date:** June 2, 2026  
**Reviewers:** Gemini Thinker (deep analysis), Buffy (orchestrator), ECC Database Reviewer methodology  
**Files Reviewed:** `prisma/schema.prisma` (existing) vs. `plans/GAMIFICATION_PLAN.md §3` (proposed)

---

## Summary

| Category | Count |
|----------|-------|
| 🔴 Critical (blocks migration) | 6 |
| 🟡 Warning (should fix before deploy) | 8 |
| 🟢 Info (notable, optional fix) | 5 |

---

## 🔴 Critical Issues

### 1. Timestamp Type Mismatch — `DateTime` vs `DateTime? @db.Timestamptz(6)`

**Location:** All 7 new models in §3.1

The existing schema uses `DateTime? @default(now()) @db.Timestamptz(6)` for timestamp columns (see `UserSubmission.created_at`, `UserFlashcard.next_review`, `Word.created_at`). However, the plan uses bare `DateTime @default(now())` without `@db.Timestamptz(6)`.

**Why it matters:** Without `@db.Timestamptz(6)`, Prisma maps to `timestamp without time zone` in PostgreSQL. This means:
- Timezone information is lost
- Comparing timestamps across tables gives unexpected results
- The `lastActivityDate` field on Profile will compare wrong against `ActivityLog.createdAt`

**Fix:** Add `@db.Timestamptz(6)` to ALL DateTime fields in new models:

```prisma
model Profile {
  lastActivityDate DateTime? @db.Timestamptz(6)
  createdAt        DateTime  @default(now()) @db.Timestamptz(6)
  updatedAt        DateTime  @updatedAt @db.Timestamptz(6)
}

model Contribution {
  createdAt DateTime @default(now()) @db.Timestamptz(6)
}

model ActivityLog {
  createdAt DateTime @default(now()) @db.Timestamptz(6)
}

model QuizAttempt {
  createdAt DateTime @default(now()) @db.Timestamptz(6)
}

model DrillSession {
  createdAt DateTime @default(now()) @db.Timestamptz(6)
}

model UserBadge {
  earnedAt DateTime @default(now()) @db.Timestamptz(6)
}

model Badge {
  // Badge has no DateTime fields currently — fine
}
```

### 2. Existing `UserSubmission` Timestamp Inconsistency

**Location:** `prisma/schema.prisma` line ~132

The existing `UserSubmission.created_at` is `DateTime? @default(now()) @db.Timestamptz(6)`. The new columns (`userId`, `pointsAwarded`) are fine to add, but any new DateTime fields on this model must match the existing pattern. Also note: the existing model has NO `updatedAt` — if you want to track when admin approved, add it:

```prisma
model UserSubmission {
  // ... existing fields ...
  userId        String?   @db.Uuid
  pointsAwarded Int?      @default(0)
  updatedAt     DateTime? @updatedAt @db.Timestamptz(6)  // NEW: track approval time
}
```

### 3. `UserFlashcard` — Conflicting ID Strategy

**Location:** Plan §3.1, Profile model adds `flashcards UserFlashcard[]` relation

**Problem:** The existing `UserFlashcard` uses `Int @id @default(autoincrement())` while all new models use `String @id @default(cuid())`. The plan adds a bidirectional relation:

```prisma
// Plan adds this to Profile:
flashcards    UserFlashcard[]
```

But the existing `UserFlashcard` already has `user_id String? @db.Uuid` (note: **nullable**). The plan needs to:

1. Make `user_id` **non-nullable** to create a proper FK relation
2. Add the reverse relation explicitly on UserFlashcard

**Fix — add to existing UserFlashcard model:**

```prisma
model UserFlashcard {
  id                Int       @id @default(autoincrement())
  user_id           String    @db.Uuid                      // Made non-nullable
  profile           Profile   @relation(fields: [user_id], references: [id], onDelete: Cascade)  // NEW
  word_bikol        String
  proficiency_score Int?      @default(0)
  next_review       DateTime? @db.Timestamptz(6)
  created_at        DateTime? @default(now()) @db.Timestamptz(6)

  @@map("user_flashcards")
}
```

**Migration risk:** Making `user_id` non-nullable will fail if there are existing rows with NULL `user_id`. You MUST backfill before the migration:

```sql
-- Run before migration if rows exist with NULL user_id:
DELETE FROM user_flashcards WHERE user_id IS NULL;
-- OR assign a placeholder UUID:
UPDATE user_flashcards SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id IS NULL;
```

### 4. Missing Index for Monthly Leaderboard Queries

**Location:** Plan §5.8 describes "Monthly Leaderboard — sorted by XP earned this month"

The `Contribution` model has `@@index([userId, createdAt])` which is good for "get user's contributions". But the monthly leaderboard query is:

```sql
SELECT userId, SUM(points) as monthlyXp
FROM contributions
WHERE createdAt >= date_trunc('month', now())
GROUP BY userId
ORDER BY monthlyXp DESC
LIMIT 50
```

This query will NOT use the existing composite index efficiently because it filters on `createdAt` first, then groups on `userId`.

**Fix:** Add a dedicated partial index (in migration SQL, since Prisma doesn't support partial indexes natively):

```sql
-- Run manually via prisma migrate dev --create-only, then add to migration SQL:
CREATE INDEX idx_contributions_monthly
  ON contributions (created_at DESC, user_id, points)
  WHERE created_at >= date_trunc('month', now());
```

Alternatively, simpler: add a second `@@index`:

```prisma
model Contribution {
  // ...
  @@index([userId, createdAt])  // existing
  @@index([createdAt])          // NEW: for monthly leaderboard scan
}
```

### 5. RLS Policies Will Break Prisma Queries

**Location:** Plan §3.4

The plan adds RLS policies like:
```sql
CREATE POLICY "Users can read own quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);
```

**Problem:** Prisma connects via the connection pooler with the **service role key**. Service role bypasses RLS entirely. This means:
- Server-side Prisma queries WILL see all rows regardless of RLS
- RLS policies are effectively dead code for the Next.js API routes using Prisma
- RLS would only apply if you use `@supabase/supabase-js` directly from the client (DO NOT do this with the service key)

**Two valid strategies:**

**Strategy A (Recommended):** Drop RLS policies entirely. Enforce authorization in API route handlers via `requireAuth()`. This matches the existing pattern with `isAdminRequest()`.

**Strategy B:** Keep RLS for defense-in-depth, but use `@supabase/supabase-js` with the **anon key** for client-side reads and Prisma (service role) for writes. More complex but provides belt-and-suspenders security.

**Recommendation:** Strategy A. Keep it simple. One auth check pattern across all routes. The plan already shows `requireAuth()` in route handlers (§4.3).

### 6. Enums Create Native PostgreSQL Enums — Hard to Modify

**Location:** Plan §3.1 defines three Prisma enums:
- `ContributionType` (6 values)
- `BadgeCategory` (4 values)
- `ActivityType` (7 values)

**Problem:** Prisma maps enums to native PostgreSQL `CREATE TYPE`. Adding/removing enum values in PostgreSQL requires `ALTER TYPE ... ADD VALUE` (additive only — cannot remove values without dropping and recreating the type). This makes enum changes in production painful.

**Mitigation options:**
- **Option A:** Keep enums but be aware of the limitation. Add values only (never remove). Rename deprecated values instead of deleting them.
- **Option B:** Use `String` fields with `@db.VarChar` and validate in application code (e.g., Zod schemas). More flexible but loses DB-level constraint enforcement.
- **Option C:** Hybrid — use enums for stable categories (BadgeCategory: 4 values, unlikely to change) and String for evolving types (ActivityType may grow).

**Recommendation:** Option C. Keep `BadgeCategory` as an enum. Change `ContributionType` and `ActivityType` to `String @db.VarChar(30)` with Zod validation in API routes.

---

## 🟡 Warnings

### 7. `rank` on Profile — Denormalized Field Drift Risk

The plan stores `rank` as a computed `String?` on Profile and updates it on every XP change. This is fine for read performance but creates a risk: if the update code has a bug (or a direct DB write bypasses it), rank diverges from `totalXp`.

**Mitigation:** Add a comment in the schema and code:
```prisma
  rank String? // COMPUTED: Do NOT write directly. Updated by gamification.ts:computeRank()
```

Or better: compute it at read time instead of storing it:
```typescript
function computeRank(totalXp: number): string {
  if (totalXp >= 15000) return 'Grand Lexicographer'
  if (totalXp >= 5000)  return 'Master Lexicographer'
  if (totalXp >= 1000)  return 'Lexicographer'
  if (totalXp >= 500)   return 'Senior Contributor'
  if (totalXp >= 100)   return 'Active Contributor'
  return 'New Contributor'
}
```

This function is O(1) with 6 branches — no need to denormalize.

**Recommendation:** Remove the `rank` field from the DB. Compute it at read time. It's cheaper and can never diverge.

### 8. Missing `@@unique` on `Profile.username` Edge Case

The plan has `username String? @unique`. PostgreSQL allows multiple NULLs in a unique column (NULL ≠ NULL in SQL). This means multiple users can have NULL username — which is actually desired behavior. However, it also means **empty string "" is NOT null** and IS subject to the unique constraint.

**Fix:** Add a CHECK constraint or handle in application code:
```prisma
model Profile {
  username String? @unique @db.VarChar(30)
  // Add validation in API: reject empty string, treat as null
}
```

### 9. Missing Index on `UserBadge.badgeId`

The `@@unique([userId, badgeId])` creates a composite unique index that covers `(userId, badgeId)` lookups. It also covers `userId`-only lookups (leftmost prefix). But it does NOT efficiently cover queries like "find all users who earned badge X":

```sql
SELECT * FROM user_badges WHERE badgeId = 'some-badge-id'
```

**Fix:** Add a separate index:
```prisma
model UserBadge {
  // ...
  @@unique([userId, badgeId])
  @@index([badgeId])  // NEW
}
```

### 10. No Index on `UserSubmission.userId`

The plan adds `userId` to UserSubmission but no index. Query patterns like "show me my pending submissions" or "count approved submissions per user" will table-scan.

**Fix:**
```prisma
model UserSubmission {
  // ...
  @@index([userId, status])      // "my pending submissions"
  @@index([status, created_at])  // admin filter by status
}
```

### 11. `Profile.lastActivityDate` — No Index for Streak Reset Cron

If you ever add a cron job to reset streaks for inactive users, you'll scan by `lastActivityDate`:

**Fix (optional, Phase 4+):**
```prisma
model Profile {
  // ...
  @@index([lastActivityDate])  // For streak maintenance queries
}
```

### 12. Missing `@@index` on `ActivityLog` for Daily Aggregation

The streak system checks "did user have activity today?" by querying `ActivityLog`:

```sql
SELECT COUNT(*) FROM activity_log
WHERE user_id = $1 AND created_at >= CURRENT_DATE
```

The existing `@@index([userId, createdAt])` covers this well. ✅ No action needed.

### 13. `QuizAttempt.score` and `DrillSession.score` — Use `Float` but Consider `Decimal`

Float is fine for display (0.0–1.0). However, for computing average accuracy across many attempts, floating-point accumulation errors are possible (though negligible for this scale). Not a real issue — just noting it.

### 14. Missing `updatedAt` on Append-Only Tables

`Contribution`, `ActivityLog`, `QuizAttempt`, `DrillSession`, `UserBadge` are append-only (never updated after creation). Missing `updatedAt` is correct for these. ✅

---

## 🟢 Info

### 15. Table Naming Convention is Consistent

- Plan models all have `@@map()` with snake_case names: `profiles`, `contributions`, `badges`, `user_badges`, `activity_log`, `quiz_attempts`, `drill_sessions`
- Existing models follow the same pattern: `words`, `roots`, `definitions`, `conjugations`, `example_sentences`, `user_submissions`, `user_flashcards`
- ✅ Consistent

### 16. Foreign Key Cascade Behavior is Correct

- All new relations use `onDelete: Cascade` (when a Profile is deleted, all related data is cleaned up)
- This matches the existing pattern (e.g., `Root → Definition → Conjugation` all cascade)
- ✅ Consistent, but be aware: deleting a user is permanent and cascades to all their data

### 17. `Profile.id` Uses `String @db.Uuid` — Correct Match to Supabase

Supabase `auth.users.id` is UUID type. The plan correctly uses `@db.Uuid` on `Profile.id`. ✅

### 18. `UserSubmission.id` Auto-Increment vs UUID

`UserSubmission` uses `Int @id @default(autoincrement())` while new models use `String @id @default(cuid())`. The existing Int ID is fine for submissions (admins reference them by number). The `userId` field is correctly UUID. ✅

### 19. `metadata Json?` Field Flexibility

The `Json?` type on `Contribution` and `ActivityLog` is a good choice for flexible metadata. PostgreSQL's JSONB is efficient for this. Just be aware that JSONB fields can't be indexed for querying (you'd use GIN indexes if needed — not needed here).

---

## Recommended Fixes — Consolidated Migration SQL

```sql
-- Fix 1: Add timestamptz to timestamps (handled by Prisma migration)
-- Fix 2: Add updatedAt to UserSubmission
ALTER TABLE user_submissions ADD COLUMN updated_at TIMESTAMPTZ;

-- Fix 3: Backfill UserFlashcard.user_id (if needed)
DELETE FROM user_flashcards WHERE user_id IS NULL;

-- Fix 4: Monthly leaderboard index
CREATE INDEX idx_contributions_created_at ON contributions (created_at DESC);

-- Fix 5: Skip RLS (use application-level auth instead)
-- DROP POLICY IF EXISTS ... (if created)

-- Fix 6: (Recommendation) Drop rank column, compute at read time
-- ALTER TABLE profiles DROP COLUMN rank;

-- Fix 8: UserBadge badgeId index
CREATE INDEX idx_user_badges_badge_id ON user_badges (badge_id);

-- Fix 10: UserSubmission indexes
CREATE INDEX idx_user_submissions_user_status ON user_submissions (user_id, status);
CREATE INDEX idx_user_submissions_status_created ON user_submissions (status, created_at DESC);
```

---

## Migration Safety Checklist

- [ ] All new models have `@@map()` with snake_case names ✅
- [ ] All DateTime fields use `@db.Timestamptz(6)` ❌ (see Fix 1)
- [ ] All FK columns have matching types (UUID ↔ UUID) ✅
- [ ] Existing data is preserved (new columns are optional) ✅
- [ ] No destructive column renames/drops ✅
- [ ] `UserFlashcard.user_id` backfill handled ❌ (see Fix 3)
- [ ] Indexes exist for all leaderboard/query access patterns ❌ (see Fix 4, 9, 10)
- [ ] RLS policies won't interfere with Prisma queries ❌ (see Fix 5)

---

## Overall Assessment

The proposed schema is **well-designed** for the gamification requirements. The dual-track XP system with separate `scholarXp` and `contributorXp` on Profile is clean. The ActivityLog + Contribution split correctly separates learning metrics from contributor attribution.

The 6 critical issues are all fixable with minor adjustments — none require redesigning the schema. The most impactful fix is adding `@db.Timestamptz(6)` to all timestamps (one-line change per field). The UserFlashcard relation requires the most care (backfill NULL user_ids before making the column non-nullable).

**Verdict:** ✅ Schema is ready for implementation after applying fixes 1–6.
