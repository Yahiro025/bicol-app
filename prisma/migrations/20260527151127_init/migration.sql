-- CreateEnum
CREATE TYPE "FocusClass" AS ENUM ('ON_CLASS', 'I_CLASS', 'AN_CLASS', 'MAG_INTRANSITIVE', 'UNKNOWN');

-- CreateTable
CREATE TABLE "words" (
    "id" BIGSERIAL NOT NULL,
    "bikol" TEXT,
    "english" TEXT,
    "pos" TEXT,
    "category" TEXT,
    "dialect" TEXT,
    "example_bikol" TEXT,
    "example_english" TEXT,
    "pronunciation" TEXT,
    "synonyms" TEXT,
    "tagalog" TEXT,
    "confidence" DOUBLE PRECISION DEFAULT 1.0,
    "source_url" TEXT,
    "audio_url" TEXT,
    "etymology" TEXT,
    "frequency_rank" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roots" (
    "id" TEXT NOT NULL,
    "bikol" TEXT NOT NULL,
    "pos" TEXT,
    "category" TEXT,
    "pronunciation" TEXT,
    "etymology" TEXT,
    "frequency_rank" INTEGER,
    "audio_url" TEXT,
    "focusClass" "FocusClass" NOT NULL DEFAULT 'UNKNOWN',
    "isTransitive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "definitions" (
    "id" TEXT NOT NULL,
    "rootId" TEXT NOT NULL,
    "english" TEXT,
    "dialect" TEXT,
    "synonyms" TEXT,
    "tagalog" TEXT,
    "aiConfidence" DOUBLE PRECISION DEFAULT 1.0,
    "source_url" TEXT,
    "affixPair" TEXT DEFAULT 'UNKNOWN',
    "focusType" TEXT DEFAULT 'UNKNOWN',
    "series" TEXT DEFAULT 'REGULAR',
    "isVerified" BOOLEAN DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conjugations" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "tense" TEXT,
    "focus" TEXT,
    "form" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conjugations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "example_sentences" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "bikol" TEXT,
    "english" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "example_sentences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_submissions" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "dialect" TEXT,
    "status" TEXT DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_flashcards" (
    "id" SERIAL NOT NULL,
    "user_id" UUID,
    "word_bikol" TEXT NOT NULL,
    "proficiency_score" INTEGER DEFAULT 0,
    "next_review" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_flashcards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dialogue_scenarios" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'beginner',
    "visualCue" TEXT NOT NULL,
    "vocabulary" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dialogue_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_bikol_word" ON "words"("bikol");

-- CreateIndex
CREATE UNIQUE INDEX "conjugations_definitionId_tense_focus_key" ON "conjugations"("definitionId", "tense", "focus");

-- AddForeignKey
ALTER TABLE "definitions" ADD CONSTRAINT "definitions_rootId_fkey" FOREIGN KEY ("rootId") REFERENCES "roots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conjugations" ADD CONSTRAINT "conjugations_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "example_sentences" ADD CONSTRAINT "example_sentences_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
