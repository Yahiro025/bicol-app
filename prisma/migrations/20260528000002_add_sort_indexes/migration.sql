-- Composite sort indexes for frequency-based ordering
-- These support the ORDER BY COALESCE(frequency_rank, 999999) ASC, LOWER(bikol) ASC pattern

-- Roots: composite index for frequency sort
CREATE INDEX IF NOT EXISTS idx_roots_frequency_sort ON roots (COALESCE(frequency_rank, 999999), LOWER(bikol));

-- Words: composite index for frequency sort
CREATE INDEX IF NOT EXISTS idx_words_frequency_sort ON words (COALESCE(frequency_rank, 999999), LOWER(bikol));

-- Search performance: trigram index on roots.bikol for faster similarity() queries
-- (idempotent if extension/index already exist)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_roots_bikol_trgm ON roots USING gin (bikol gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_words_bikol_trgm ON words USING gin (bikol gin_trgm_ops);
