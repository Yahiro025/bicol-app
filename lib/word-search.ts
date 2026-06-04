/**
 * Shared helper for querying both normalized (roots) and legacy (words) tables,
 * deduplicating by lowercase bikol (preferring normalized root data).
 *
 * The browse page, homepage, and frequency API all need to show words from both
 * sources — this ensures Mintz dictionary data (merged into roots) is visible
 * everywhere, not just on word detail pages.
 */

import { cache as reactCache } from 'react';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// ─── Simple in-memory cache with TTL (seconds) ───────────────────────────────
const cache = new Map<string, { data: unknown; expiresAt: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown, ttlSeconds: number): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WordSearchEntry {
  bikol: string;
  english: string | null;
  tagalog: string | null;
  pos: string | null;
  category: string | null;
  pronunciation: string | null;
  dialect: string | null;
  frequency_rank: number | null;
  source: 'normalized' | 'legacy';
}

export interface BrowseFilters {
  letter?: string | null;
  category?: string | null;
  q?: string | null;
}

// ─── Browse: Paginated query across both tables ───────────────────────────────
// OPTIMIZED: Push WHERE into subqueries so PostgreSQL can use indexes and
// avoid scanning the entire UNION ALL result before filtering.

// Wrapped in React cache() to deduplicate within a single request — critical for
// SSR renders where multiple components may call browseWords with the same params.
export const browseWords = reactCache(async (params: {
  filters: BrowseFilters;
  sort?: string | null;
  limit: number;
  offset: number;
}): Promise<WordSearchEntry[]> => {
  const { filters, sort, limit, offset } = params;

  // ─── In-memory cache for API route calls (not for ISR server renders) ──────
  const cacheKey = `browse:${JSON.stringify({ filters, sort, limit, offset })}`;
  const BROWSE_CACHE_TTL = 30; // 30 seconds — balances freshness with performance

  const cachedBrowse = getCached<WordSearchEntry[]>(cacheKey);
  if (cachedBrowse !== null) return cachedBrowse;

  // Build filter SQL fragments that work inside each subquery.
  // Uses qualified column references (def.english, def.tagalog for roots;
  // bare english, tagalog for words since they're direct columns there).
  const rootsFilterConditions: Prisma.Sql[] = [];
  const wordsFilterConditions: Prisma.Sql[] = [];

  // Letter and category filters apply identically to both tables
  if (filters.letter) {
    const letterClause = Prisma.sql`LOWER(bikol) LIKE LOWER(${filters.letter + '%'})`;
    rootsFilterConditions.push(letterClause);
    wordsFilterConditions.push(letterClause);
  }
  if (filters.category) {
    const catClause = Prisma.sql`LOWER(category) = LOWER(${filters.category})`;
    rootsFilterConditions.push(catClause);
    wordsFilterConditions.push(catClause);
  }
  // Search query: roots uses def.english/def.tagalog (LATERAL), words uses direct columns
  if (filters.q) {
    rootsFilterConditions.push(
      Prisma.sql`(
        LOWER(bikol) LIKE LOWER(${'%' + filters.q + '%'}) OR
        LOWER(def.english) LIKE LOWER(${'%' + filters.q + '%'}) OR
        LOWER(def.tagalog) LIKE LOWER(${'%' + filters.q + '%'})
      )`
    );
    wordsFilterConditions.push(
      Prisma.sql`(
        LOWER(bikol) LIKE LOWER(${'%' + filters.q + '%'}) OR
        LOWER(english) LIKE LOWER(${'%' + filters.q + '%'}) OR
        LOWER(tagalog) LIKE LOWER(${'%' + filters.q + '%'})
      )`
    );
  }

  const rootsWhere = rootsFilterConditions.length > 0
    ? Prisma.sql`AND ${Prisma.join(rootsFilterConditions, ' AND ')}`
    : Prisma.empty;
  const wordsWhere = wordsFilterConditions.length > 0
    ? Prisma.sql`AND ${Prisma.join(wordsFilterConditions, ' AND ')}`
    : Prisma.empty;

  // Sort: frequency → by rank; relevance (search query) → exact match first;
  // default → alphabetical
  const orderByClause = sort === 'frequency'
    ? Prisma.sql`ORDER BY COALESCE(frequency_rank, 999999) ASC, LOWER(bikol) ASC`
    : filters.q
      ? Prisma.sql`ORDER BY CASE WHEN LOWER(bikol) = LOWER(${filters.q}) THEN 0 WHEN LOWER(bikol) LIKE LOWER(${filters.q + '%'}) THEN 1 ELSE 2 END, LOWER(bikol) ASC`
      : Prisma.sql`ORDER BY LOWER(bikol) ASC`;

  const rows: Array<{
    bikol: string;
    pos: string | null;
    category: string | null;
    pronunciation: string | null;
    frequency_rank: number | null;
    english: string | null;
    tagalog: string | null;
    source: string;
  }> = await prisma.$queryRaw`
    SELECT * FROM (
      -- Normalized roots (includes Mintz + Wiktionary data)
      SELECT
        r.bikol,
        r.pos,
        r.category,
        r.pronunciation,
        r.frequency_rank,
        def.english,
        def.tagalog,
        'normalized' as source
      FROM roots r
      LEFT JOIN LATERAL (
        SELECT 
          d.english,
          d.tagalog
        FROM definitions d
        WHERE d."rootId" = r.id
        ORDER BY d."createdAt" ASC
        LIMIT 1
      ) def ON true
      WHERE r.bikol IS NOT NULL AND r.bikol != ''
      ${rootsWhere}

      UNION ALL

      -- Legacy words (Wiktionary / learnbikol.com — may overlap with roots)
      SELECT
        w.bikol,
        w.pos,
        w.category,
        w.pronunciation,
        w.frequency_rank,
        w.english,
        w.tagalog,
        'legacy' as source
      FROM words w
      WHERE w.bikol IS NOT NULL AND w.bikol != ''
      ${wordsWhere}
    ) combined
    ${orderByClause}
    LIMIT ${limit} OFFSET ${offset}
  `;

  // BigInt serialization + deduplication
  const seen = new Set<string>();
  const deduped: WordSearchEntry[] = [];

  for (const row of rows) {
    const key = (row.bikol || '').toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);

    deduped.push({
      bikol: row.bikol,
      english: row.english ?? null,
      tagalog: row.tagalog ?? null,
      pos: row.pos ?? null,
      category: row.category ?? null,
      pronunciation: row.pronunciation ?? null,
      dialect: null, // dialect is per-definition, not available at browse level
      frequency_rank: row.frequency_rank ?? null,
      source: row.source as 'normalized' | 'legacy',
    });
  }

  // Cache the result to avoid repeated expensive UNION ALL queries
  setCache(cacheKey, deduped, BROWSE_CACHE_TTL);

  return deduped;
});

// ─── Count distinct bikol words across both tables ────────────────────────────
// Wrapped in React cache() to deduplicate within a single request (e.g.,
// homepage calls it directly AND getWordOfTheDay() calls it again internally).
export const countDistinctWords = reactCache(async (): Promise<number> => {
  const CACHE_KEY = 'countDistinctWords';
  const CACHE_TTL = 600; // 10 minutes

  const cached = getCached<number>(CACHE_KEY);
  if (cached !== null) return cached;

  // Exact count via COUNT(DISTINCT ...) — cached for 10 min so cold start is
  // the only time this runs. The UNION ALL is needed for accuracy since
  // getWordOfTheDay() depends on the exact count for its offset calculation.
  const result: Array<{ count: bigint }> = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT LOWER(bikol)) as count FROM (
      SELECT bikol FROM roots WHERE bikol IS NOT NULL AND bikol != ''
      UNION ALL
      SELECT bikol FROM words WHERE bikol IS NOT NULL AND bikol != ''
    ) combined
  `;
  const count = Number(result[0]?.count ?? 0);
  setCache(CACHE_KEY, count, CACHE_TTL);
  return count;
});

// ─── Categories from both tables ──────────────────────────────────────────────

// Wrapped in React cache() to deduplicate within a single request.
export interface CategoryCount {
  category: string;
  count: number;
}

export const getCategoryCounts = reactCache(async (limit = 12): Promise<CategoryCount[]> => {
  const CACHE_KEY = `categoryCounts_${limit}`;
  const CACHE_TTL = 600; // 10 minutes

  const cached = getCached<CategoryCount[]>(CACHE_KEY);
  if (cached !== null) return cached;

  // OPTIMIZED: Count each table separately, then combine in JS
  // This avoids the expensive UNION ALL + GROUP BY combo
  const [rootCats, wordCats] = await Promise.all([
    prisma.$queryRaw`
      SELECT category, COUNT(*) as count
      FROM roots
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category
    `,
    prisma.$queryRaw`
      SELECT category, COUNT(*) as count
      FROM words
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category
    `,
  ]);

  // Merge counts in JS (faster than UNION ALL + re-GROUP BY)
  const categoryMap = new Map<string, number>();
  for (const row of rootCats as unknown as { category: string; count: bigint }[]) {
    categoryMap.set(row.category, Number(row.count));
  }
  for (const row of wordCats as unknown as { category: string; count: bigint }[]) {
    categoryMap.set(row.category, (categoryMap.get(row.category) || 0) + Number(row.count));
  }

  const result = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  setCache(CACHE_KEY, result, CACHE_TTL);
  return result;
});

// ─── Look up specific words from both tables ──────────────────────────────────

export async function findWordsByBikol(
  bikolList: string[]
): Promise<WordSearchEntry[]> {
  if (bikolList.length === 0) return [];

  // Query roots
  const rootWords = await prisma.root.findMany({
    where: { bikol: { in: bikolList, mode: 'insensitive' } },
    include: { definitions: { take: 1 } },
  });

  // Query words for any not found in roots
  const foundBikolLower = new Set(rootWords.map((r) => r.bikol.toLowerCase()));
  const missingBikol = bikolList.filter(
    (b) => !foundBikolLower.has(b.toLowerCase())
  );

  const legacyWords =
    missingBikol.length > 0
      ? await prisma.word.findMany({
          where: { bikol: { in: missingBikol, mode: 'insensitive' } },
        })
      : [];

  // Merge: roots take priority
  const map = new Map<string, WordSearchEntry>();

  for (const r of rootWords) {
    const key = r.bikol.toLowerCase();
    map.set(key, {
      bikol: r.bikol,
      english: r.definitions[0]?.english ?? null,
      tagalog: r.definitions[0]?.tagalog ?? null,
      pos: r.pos ?? null,
      category: r.category ?? null,
      pronunciation: r.pronunciation ?? null,
      dialect: r.definitions[0]?.dialect ?? null,
      frequency_rank: r.frequency_rank ?? null,
      source: 'normalized',
    });
  }

  for (const w of legacyWords) {
    const key = (w.bikol || '').toLowerCase();
    if (key && !map.has(key)) {
      map.set(key, {
        bikol: w.bikol!,
        english: w.english ?? null,
        tagalog: w.tagalog ?? null,
        pos: w.pos ?? null,
        category: w.category ?? null,
        pronunciation: w.pronunciation ?? null,
        dialect: w.dialect ?? null,
        frequency_rank: w.frequency_rank ?? null,
        source: 'legacy',
      });
    }
  }

  // Return in the same order as input
  return bikolList
    .map((b) => map.get(b.toLowerCase()))
    .filter((e): e is WordSearchEntry => !!e);
}

// ─── Word of the Day (deterministic, from combined pool) ──────────────────────

export async function getWordOfTheDay(): Promise<WordSearchEntry | null> {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      86400000
  );

  const total = await countDistinctWords();
  if (total === 0) return null;

  const skip = dayOfYear % total;

  // Use the combined browse query with offset, limit 1
  const results = await browseWords({
    filters: {},
    limit: 1,
    offset: skip,
  });

  return results[0] ?? null;
}

// ─── Initial dictionary for search autocomplete ────────────────────────────────

// Wrapped in React cache() to deduplicate within a single request.
export interface DictionaryEntry {
  bikol: string;
  english: string;
  tagalog: string | null;
}

export const getInitialDictionary = reactCache(async (
  limit = 500
): Promise<DictionaryEntry[]> => {
  // OPTIMIZED: Query roots only (covers Mintz + Wiktionary), since legacy words' bikol
  // entries already overlap with roots. This avoids the expensive UNION ALL.
  const rows: Array<{
    bikol: string;
    pos: string | null;
    category: string | null;
    pronunciation: string | null;
    frequency_rank: number | null;
    english: string | null;
    tagalog: string | null;
    source: string;
  }> = await prisma.$queryRaw`
    SELECT
      r.bikol,
      def.english,
      def.tagalog
    FROM roots r
    LEFT JOIN LATERAL (
      SELECT d.english, d.tagalog
      FROM definitions d
      WHERE d."rootId" = r.id
      ORDER BY d."createdAt"
      LIMIT 1
    ) def ON true
    WHERE r.bikol IS NOT NULL AND r.bikol != ''
      AND def.english IS NOT NULL
    ORDER BY LOWER(r.bikol) ASC
    LIMIT ${limit}
  `;

  // Deduplicate
  const seen = new Set<string>();
  const deduped: DictionaryEntry[] = [];

  for (const row of rows) {
    const key = (row.bikol || '').toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push({
      bikol: row.bikol,
      english: row.english ?? '',
      tagalog: row.tagalog ?? null,
    });
  }

  return deduped;
});
