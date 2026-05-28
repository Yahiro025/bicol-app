/**
 * Shared helper for querying both normalized (roots) and legacy (words) tables,
 * deduplicating by lowercase bikol (preferring normalized root data).
 *
 * The browse page, homepage, and frequency API all need to show words from both
 * sources — this ensures Mintz dictionary data (merged into roots) is visible
 * everywhere, not just on word detail pages.
 */

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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

// ─── Build WHERE conditions for the combined subquery ─────────────────────────
// These reference columns that exist in both roots and words tables.
// Used in the outer SELECT of the UNION query.

export function buildCombinedWhere(filters: BrowseFilters): Prisma.Sql {
  const conditions: Prisma.Sql[] = [];

  if (filters.letter) {
    conditions.push(
      Prisma.sql`LOWER("bikol") LIKE LOWER(${filters.letter + '%'})`
    );
  }
  if (filters.category) {
    conditions.push(
      Prisma.sql`LOWER("category") = LOWER(${filters.category})`
    );
  }
  if (filters.q) {
    conditions.push(
      Prisma.sql`(
        LOWER("bikol") LIKE LOWER(${'%' + filters.q + '%'}) OR
        LOWER("english") LIKE LOWER(${'%' + filters.q + '%'}) OR
        LOWER("tagalog") LIKE LOWER(${'%' + filters.q + '%'})
      )`
    );
  }

  return conditions.length > 0
    ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
    : Prisma.empty;
}

export function buildCombinedOrderBy(sort?: string | null): Prisma.Sql {
  return sort === 'frequency'
    ? Prisma.sql`ORDER BY "frequency_rank" ASC NULLS LAST, LOWER("bikol") ASC`
    : Prisma.sql`ORDER BY LOWER("bikol") ASC`;
}

// ─── Browse: Paginated query across both tables ───────────────────────────────

export async function browseWords(params: {
  filters: BrowseFilters;
  sort?: string | null;
  limit: number;
  offset: number;
}): Promise<WordSearchEntry[]> {
  const { filters, sort, limit, offset } = params;
  const whereClause = buildCombinedWhere(filters);
  const orderByClause = buildCombinedOrderBy(sort);

  const rows: any[] = await prisma.$queryRaw`
    SELECT * FROM (
      -- Normalized roots (includes Mintz + Wiktionary data)
      SELECT
        r.id::text,
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
        SELECT d.english, d.tagalog
        FROM definitions d
        WHERE d."rootId" = r.id
        ORDER BY d."createdAt"
        LIMIT 1
      ) def ON true
      WHERE r.bikol IS NOT NULL AND r.bikol != ''

      UNION ALL

      -- Legacy words (Wiktionary / learnbikol.com — may overlap with roots)
      SELECT
        w.id::text,
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
    ) combined
    ${whereClause}
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

  return deduped;
}

// ─── Count distinct bikol words across both tables ────────────────────────────

export async function countDistinctWords(): Promise<number> {
  const result: any[] = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT LOWER(bikol)) as count FROM (
      SELECT bikol FROM roots WHERE bikol IS NOT NULL AND bikol != ''
      UNION ALL
      SELECT bikol FROM words WHERE bikol IS NOT NULL AND bikol != ''
    ) combined
  `;
  return Number(result[0]?.count ?? 0);
}

// ─── Categories from both tables ──────────────────────────────────────────────

export interface CategoryCount {
  category: string;
  count: number;
}

export async function getCategoryCounts(limit = 12): Promise<CategoryCount[]> {
  const rows: any[] = await prisma.$queryRaw`
    SELECT category, COUNT(*) as count FROM (
      SELECT category FROM roots WHERE category IS NOT NULL AND category != ''
      UNION ALL
      SELECT category FROM words WHERE category IS NOT NULL AND category != ''
    ) combined
    GROUP BY category
    ORDER BY count DESC
    LIMIT ${limit}
  `;
  return rows.map((r: any) => ({
    category: r.category,
    count: Number(r.count),
  }));
}

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

export interface DictionaryEntry {
  bikol: string;
  english: string;
  tagalog: string | null;
}

export async function getInitialDictionary(
  limit = 5000
): Promise<DictionaryEntry[]> {
  const rows: any[] = await prisma.$queryRaw`
    SELECT * FROM (
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

      UNION ALL

      SELECT
        w.bikol,
        w.english,
        w.tagalog
      FROM words w
      WHERE w.bikol IS NOT NULL AND w.bikol != '' AND w.english IS NOT NULL
    ) combined
    WHERE english IS NOT NULL
    ORDER BY LOWER(bikol) ASC
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
}
