/**
 * Fuzzy string matching with Damerau-Levenshtein distance.
 * Used for typo-tolerant search in SearchBar and API fallback.
 */

export function damerauLevenshtein(a: string, b: string): number {
  const aLen = a.length;
  const bLen = b.length;
  if (aLen === 0) return bLen;
  if (bLen === 0) return aLen;

  const rows = aLen + 2;
  const cols = bLen + 2;
  const d: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));

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

  const da = new Map<string, number>();
  for (const ch of new Set([...a, ...b])) da.set(ch, 0);

  for (let i = 1; i <= aLen; i++) {
    let db = 0;
    for (let j = 1; j <= bLen; j++) {
      const i1 = da.get(b[j - 1]!) ?? 0;
      const j1 = db;
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      if (cost === 0) db = j;

      d[i + 1]![j + 1] = Math.min(
        d[i]![j]! + cost,
        d[i + 1]![j]! + 1,
        d[i]![j + 1]! + 1,
        d[i1]![j1]! + (i - i1 - 1) + 1 + (j - j1 - 1)
      );
    }
    da.set(a[i - 1]!, i);
  }

  return d[aLen + 1]![bLen + 1]!;
}

/** Similarity score in [0, 1]. */
export function stringSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const lowerA = a.toLowerCase();
  const lowerB = b.toLowerCase();
  if (lowerA === lowerB) return 1;
  const dist = damerauLevenshtein(lowerA, lowerB);
  return 1 - dist / Math.max(lowerA.length, lowerB.length);
}

export interface FuzzyMatch<T> {
  item: T;
  score: number;
  matchedField: string;
}

/** Scores items against a query using text extractors. */
export function fuzzyMatch<T>(
  query: string,
  items: T[],
  extractors: ((item: T) => string | null | undefined)[],
  options: { minScore?: number; limit?: number } = {}
): FuzzyMatch<T>[] {
  const { minScore = 0.5, limit = 10 } = options;
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const firstChar = q[0];
  const results: FuzzyMatch<T>[] = [];

  for (const item of items) {
    let bestScore = 0;
    let bestField = '';

    // Fast pre-filter
    let canMatch = false;
    for (const extract of extractors) {
      const text = extract(item);
      if (!text) continue;
      const lower = text.toLowerCase();
      if (lower[0] === firstChar || lower.includes(q) || q.includes(lower) || Math.abs(lower.length - q.length) <= 4) {
        canMatch = true;
        break;
      }
    }
    if (!canMatch) continue;

    for (const extract of extractors) {
      const text = extract(item);
      if (!text) continue;
      const lower = text.toLowerCase();

      let score = 0;
      if (lower === q) score = 1.0;
      else if (lower.startsWith(q)) score = 0.95;
      else if (lower.includes(q)) {
        score = new RegExp(`\\b${escapeRegex(q)}`).test(lower) ? 0.9 : 0.85;
      } else if (q.length >= 3) {
        const sim = stringSimilarity(lower, q);
        if (sim > 0.45) score = sim * 0.8;
      }

      if (score > bestScore) {
        bestScore = score;
        bestField = extract.name || 'unknown';
      }
    }

    if (bestScore >= minScore) {
      results.push({ item, score: bestScore, matchedField: bestField });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
