import { cache as reactCache } from 'react';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const MAX_CACHE_SIZE = 200;
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
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
}

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

export const browseWords = reactCache(async (params: {
  filters: BrowseFilters;
  sort?: string | null;
  limit: number;
  offset: number;
}): Promise<WordSearchEntry[]> => {
  const { filters, sort, limit, offset } = params;

  const cacheKey = `browse:${JSON.stringify({ filters, sort, limit, offset })}`;
  const cached = getCached<WordSearchEntry[]>(cacheKey);
  if (cached !== null) return cached;

  const rootsConditions: Prisma.Sql[] = [];
  const wordsConditions: Prisma.Sql[] = [];

  if (filters.letter) {
    const clause = Prisma.sql`LOWER(bikol) LIKE LOWER(${filters.letter + '%'})`;
    rootsConditions.push(clause);
    wordsConditions.push(clause);
  }
  if (filters.category) {
    const clause = Prisma.sql`LOWER(category) = LOWER(${filters.category})`;
    rootsConditions.push(clause);
    wordsConditions.push(clause);
  }
  if (filters.q) {
    rootsConditions.push(
      Prisma.sql`(
        LOWER(bikol) LIKE LOWER(${'%' + filters.q + '%'}) OR
        LOWER(def.english) LIKE LOWER(${'%' + filters.q + '%'}) OR
        LOWER(def.tagalog) LIKE LOWER(${'%' + filters.q + '%'})
      )`
    );
    wordsConditions.push(
      Prisma.sql`(
        LOWER(bikol) LIKE LOWER(${'%' + filters.q + '%'}) OR
        LOWER(english) LIKE LOWER(${'%' + filters.q + '%'}) OR
        LOWER(tagalog) LIKE LOWER(${'%' + filters.q + '%'})
      )`
    );
  }

  const rootsWhere = rootsConditions.length > 0
    ? Prisma.sql`AND ${Prisma.join(rootsConditions, ' AND ')}`
    : Prisma.empty;
  const wordsWhere = wordsConditions.length > 0
    ? Prisma.sql`AND ${Prisma.join(wordsConditions, ' AND ')}`
    : Prisma.empty;

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
      SELECT
        r.bikol, r.pos, r.category, r.pronunciation, r.frequency_rank,
        def.english, def.tagalog, 'normalized' as source
      FROM roots r
      LEFT JOIN LATERAL (
        SELECT d.english, d.tagalog
        FROM definitions d
        WHERE d."rootId" = r.id
        ORDER BY d."createdAt" ASC
        LIMIT 1
      ) def ON true
      WHERE r.bikol IS NOT NULL AND r.bikol != ''
      ${rootsWhere}
      UNION ALL
      SELECT
        w.bikol, w.pos, w.category, w.pronunciation, w.frequency_rank,
        w.english, w.tagalog, 'legacy' as source
      FROM words w
      WHERE w.bikol IS NOT NULL AND w.bikol != ''
      ${wordsWhere}
    ) combined
    ${orderByClause}
    LIMIT ${limit} OFFSET ${offset}
  `;

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
      dialect: null,
      frequency_rank: row.frequency_rank ?? null,
      source: row.source as 'normalized' | 'legacy',
    });
  }

  setCache(cacheKey, deduped, 30);
  return deduped;
});

export const countDistinctWords = reactCache(async (): Promise<number> => {
  const cached = getCached<number>('countDistinctWords');
  if (cached !== null) return cached;

  const result: Array<{ count: bigint }> = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT LOWER(bikol)) as count FROM (
      SELECT bikol FROM roots WHERE bikol IS NOT NULL AND bikol != ''
      UNION ALL
      SELECT bikol FROM words WHERE bikol IS NOT NULL AND bikol != ''
    ) combined
  `;
  const count = Number(result[0]?.count ?? 0);
  setCache('countDistinctWords', count, 600);
  return count;
});

export interface CategoryCount {
  category: string;
  count: number;
}

export const getCategoryCounts = reactCache(async (limit = 12): Promise<CategoryCount[]> => {
  const cacheKey = `categoryCounts_${limit}`;
  const cached = getCached<CategoryCount[]>(cacheKey);
  if (cached !== null) return cached;

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

  const map = new Map<string, number>();
  for (const row of rootCats as unknown as { category: string; count: bigint }[]) {
    map.set(row.category, Number(row.count));
  }
  for (const row of wordCats as unknown as { category: string; count: bigint }[]) {
    map.set(row.category, (map.get(row.category) || 0) + Number(row.count));
  }

  const result = Array.from(map.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  setCache(cacheKey, result, 600);
  return result;
});

export async function findWordsByBikol(
  bikolList: string[]
): Promise<WordSearchEntry[]> {
  if (bikolList.length === 0) return [];

  const rootWords = await prisma.root.findMany({
    where: { bikol: { in: bikolList, mode: 'insensitive' } },
    include: { definitions: { take: 1 } },
  });

  const found = new Set(rootWords.map((r) => r.bikol.toLowerCase()));
  const missing = bikolList.filter((b) => !found.has(b.toLowerCase()));

  const legacyWords = missing.length > 0
    ? await prisma.word.findMany({
        where: { bikol: { in: missing, mode: 'insensitive' } },
      })
    : [];

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

  return bikolList
    .map((b) => map.get(b.toLowerCase()))
    .filter((e): e is WordSearchEntry => !!e);
}

export async function getWordOfTheDay(): Promise<WordSearchEntry | null> {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );

  const total = await countDistinctWords();
  if (total === 0) return null;

  const results = await browseWords({ filters: {}, limit: 1, offset: dayOfYear % total });
  return results[0] ?? null;
}

export interface DictionaryEntry {
  bikol: string;
  english: string;
  tagalog: string | null;
}

export const getInitialDictionary = reactCache(async (
  limit = 500
): Promise<DictionaryEntry[]> => {
  const rows: Array<{
    bikol: string;
    english: string | null;
    tagalog: string | null;
    priority: number;
  }> = await prisma.$queryRaw`
    SELECT bikol, english, tagalog, 0 as priority FROM (
      SELECT r.bikol, def.english, def.tagalog
      FROM roots r
      LEFT JOIN LATERAL (
        SELECT d.english, d.tagalog
        FROM definitions d
        WHERE d."rootId" = r.id
        ORDER BY d."createdAt"
        LIMIT 1
      ) def ON true
      WHERE r.bikol IS NOT NULL AND r.bikol != '' AND def.english IS NOT NULL
    ) roots_data
    UNION ALL
    SELECT bikol, english, tagalog, 1 as priority FROM (
      SELECT w.bikol, w.english, w.tagalog
      FROM words w
      WHERE w.bikol IS NOT NULL AND w.bikol != '' AND w.english IS NOT NULL
    ) words_data
    ORDER BY priority ASC, LOWER(bikol) ASC
    LIMIT ${limit * 2}
  `;

  const seen = new Set<string>();
  const deduped: DictionaryEntry[] = [];

  for (const row of rows) {
    const key = (row.bikol || '').toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push({ bikol: row.bikol, english: row.english ?? '', tagalog: row.tagalog ?? null });
    if (deduped.length >= limit) break;
  }

  return deduped;
});
