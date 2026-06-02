# Bicol Dictionary — Auth + Gamification Plan

**Status:** Planning  
**Last Updated:** June 2, 2026  
**Contributors:** Buffy (MetaBuff orchestrator), ECC Planner, ECC Architect, Gemini Thinker  

---

## Table of Contents

1. [Overview & Vision](#1-overview--vision)
2. [Architecture Decisions (ADRs)](#2-architecture-decisions-adrs)
3. [Database Schema](#3-database-schema)
4. [Authentication Architecture](#4-authentication-architecture)
5. [Gamification Mechanics](#5-gamification-mechanics)
6. [API Design](#6-api-design)
7. [Frontend Components](#7-frontend-components)
8. [Implementation Phases](#8-implementation-phases)
9. [Migration Strategy](#9-migration-strategy)
10. [Risks & Mitigations](#10-risks--mitigations)
11. [Success Criteria](#11-success-criteria)

---

## 1. Overview & Vision

### Problem
The Bikol Dictionary currently has no user identity system, no persistence of learning progress, and hardcoded placeholder stats on the learn page. Anonymous users contribute words but get no recognition. Learners complete drills and flashcards but their progress evaporates on refresh.

### Vision
**Dual-track gamification** that rewards both ends of the user spectrum:

| Track | Persona | Motivation | XP Source |
|-------|---------|-----------|-----------|
| **Scholar Path** | Language learner | Master Bikol vocabulary & grammar | Completing quizzes, flashcards, drills, dialogues; maintaining streaks; SRS mastery |
| **Contributor Path** | Lexicographer / native speaker | Help document & preserve the language | Submitting words (approved), editing definitions, adding example sentences |

Both paths feed into a unified profile with:
- **Tier ranks** (cross-track, based on total XP)
- **Badges & achievements** (track-specific milestones)
- **Leaderboards** (all-time + monthly, with privacy controls)
- **Daily streaks** (learning consistency)
- **Community recognition** (weekly top-3 shoutouts)

### Why Dual-Track?
A native speaker who contributes 100 words should not be outranked by someone who just does flashcards. Separating the XP lets each persona shine where they contribute. The unified profile shows both stats side-by-side.

---

## 2. Architecture Decisions (ADRs)

### ADR-001: Use Supabase Auth (not custom auth, not NextAuth)

**Status:** Accepted  
**Date:** 2026-06-02

**Context:** The app needs user authentication for gamification (profiles, XP tracking, streaks). We already use Supabase for PostgreSQL.

**Decision:** Use Supabase Auth with:
- Email/password (primary)
- Magic link (secondary, low friction for learners)
- Optional: Google OAuth (future)

**Consequences:**
- ✅ Zero new infrastructure — Supabase already hosts our DB
- ✅ Authorization via application-level `requireAuth()` in API routes (see §3.4 for why not RLS)
- ✅ Built-in session management with `@supabase/ssr` Next.js helpers
- ✅ Server-side auth checks via Supabase service role key
- ⚠️ Must migrate admin auth from custom HMAC → Supabase custom claims (ADR-002)
- ⚠️ Need a DB trigger to sync Supabase `auth.users` → `profiles` table

**Alternatives considered:**
- **NextAuth (Auth.js):** Powerful but adds another dependency. Supabase's built-in auth avoids the double-auth problem.
- **Custom JWT:** Already have HMAC admin auth, but extending it to multi-user would reinvent the wheel. Supabase Auth is battle-tested.
- **Clerk:** Excellent DX but paid at scale. Supabase Auth is free up to 50k MAU.

### ADR-002: Migrate Admin Auth to Supabase Custom Claims

**Status:** Proposed  
**Date:** 2026-06-02

**Context:** Currently, admin auth uses custom HMAC-based session cookies (`lib/admin-auth.ts`). With Supabase Auth arriving, having two auth systems is confusing and risky.

**Decision:** After Phase 1 (Supabase Auth integration):
1. Assign `app_metadata: { role: "admin" }` to admin Supabase users via the Supabase dashboard
2. Replace `isAdminRequest()` in `lib/admin-auth.ts` with a Supabase session check that inspects `app_metadata.role`
3. Remove `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` env vars
4. Keep `lib/admin-auth.ts` as a thin wrapper exporting `isAdminRequest()` for backward compatibility

**Consequences:**
- ✅ Single auth system — one session for all users
- ✅ Admin can also participate in gamification (profile, XP)
- ✅ Admin check via `app_metadata.role` in application code (not RLS)
- ⚠️ Migration requires manual Supabase dashboard action (assign admin claim)
- ⚠️ Existing admin cookie sessions become invalid — needs coordinated cutover

---

## 3. Database Schema

### 3.1 New Models (Add to `prisma/schema.prisma`)

```prisma
// ─── User Profile (synced from Supabase Auth via trigger) ──────────────────
model Profile {
  id            String    @id @db.Uuid  // FK to auth.users.id
  username      String?   @unique @db.VarChar(30)
  displayName   String?   @db.VarChar(100)
  avatarUrl     String?   @db.VarChar(500)
  isAnonymous   Boolean   @default(false)  // Hide from leaderboards

  // ─── Unified XP ────────────────────────────────────────────────────────
  totalXp       Int       @default(0)      // Total across all tracks
  scholarXp     Int       @default(0)      // Learning track XP
  contributorXp Int       @default(0)      // Contribution track XP
  // NOTE: Rank is COMPUTED at read time by computeRank(totalXp). Do NOT write directly.

  // ─── Streaks ───────────────────────────────────────────────────────────
  currentStreak Int       @default(0)      // Consecutive days with ≥1 activity
  longestStreak Int       @default(0)
  lastActivityDate DateTime? @db.Timestamptz(6)

  // ─── Timestamps ─────────────────────────────────────────────────────────
  createdAt     DateTime  @default(now()) @db.Timestamptz(6)
  updatedAt     DateTime  @updatedAt @db.Timestamptz(6)

  // Relations
  contributions Contribution[]
  badges        UserBadge[]
  activities    ActivityLog[]
  quizAttempts  QuizAttempt[]
  drillSessions DrillSession[]
  flashcards    UserFlashcard[]

  @@index([lastActivityDate])
  @@map("profiles")
}

// ─── Contribution Tracking ────────────────────────────────────────────────
model Contribution {
  id          String   @id @default(cuid())
  userId      String   @db.Uuid
  profile     Profile  @relation(fields: [userId], references: [id], onDelete: Cascade)

  type        String   @db.VarChar(30)   // ADD_HEADWORD | EDIT_DEFINITION | ADD_EXAMPLE | FIX_TYPO | ADD_TAGALOG | REVIEW_APPROVED
  points      Int
  referenceId String?                     // Links to the affected entity (submission ID, definition ID, etc.)
  metadata    Json?                       // Extra context (e.g., word affected, before/after)

  createdAt   DateTime @default(now()) @db.Timestamptz(6)

  @@index([userId, createdAt])
  @@index([createdAt])                    // For monthly leaderboard queries
  @@map("contributions")
}

// ─── Badges ───────────────────────────────────────────────────────────────
model Badge {
  id          String      @id @default(cuid())
  slug        String      @unique     // e.g. "first_contribution", "streak_7"
  name        String                   // Display name
  description String                   // How to earn it
  icon        String                   // Emoji or icon name
  category    BadgeCategory            // contribution | learning | streak | milestone
  tier        Int         @default(1)  // 1=Bronze, 2=Silver, 3=Gold, 4=Diamond

  users       UserBadge[]

  @@map("badges")
}

enum BadgeCategory {
  CONTRIBUTION
  LEARNING
  STREAK
  MILESTONE
}

model UserBadge {
  id         String   @id @default(cuid())
  userId     String   @db.Uuid
  badgeId    String
  earnedAt   DateTime @default(now()) @db.Timestamptz(6)
  seen       Boolean  @default(false)  // Has user acknowledged? (for notification)

  profile    Profile  @relation(fields: [userId], references: [id], onDelete: Cascade)
  badge      Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)

  @@unique([userId, badgeId])
  @@index([badgeId])                         // "Who earned this badge?" queries
  @@map("user_badges")
}

// ─── Activity Log (daily engagement tracking) ────────────────────────────
model ActivityLog {
  id         String   @id @default(cuid())
  userId     String   @db.Uuid
  profile    Profile  @relation(fields: [userId], references: [id], onDelete: Cascade)

  type       String   @db.VarChar(30)   // QUIZ_COMPLETED | FLASHCARD_ROUND | DRILL_COMPLETED | DIALOGUE_COMPLETED | WORD_SUBMITTED | STREAK_MILESTONE | DAILY_GOAL_MET
  metadata   Json?                       // { wordCount: 5, score: 88, drillType: "substitution" }
  xpEarned   Int      @default(0)

  createdAt  DateTime @default(now()) @db.Timestamptz(6)

  @@index([userId, createdAt])
  @@map("activity_log")
}

// ─── Quiz Attempts (for computing accuracy stats) ────────────────────────
model QuizAttempt {
  id           String   @id @default(cuid())
  userId       String   @db.Uuid
  profile      Profile  @relation(fields: [userId], references: [id], onDelete: Cascade)

  totalQuestions Int
  correctAnswers Int
  score          Float       // 0.0–1.0
  duration       Int?        // Seconds spent

  createdAt    DateTime @default(now()) @db.Timestamptz(6)

  @@index([userId, createdAt])
  @@map("quiz_attempts")
}

// ─── Drill Sessions ─────────────────────────────────────────────────────
model DrillSession {
  id           String   @id @default(cuid())
  userId       String   @db.Uuid
  profile      Profile  @relation(fields: [userId], references: [id], onDelete: Cascade)

  phase        Int          // 1=Substitution, 2=Transformation, 3=Response
  totalRounds  Int
  correctRounds Int
  score         Float       // 0.0–1.0

  createdAt    DateTime @default(now()) @db.Timestamptz(6)

  @@index([userId, createdAt])
  @@map("drill_sessions")
}
```

### 3.2 Modify Existing Models

**UserSubmission** — add `userId`, `pointsAwarded`, `updatedAt`, and performance indexes:

```prisma
model UserSubmission {
  // ... existing fields ...
  userId        String?   @db.Uuid                         // NEW: links to submitter
  pointsAwarded Int?      @default(0)                      // NEW: points given on approval
  updatedAt     DateTime? @updatedAt @db.Timestamptz(6)    // NEW: track approval/edit time

  @@index([userId, status])                                // NEW: "my pending submissions"
  @@index([status, created_at])                            // NEW: admin filter by status
}
```

**UserFlashcard** — add bidirectional relation to Profile. The existing `user_id` column must be backfilled before making non-nullable:

```prisma
model UserFlashcard {
  id                Int       @id @default(autoincrement())
  user_id           String    @db.Uuid                      // Made non-nullable (backfill NULLs first!)
  profile           Profile   @relation(fields: [user_id], references: [id], onDelete: Cascade)  // NEW relation
  word_bikol        String
  proficiency_score Int?      @default(0)
  next_review       DateTime? @db.Timestamptz(6)
  created_at        DateTime? @default(now()) @db.Timestamptz(6)

  @@map("user_flashcards")
}
```

> ⚠️ **Migration warning:** Before making `user_id` non-nullable, run:
> ```sql
> DELETE FROM user_flashcards WHERE user_id IS NULL;
> -- OR assign a placeholder:
> -- UPDATE user_flashcards SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id IS NULL;
> ```

### 3.3 Database Trigger (Supabase Auth → Profiles sync)

```sql
-- Run in Supabase SQL Editor after creating profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, username)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3.4 Authorization Strategy

The app uses **application-level authorization** rather than PostgreSQL Row-Level Security (RLS).

**Why not RLS?** Prisma connects via the Supabase connection pooler using the service role key, which bypasses RLS entirely. RLS policies would be dead code for all server-side Prisma queries. Instead, authorization is enforced in API route handlers via `requireAuth()` (see §4.2).

**Auth patterns by route:**
- **Public routes** (browse, search, word pages): No auth check — accessible to everyone
- **Authenticated routes** (profile, XP, streaks, leaderboard submission): `requireAuth()` gate — rejects with 401 if no session
- **Admin routes** (submission management): `requireAuth()` + Supabase `app_metadata.role === "admin"` check (Phase 4)
- **Optional-auth routes** (contribute, learn): Accept `userId` if present; fall back to anonymous mode

This approach keeps authorization logic in TypeScript (testable, debuggable, source-controlled) rather than scattered across SQL policies that Prisma silently bypasses.

---

## 4. Authentication Architecture

### 4.1 Client-Side Flow

```
User visits app
  │
  ├─ No session → "Sign In" button in nav
  │   └─ Supabase Auth UI (email/password or magic link)
  │
  └─ Has session → Profile avatar in nav, gamification widget in header
      └─ All API calls include Supabase session cookie automatically
```

### 4.2 Server-Side (API Routes)

```typescript
// lib/supabase-server.ts (NEW)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options))
        },
      },
    }
  )
}

export async function getSessionUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user  // null if not authenticated
}

export async function requireAuth() {
  const user = await getSessionUser()
  if (!user) throw new Error('Unauthorized')
  return user
}
```

### 4.3 API Route Pattern

```typescript
// app/api/gamification/xp/route.ts
import { requireAuth } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const { activity, metadata } = await request.json()

    // Award XP, update streak, check badges...
    // ...

    return NextResponse.json({ xpEarned: 10, newTotal: 450 })
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
```

### 4.4 Frontend Auth Context

```typescript
// hooks/useAuth.ts (NEW)
'use client'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  // Fetch profile when user changes
  useEffect(() => {
    if (!user) { setProfile(null); return }
    fetch(`/api/profile/${user.id}`).then(r => r.json()).then(setProfile)
  }, [user])

  return { user, profile, supabase }
}
```

---

## 5. Gamification Mechanics

### 5.1 Contribution XP Rules

| Action | XP | Condition |
|--------|-----|-----------|
| New headword submitted + approved | 10 | Only on admin approval, not submission |
| Edit definition approved | 5 | Only if change was substantive |
| Add example sentence approved | 15 | Must have both Bikol + English |
| Fix typo/error approved | 3 | Minor corrections |
| Add Tagalog translation approved | 5 | One-time per definition |
| Submission bonus (high quality) | +2 | Admin marks as "high quality" on approval |

**Key anti-spam rule:** XP is awarded **only on admin approval**, never on submission. This prevents junk submissions from gaming the leaderboard.

**Duplicate detection:** If a user submits a word that already exists, no XP is awarded even if approved (admin would reject).

### 5.2 Learning XP Rules

| Activity | Base XP | Bonus |
|----------|---------|-------|
| Quiz completed | 2 | +0–8 based on score (e.g., 80% = +6.4, round down) |
| Flashcard reviewed | 1 | +0 if recalled correctly, +1 if "hard" (effort bonus) |
| Drill phase completed | 5 | +0–10 based on accuracy |
| Dialogue completed | 10 | +0–10 based on linguistic audit score / 10 |
| Daily goal met (e.g., 50 XP in a day) | 10 | Bonus for consistency |
| Streak milestone (7 days) | 25 | Every 7th consecutive day |
| Streak milestone (30 days) | 100 | Major milestone |
| Streak milestone (100 days) | 500 | Epic milestone |
| SRS mastery (proficiency ≥ 95) | 5 | Per word reaching mastery |

### 5.3 XP Formula: Quiz Scoring

```
quizXp = 2 + floor(score * 8)
```

Where `score = correctAnswers / totalQuestions` (0.0 – 1.0).

Examples:
- 10/10 (100%) → 2 + 8 = **10 XP**
- 5/10 (50%) → 2 + 4 = **6 XP**
- 0/10 (0%) → 2 + 0 = **2 XP** (participation floor)

### 5.4 Tier Ranks (Cross-Track)

| Rank | Total XP Required | Title |
|------|--------------------|-------|
| 1 | 0–99 | **New Contributor** |
| 2 | 100–499 | **Active Contributor** |
| 3 | 500–999 | **Senior Contributor** |
| 4 | 1,000–4,999 | **Lexicographer** |
| 5 | 5,000–14,999 | **Master Lexicographer** |
| 6 | 15,000+ | **Grand Lexicographer** |

Ranks are computed at read time via `computeRank(totalXp)` — a pure function with 6 branches. No need to store a denormalized `rank` field that could drift from `totalXp`.

```typescript
// lib/gamification.ts
function computeRank(totalXp: number): string {
  if (totalXp >= 15000) return 'Grand Lexicographer'
  if (totalXp >= 5000)  return 'Master Lexicographer'
  if (totalXp >= 1000)  return 'Lexicographer'
  if (totalXp >= 500)   return 'Senior Contributor'
  if (totalXp >= 100)   return 'Active Contributor'
  return 'New Contributor'
}
```

### 5.5 Badge Definitions (Seeded on Deploy)

| Badge | Category | How to Earn | Icon |
|-------|----------|-------------|------|
| First Contribution | CONTRIBUTION | 1 approved submission | 🌱 |
| 10 Contributions | CONTRIBUTION, tier 2 | 10 approved submissions | 🌿 |
| 50 Contributions | CONTRIBUTION, tier 3 | 50 approved submissions | 🌳 |
| 100 Contributions | CONTRIBUTION, tier 4 | 100 approved submissions | 🏆 |
| First Quiz | LEARNING | Complete 1 quiz | 📝 |
| Quiz Master | LEARNING, tier 3 | Score 90%+ on 10 quizzes | 🧠 |
| 100 Flashcards | LEARNING, tier 2 | Review 100 flashcards | 📚 |
| 500 Flashcards | LEARNING, tier 3 | Review 500 flashcards | 📖 |
| Drill Sergeant | LEARNING, tier 2 | Complete all 3 phases | 🎯 |
| Dialogue Pro | LEARNING, tier 3 | Complete 20 dialogues | 💬 |
| 7-Day Streak | STREAK | 7 consecutive days | 🔥 |
| 30-Day Streak | STREAK, tier 3 | 30 consecutive days | 💪 |
| 100-Day Streak | STREAK, tier 4 | 100 consecutive days | ⚡ |
| 500 XP | MILESTONE | Reach 500 total XP | ⭐ |
| 5,000 XP | MILESTONE, tier 3 | Reach 5,000 total XP | 🌟 |
| 15,000 XP | MILESTONE, tier 4 | Reach 15,000 total XP | 💎 |

### 5.6 Streak System

**Rules:**
- A "day of activity" is any day where the user earns ≥1 XP
- Streak continues as long as there's activity on consecutive UTC calendar days
- Missed a day? Streak resets to 0
- `longestStreak` is preserved independently
- Streak is computed server-side from `ActivityLog` entries (no client-side manipulation)

**Implementation:**
```typescript
// lib/streak.ts (NEW)
async function updateStreak(userId: string) {
  const today = new Date().toISOString().split('T')[0] // "2026-06-02"
  const yesterday = /* UTC yesterday */

  const profile = await prisma.profile.findUnique({ where: { id: userId } })
  if (!profile) return

  const lastDate = profile.lastActivityDate?.toISOString().split('T')[0]

  if (lastDate === today) {
    return // Already active today, no change
  } else if (lastDate === yesterday) {
    // Consecutive day — increment
    const newStreak = profile.currentStreak + 1
    await prisma.profile.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, profile.longestStreak),
        lastActivityDate: new Date(),
      }
    })
    // Check streak milestones
    await checkStreakBadges(userId, newStreak)
  } else {
    // Streak broken — reset
    await prisma.profile.update({
      where: { id: userId },
      data: { currentStreak: 1, lastActivityDate: new Date() },
    })
  }
}
```

### 5.7 Spaced Repetition (SRS)

The existing `UserFlashcard` model already has `proficiency_score` and `next_review`. Integrate an SM-2 algorithm:

```typescript
// lib/srs.ts (NEW)
export function updateSRS(
  currentProficiency: number,
  quality: number  // 0–5, how well user recalled
): { newProficiency: number; nextReview: Date } {
  // SM-2 algorithm
  if (quality < 3) {
    // Failed recall — reset
    return {
      newProficiency: Math.max(0, currentProficiency - 20),
      nextReview: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    }
  }

  const interval = currentProficiency < 30 ? 1 :
                   currentProficiency < 60 ? 3 :
                   currentProficiency < 80 ? 7 :
                   currentProficiency < 90 ? 14 : 30

  const bonus = quality === 5 ? 5 : quality === 4 ? 0 : -5

  return {
    newProficiency: Math.min(100, currentProficiency + 10 + bonus),
    nextReview: new Date(Date.now() + interval * 24 * 60 * 60 * 1000),
  }
}
```

### 5.8 Leaderboard

Two views:
- **All-Time Leaderboard** — sorted by `totalXp DESC`, top 100
- **Monthly Leaderboard** — sorted by XP earned this month, top 50

Privacy: Users with `isAnonymous: true` appear as "Anonymous Lexicographer" with a masked avatar. Users can toggle this on their profile page.

### 5.9 Weekly Shoutout

Every Monday, a serverless cron (GitHub Actions scheduled workflow) queries the top 3 contributors of the past week. A notification is shown via an in-app banner (stored in a `notifications` JSON field on Profile, or a simple Redis-backed flag). Phase 1 can simply show a static "Top Contributors This Week" section on the homepage.

---

## 6. API Design

### 6.1 New API Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/auth/callback` | GET | No | Supabase Auth callback handler |
| `/api/profile/[id]` | GET | No* | Get public profile + stats |
| `/api/profile/me` | GET | Yes | Get own full profile + stats |
| `/api/profile/me` | PATCH | Yes | Update username, display_name, isAnonymous |
| `/api/gamification/xp` | POST | Yes | Award XP (called internally by quiz/drill routes) |
| `/api/gamification/streak` | GET | Yes | Get current streak + history |
| `/api/gamification/badges` | GET | Yes | Get earned badges |
| `/api/gamification/leaderboard` | GET | No | All-time + monthly leaderboard |
| `/api/gamification/activity` | GET | Yes | Recent activity feed |
| `/api/learn/complete` | POST | Yes | Complete a quiz/drill/dialogue + award XP |
| `/api/flashcards/review` | POST | Yes | Log flashcard review + update SRS |
| `/api/contribute` | POST | Optional Auth | Submit word (userId attached if logged in) |

\* Public profiles show limited info; `isAnonymous` profiles show masked data.

### 6.2 API Hook: Award XP on Approval

When an admin approves a submission (existing `PATCH /api/submit`), add a post-approval hook:

```typescript
// In app/api/submit/route.ts — after status === "approved"
if (status === "approved" && fullSubmission.userId) {
  const xpTable = {
    // ADD_HEADWORD: 10, EDIT_DEFINITION: 5, etc.
  }
  const xpType = determineXpType(fullSubmission) // logic to infer type
  const points = xpTable[xpType]

  await tx.contribution.create({
    data: {
      userId: fullSubmission.userId,
      type: xpType,
      points,
      referenceId: String(fullSubmission.id),
    },
  })

  await tx.profile.update({
    where: { id: fullSubmission.userId },
    data: {
      contributorXp: { increment: points },
      totalXp: { increment: points },
    },
  })

  // Rank is computed at read time by computeRank(totalXp) — no DB write needed
}
```

### 6.3 API Hook: Complete Learning Activity

Called from the client after finishing a quiz phase, drill, or dialogue:

```typescript
// POST /api/learn/complete
// Body: { activityType: 'QUIZ_COMPLETED', score: 0.88, metadata: {...} }
// Response: { xpEarned: 10, newTotal: 450, newStreak: 5, newBadges: [...] }
```

---

## 7. Frontend Components

### 7.1 New Components

| Component | Purpose |
|-----------|---------|
| `AuthProvider` | Wraps app with Supabase auth context |
| `SignInModal` | Email/password + magic link sign-in UI |
| `ProfilePage` | `/profile` — shows stats, badges, contributions, settings |
| `LeaderboardWidget` | Top-10 card on homepage (mini) |
| `LeaderboardPage` | `/leaderboard` — full all-time + monthly view |
| `XpToast` | Animated "+10 XP" toast on activity completion |
| `StreakIndicator` | 🔥 5-day streak badge in nav/header |
| `BadgeGrid` | Display earned badges on profile |
| `ActivityFeed` | "Today you..." timeline |
| `RankCard` | Shows current rank, XP to next tier, progress bar |
| `WeeklyTopContributors` | Shoutout section on homepage |

### 7.2 Modified Components

| Component | Change |
|-----------|--------|
| `DesktopNav` | Add profile avatar / sign-in button |
| `MobileNav` | Add auth status to mobile menu |
| `LearnPage` | Connect stats to real data; show XpToast on phase complete |
| `FlashcardsPage` | Log reviews to API; show SRS progress |
| `ContributePage` | Attach userId if logged in; show contribution count |
| `HomePage` | Add mini-leaderboard + weekly shoutout section |
| `Quiz` | Log completion to API; show XpToast |

### 7.3 Empty States

- **Not signed in:** Show gamification features with a "Sign in to track progress" CTA. Never block core functionality (browse, search, learn, contribute) behind auth.
- **Signed in, no activity:** "Start your Bikol journey! Complete your first quiz to earn XP."
- **Signed in, no contributions:** "Share your knowledge! Submit your first word to earn Contributor XP."

---

## 8. Implementation Phases

### Phase 1: Foundation (Week 1–2) — Auth + Profiles + DB

**Goal:** Users can sign up, sign in, and have a profile. Anonymous app usage unchanged.

**Steps:**
1. **Install Supabase packages:** `@supabase/ssr`, `@supabase/supabase-js`
2. **Set up env vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
3. **Create Prisma models:** `Profile`, `Contribution`, `Badge`, `UserBadge`, `ActivityLog`, `QuizAttempt`, `DrillSession` (run `prisma migrate dev`)
4. **Create DB trigger:** `handle_new_user()` → auto-creates Profile on signup
5. **Create Supabase server client** (`lib/supabase-server.ts`)
6. **Create auth context hook** (`hooks/useAuth.ts`)
7. **Add `AuthProvider`** to `app/providers.tsx`
8. **Build `SignInModal`** component
9. **Add auth to nav** (`DesktopNav`, `MobileNav`)
10. **Create `/auth/callback` route**
11. **Add `userId` to `UserSubmission`** schema + migration
12. **Create profile API routes** (`GET /api/profile/[id]`, `PATCH /api/profile/me`)

**Validation:**
- User can sign up → profile auto-created
- User can sign in → session persists across page loads
- Anonymous browsing, search, learn, contribute still work without sign-in
- Admin auth still works (custom HMAC, not yet migrated)

### Phase 2: Contribution Gamification (Week 2–3) — XP + Leaderboard + Badges

**Goal:** Contributors earn XP on approval. Leaderboard visible. Badges awarded.

**Steps:**
1. **Seed badges** — Script to insert badge definitions into DB
2. **Implement XP hook** in `POST /api/submit` (approve path) — award contribution XP
3. **Create `computeRank()`** utility in `lib/gamification.ts`
4. **Create contribution API** — `GET /api/gamification/leaderboard`, `GET /api/gamification/badges`
5. **Build `LeaderboardWidget`** — mini version for homepage
6. **Build `LeaderboardPage`** — `/leaderboard`
7. **Build `BadgeGrid`** — for profile page
8. **Add leaderboard link to nav** (`NAV_LINKS` in `lib/constants.ts`)
9. **Add "Top Contributors" section** to homepage (SSR'd from leaderboard API)
10. **Test:** Submit a word as logged-in user → admin approves → XP awarded → leaderboard updates

**Validation:**
- Submit word → admin approves → XP added to profile
- Leaderboard shows ranked users correctly
- Badge awarded on reaching "First Contribution"

### Phase 3: Learning Gamification (Week 3–4) — XP + Streaks + Real Stats

**Goal:** Learning activities award XP. Streaks tracked. Learn page shows real stats.

**Steps:**
1. **Implement `updateStreak()`** in `lib/streak.ts`
2. **Implement SM-2 SRS** in `lib/srs.ts`
3. **Create `POST /api/learn/complete`** — award scholar XP, log activity, update streak
4. **Create `POST /api/flashcards/review`** — log review, update SRS proficiency
5. **Create `GET /api/gamification/activity`** — activity feed
6. **Build `XpToast`** component
7. **Build `StreakIndicator`** component
8. **Build `ActivityFeed`** component
9. **Integrate with `Quiz`** — call `/api/learn/complete` on finish
10. **Integrate with `SubstitutionDrill`** — call `/api/learn/complete` on phase complete
11. **Integrate with `AppliedFluency`** — call `/api/learn/complete` after dialogue + audit
12. **Integrate with `Flashcards`** — call `/api/flashcards/review` per card
13. **Replace hardcoded stats in `LearnPage`** with real data from `/api/profile/me`
14. **Build `RankCard`** — progress to next tier

**Validation:**
- Complete quiz → "+10 XP" toast appears → streak increments
- Learn page shows real accuracy, streak, vocabulary bloom from DB
- Flashcard reviews update SRS proficiency and next_review date

### Phase 4: Migration + Polish (Week 4–5) — Admin Auth + Anonymous UX

**Goal:** Single auth system. Anonymous contributions still possible. Polish everything.

**Steps:**
1. **Migrate admin auth:** Add Supabase custom claim `{ role: "admin" }` to admin user
2. **Update `lib/admin-auth.ts`:** Replace HMAC check with Supabase JWT role check (backward-compatible wrapper)
3. **Remove `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET`** env vars
4. **Build `ProfilePage`** — `/profile` with all stats, badges, privacy toggle
5. **Build `WeeklyTopContributors`** — query top 3 from weekly activity
6. **Private leaderboard option** — respect `isAnonymous` flag
7. **Empty states:** Add "Sign in to track" CTAs everywhere
8. **Performance:** Add Redis caching for leaderboard (optional, Phase 4)
9. **E2E tests:** Auth flow, XP flow, leaderboard accuracy
10. **Documentation:** Update README with auth + gamification docs

**Validation:**
- Admin can still access admin panel with Supabase session
- Admin can see their own gamification profile
- Anonymous users can still submit words (uncredited)
- Anonymous users can still learn (uncredited)
- `isAnonymous` users hidden from leaderboard

---

## 9. Migration Strategy

### 9.1 Anonymous → Auth: Contribution Attribution

**Problem:** Existing submissions have no `userId`. Past contributors can't claim credit.

**Solution (post-launch):**
1. Add a "Claim your contributions" flow on the profile page
2. User enters the exact Bikol word they submitted
3. If the word + timestamp roughly matches their signup date, offer to link
4. Manual admin override for edge cases

**Phase 1 is fine without this.** Contribution tracking starts from Day 1 of launch. Past contributors are recognized in a "Legacy Contributors" section (hardcoded names, no XP).

### 9.2 Anonymous Learning → Auth: Progress Preservation

**Problem:** Users who learn without signing in lose all progress.

**Solution:**
1. Store learning progress in `localStorage` for anonymous users (limited to device)
2. On sign-up, offer to "Import your local progress"
3. Merge local progress with new account (upsert flashcards, keep higher proficiency)

### 9.3 Admin Auth Cutover

**Sequence (no downtime):**
1. Deploy Supabase Auth (Phase 1) — HMAC admin auth still works
2. Deploy admin claim migration code (Phase 4) — both work during transition
3. Add Supabase `{ role: "admin" }` claim to admin user(s) via Supabase dashboard
4. Remove `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` env vars
5. Deploy — admin now uses Supabase session only

**Rollback:** If Supabase Auth fails, revert env vars + code to HMAC. Both systems are independent until env vars are removed.

---

## 10. Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Spam submissions for XP** | High | XP only on admin approval, not submission. Quality gates. Rate limiting on submit API (see `IMPLEMENTATION_TODO_TOMORROW.md`). |
| **Supabase Auth outage** | Medium | Supabase has 99.9% SLA. Core app (browse, search) works without auth. Auth outage = gamification paused, no data loss. |
| **Streak manipulation** | Low | Streaks computed server-side from `ActivityLog` timestamps. Client can't forge past activity. |
| **Leaderboard toxicity** | Low | `isAnonymous` toggle. Username validation (no offensive names). Admin can ban/rename. |
| **DB trigger failure** | Medium | Monitor `profiles` table after signups. Add health check that compares `auth.users` count to `profiles` count. |
| **Prisma ↔ Supabase RLS conflict** | Medium | Resolved: RLS policies dropped entirely (§3.4). Authorization enforced in API route handlers via `requireAuth()`. No dual-path auth to test. |
| **Migration data loss** | Low | All migrations are additive (new tables, new columns). No destructive changes. Rollback via `prisma migrate down`. |

---

## 11. Success Criteria

- [ ] Users can sign up with email/password or magic link
- [ ] Profile auto-created on signup with zero XP
- [ ] Anonymous users can still browse, search, learn, contribute (unchanged)
- [ ] Approved contributions award XP within 1 second of admin approval
- [ ] Leaderboard updates in real-time (or within page refresh)
- [ ] Quiz/drill/dialogue completion awards XP and increments streak
- [ ] Learning page shows real stats (not hardcoded)
- [ ] Flashcard reviews use spaced repetition (SM-2)
- [ ] Badges awarded automatically on milestone achievement
- [ ] Admin can access admin panel with Supabase session (Phase 4)
- [ ] `isAnonymous` users hidden from leaderboard
- [ ] All existing tests pass (`bun test`)
- [ ] New Prisma migrations apply cleanly
- [ ] TypeScript compiles with zero errors (`bun run typecheck` or `npx tsc --noEmit`)

---

## Appendix A: Package Dependencies

```json
{
  "@supabase/ssr": "^0.5.0",
  "@supabase/supabase-js": "^2.45.0"
}
```

Install via: `bun add @supabase/ssr @supabase/supabase-js`

## Appendix B: Environment Variables

```bash
# Supabase Auth (add to .env.local and Vercel)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...  # Server-side only, NEVER expose

# Remove after Phase 4
ADMIN_PASSWORD=...        # Deprecated
ADMIN_SESSION_SECRET=...  # Deprecated
```

## Appendix C: Weekly Shoutout Cron (GitHub Actions)

```yaml
# .github/workflows/weekly-shoutout.yml
name: Weekly Top Contributors
on:
  schedule:
    - cron: '0 8 * * 1'  # Every Monday 8 AM UTC
jobs:
  shoutout:
    runs-on: ubuntu-latest
    steps:
      - name: Compute top 3
        run: |
          # Query DB for top contributors this week
          # Write to a JSON file or update a DB flag
```

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2026-06-02 | 2.1.0 | Schema review fixes: `@db.Timestamptz(6)` on all DateTime fields, removed `rank` (compute at read time), `ContributionType`/`ActivityType` → String fields, added missing indexes, UserFlashcard relation fix, RLS → application-level auth, added `updatedAt` to UserSubmission |
| 2026-06-02 | 2.0.0 | Complete rewrite: dual-track gamification, full DB schema, Supabase Auth integration, SRS, streaks, ADRs, migration strategy, 4-phase implementation plan |
| 2026-06-01 | 1.0.0 | Initial draft (contribution-only gamification, basic auth) |
