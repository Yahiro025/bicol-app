-- Performance indexes for browse, search, and filter queries
-- These dramatically speed up UNION ALL queries, LIKE filters, and ORDER BY operations

-- Roots table indexes
CREATE INDEX IF NOT EXISTS idx_roots_bikol_lower ON roots (LOWER(bikol));
CREATE INDEX IF NOT EXISTS idx_roots_bikol ON roots (bikol);
CREATE INDEX IF NOT EXISTS idx_roots_category_lower ON roots (LOWER(category));
CREATE INDEX IF NOT EXISTS idx_roots_category ON roots (category);
CREATE INDEX IF NOT EXISTS idx_roots_frequency_rank ON roots (frequency_rank);

-- Words table indexes
CREATE INDEX IF NOT EXISTS idx_words_bikol_lower ON words (LOWER(bikol));
CREATE INDEX IF NOT EXISTS idx_words_bikol ON words (bikol);
CREATE INDEX IF NOT EXISTS idx_words_category_lower ON words (LOWER(category));
CREATE INDEX IF NOT EXISTS idx_words_category ON words (category);
CREATE INDEX IF NOT EXISTS idx_words_frequency_rank ON words (frequency_rank);

-- Definitions foreign key index (speeds up LATERAL joins)
CREATE INDEX IF NOT EXISTS idx_definitions_rootid ON definitions ("rootId");
