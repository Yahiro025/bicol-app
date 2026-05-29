-- Partial index on words.confidence to speed up learn/flashcard queries
-- The learn API filters WHERE confidence >= 0.8, so we only index relevant rows
CREATE INDEX IF NOT EXISTS idx_words_confidence_high ON words (confidence) WHERE confidence >= 0.8;
