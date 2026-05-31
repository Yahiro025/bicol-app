ALTER TABLE "user_submissions"
ADD COLUMN IF NOT EXISTS "tagalog" TEXT;

-- Copy existing records: set tagalog to NULL initially (no backfill needed)
