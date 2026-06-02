-- CreateEnum
CREATE TYPE "BadgeCategory" AS ENUM ('CONTRIBUTION', 'LEARNING', 'STREAK', 'MILESTONE');

-- CreateTable: profiles
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "username" VARCHAR(30),
    "display_name" VARCHAR(100),
    "avatar_url" VARCHAR(500),
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "scholarXp" INTEGER NOT NULL DEFAULT 0,
    "contributorXp" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable: contributions
CREATE TABLE "contributions" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "type" VARCHAR(30) NOT NULL,
    "points" INTEGER NOT NULL,
    "referenceId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: badges
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" "BadgeCategory" NOT NULL,
    "tier" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable: user_badges
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable: activity_log
CREATE TABLE "activity_log" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "type" VARCHAR(30) NOT NULL,
    "metadata" JSONB,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable: quiz_attempts
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable: drill_sessions
CREATE TABLE "drill_sessions" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "phase" INTEGER NOT NULL,
    "totalRounds" INTEGER NOT NULL,
    "correctRounds" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drill_sessions_pkey" PRIMARY KEY ("id")
);

-- AlterTable: user_submissions — add gamification fields
ALTER TABLE "user_submissions"
ADD COLUMN IF NOT EXISTS "userId" UUID,
ADD COLUMN IF NOT EXISTS "pointsAwarded" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ(6);

-- AlterTable: user_flashcards — add profile relation via FK
ALTER TABLE "user_flashcards"
ADD CONSTRAINT "user_flashcards_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "profiles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Unique constraints
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");
CREATE UNIQUE INDEX "badges_slug_key" ON "badges"("slug");
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");

-- Indexes for performance
CREATE INDEX "profiles_lastActivityDate_idx" ON "profiles"("lastActivityDate");
CREATE INDEX "contributions_userId_createdAt_idx" ON "contributions"("userId", "createdAt");
CREATE INDEX "contributions_createdAt_idx" ON "contributions"("createdAt");
CREATE INDEX "user_badges_badgeId_idx" ON "user_badges"("badgeId");
CREATE INDEX "activity_log_userId_createdAt_idx" ON "activity_log"("userId", "createdAt");
CREATE INDEX "quiz_attempts_userId_createdAt_idx" ON "quiz_attempts"("userId", "createdAt");
CREATE INDEX "drill_sessions_userId_createdAt_idx" ON "drill_sessions"("userId", "createdAt");
CREATE INDEX "user_submissions_userId_status_idx" ON "user_submissions"("userId", "status");
CREATE INDEX "user_submissions_status_created_at_idx" ON "user_submissions"("status", "created_at");

-- Foreign keys
ALTER TABLE "contributions"
ADD CONSTRAINT "contributions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "profiles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_badges"
ADD CONSTRAINT "user_badges_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "profiles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_badges"
ADD CONSTRAINT "user_badges_badgeId_fkey"
    FOREIGN KEY ("badgeId") REFERENCES "badges"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "activity_log"
ADD CONSTRAINT "activity_log_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "profiles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quiz_attempts"
ADD CONSTRAINT "quiz_attempts_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "profiles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "drill_sessions"
ADD CONSTRAINT "drill_sessions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "profiles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
