/**
 * Fuzzy String Matching Utilities
 *
 * Provides Damerau-Levenshtein distance and related scoring for
 * typo-tolerant search across both client (SearchBar) and server
 * (API fallback when PostgreSQL pg_trgm is unavailable).
 */

// ─── Damerau-Levenshtein Distance ──────────────────────────────────────────

/**
 * Computes the Damerau-Levenshtein distance between two strings.
 * Supports transpositions (swapped adjacent characters) in addition to
 * insertions, deletions, and substitutions — making it forgiving of
 * common typos like "psa" → "pas", "recieve" → "receive", etc.
 *
 * Uses the optimal string alignment (OSA) variant for O(n*m) performance.
 */
export function damerauLevenshtein(a: string, b: string): number {
  const aLen = a.length;
  const bLen = b.length;

  if (aLen === 0) return bLen;
  if (bLen === 0) return aLen;

  // Create (aLen+2) × (bLen+2) matrix with extra row/col for alphabet
  const rows = aLen + 2;
  const cols = bLen + 2;
  const d: number[][] = [];
  for (let i = 0; i < rows; i++) {
    d[i] = new Array<number>(cols).fill(0);
  }

  const maxDist = aLen + bLen;
  d[0]![0] = maxDist;

  for (let i = 0; i <= aLen; i++) {
    d[i + 1]![1] = i;
    d[i + 1]![0] = maxDist;
  }
  for (let j = 0; j <= bLen; j++) {
    d[1]![j + 1] = j;
    d[0]![j + 1] = maxDist;
  }

  // Last position in alphabet for each character
  const da = new Map<string, number>();
  for (const ch of new Set([...a, ...b])) {
    da.set(ch, 0);
  }

  for (let i = 1; i <= aLen; i++) {
    let db = 0;
    for (let j = 1; j <= bLen; j++) {
      const i1 = da.get(b[j - 1]!) ?? 0;
      const j1 = db;

      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      if (cost === 0) db = j;

      d[i + 1]![j + 1] = Math.min(
        d[i]![j]! + cost,                              // substitution / no-op
        d[i + 1]![j]! + 1,                             // insertion
        d[i]![j + 1]! + 1,                             // deletion
        d[i1]![j1]! + (i - i1 - 1) + 1 + (j - j1 - 1) // transposition
      );
    }
    da.set(a[i - 1]!, i);
  }

  return d[aLen + 1]![bLen + 1]!;
}

// ─── Normalized Similarity Score ────────────────────────────────────────────

/**
 * Returns a similarity score in [0, 1] where 1 = identical and 0 = completely different.
 * Uses the longest string as the denominator so partial matches on short queries
 * against long strings don't get unfairly penalized.
 */
export function stringSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const lowerA = a.toLowerCase();
  const lowerB = b.toLowerCase();

  if (lowerA === lowerB) return 1;

  const dist = damerauLevenshtein(lowerA, lowerB);
  const maxLen = Math.max(lowerA.length, lowerB.length);

  return 1 - dist / maxLen;
}

// ─── Fuzzy Match Scoring for Search ────────────────────────────────────────

export interface FuzzyMatch<T> {
  item: T;
  score: number;
  /** Which field matched best */
  matchedField: string;
}

/**
 * Scores items against a query using a configurable set of text extractors.
 * Each extractor returns a string (e.g., bikol word, english translation) and
 * the best match across all fields is used as the final score.
 *
 * Scoring tiers:
 *   - Exact match: 1.0
 *   - Starts with query: 0.95
 *   - Contains query: 0.85
 *   - Fuzzy similarity (Damerau-Levenshtein): similarity * 0.8
 *
 * Items with score < 0.5 are excluded by default (configurable via minScore).
 */
export function fuzzyMatch<T>(
  query: string,
  items: T[],
  extractors: ((item: T) => string | null | undefined)[],
  options: { minScore?: number; limit?: number } = {}
): FuzzyMatch<T>[] {
  const { minScore = 0.5, limit = 10 } = options;
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) return [];

  const firstChar = normalizedQuery.charAt(0);

  const results: FuzzyMatch<T>[] = [];

  for (const item of items) {
    let bestScore = 0;
    let bestField = '';

    // Fast pre-filter: skip items that can't possibly match.
    // Checks across ALL extractors (bikol, english, tagalog) so a match on
    // any field passes the item through.
    let canMatch = false;
    for (const extractor of extractors) {
      const text = extractor(item);
      if (!text) continue;
      const lower = text.toLowerCase();
      // Cheap pre-filter checks (ordered by cost)
      if (lower.charAt(0) === firstChar) { canMatch = true; break; }
      if (lower.includes(normalizedQuery)) { canMatch = true; break; }
      if (normalizedQuery.includes(lower)) { canMatch = true; break; }
      if (Math.abs(lower.length - normalizedQuery.length) <= 4) { canMatch = true; break; }
    }
    if (!canMatch) continue;

    for (const extractor of extractors) {
      const text = extractor(item);
      if (!text) continue;
      const lower = text.toLowerCase();

      let score = 0;

      if (lower === normalizedQuery) {
        score = 1.0;
      } else if (lower.startsWith(normalizedQuery)) {
        score = 0.95;
      } else if (lower.includes(normalizedQuery)) {
        // Bonus for word-boundary matches
        const wordBoundary = new RegExp(`\\b${escapeRegex(normalizedQuery)}`);
        score = wordBoundary.test(lower) ? 0.9 : 0.85;
      } else if (normalizedQuery.length >= 3) {
        // Fuzzy match (Damerau-Levenshtein) for queries of 3+ chars
        // Lowered threshold from 0.55 to 0.45 to catch more typo variations
        const sim = stringSimilarity(lower, normalizedQuery);
        if (sim > 0.45) {
          score = sim * 0.8;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestField = extractor.name || 'unknown';
      }
    }

    if (bestScore >= minScore) {
      results.push({ item, score: bestScore, matchedField: bestField });
    }
  }

  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
