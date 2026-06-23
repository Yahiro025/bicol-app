import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePOS } from '@/lib/lexicography';
import { fuzzyMatch } from '@/lib/fuzzy';

interface SearchResultRow {
  bikol: string;
  pos: string | null;
  english: string | null;
  tagalog: string | null;
  score: number;
  priority: number;
}

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=120, max-age=30, stale-while-revalidate=300',
};

async function fuzzyFallback(q: string) {
  const [rootCandidates, legacyCandidates] = await Promise.all([
    prisma.root.findMany({
      where: { bikol: { startsWith: q[0], mode: 'insensitive' } },
      take: 200,
      include: { definitions: { take: 1 } },
    }),
    prisma.word.findMany({
      where: { bikol: { startsWith: q[0], mode: 'insensitive' } },
      take: 200,
    }),
  ]);

  const entryMap = new Map<string, { bikol: string; pos: string | null; english: string | null; tagalog: string | null }>();
  for (const c of rootCandidates) {
    entryMap.set(c.bikol.toLowerCase(), {
      bikol: c.bikol,
      pos: normalizePOS(c.pos),
      english: c.definitions[0]?.english ?? null,
      tagalog: c.definitions[0]?.tagalog ?? null,
    });
  }
  for (const c of legacyCandidates) {
    const key = (c.bikol || '').toLowerCase();
    if (key && !entryMap.has(key)) {
      entryMap.set(key, {
        bikol: c.bikol!,
        pos: normalizePOS(c.pos),
        english: c.english ?? null,
        tagalog: c.tagalog ?? null,
      });
    }
  }

  const matched = fuzzyMatch(q, Array.from(entryMap.values()), [
    (e) => e.bikol,
    (e) => e.english,
    (e) => e.tagalog,
  ], { minScore: 0.35, limit: 10 });

  const seen = new Set<string>();
  const deduped = [];
  for (const m of matched) {
    const key = m.item.bikol.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push({
      bikol: m.item.bikol,
      pos: m.item.pos,
      english: m.item.english,
      tagalog: m.item.tagalog,
      score: Number(m.score.toFixed(3)),
      type: 'normalized',
    });
  }

  return NextResponse.json(deduped, {
    headers: { ...CACHE_HEADERS, 'X-Search-Mode': 'fuzzy-fallback' },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  if (!q?.trim()) return NextResponse.json([]);

  const query = q.trim();

  try {
    const results = await prisma.$queryRaw`
      WITH search_results AS (
        SELECT 
          r.bikol, r.pos,
          (SELECT STRING_AGG(d.english, '; ' ORDER BY d."createdAt") FROM definitions d WHERE d."rootId" = r.id) as english,
          (SELECT STRING_AGG(d.tagalog, '; ' ORDER BY d."createdAt") FROM definitions d WHERE d."rootId" = r.id) as tagalog,
          similarity(r.bikol, ${query}) as score, 0 as priority
        FROM roots r
        WHERE r.bikol % ${query} OR r.bikol ILIKE ${query + '%'}
        UNION ALL
        SELECT bikol, pos, english, tagalog, similarity(bikol, ${query}) as score, 1 as priority
        FROM words
        WHERE bikol % ${query} OR bikol ILIKE ${query + '%'}
      ),
      deduped AS (
        SELECT DISTINCT ON (LOWER(bikol)) bikol, pos, english, tagalog, score, priority
        FROM search_results
        ORDER BY LOWER(bikol), priority ASC
      )
      SELECT * FROM deduped ORDER BY score DESC, bikol ASC LIMIT 10;
    `;

    const rows = results as unknown as SearchResultRow[];
    const normalized = rows.map((r) => ({
      bikol: r.bikol,
      pos: normalizePOS(r.pos),
      english: r.english ?? null,
      tagalog: r.tagalog ?? null,
      score: Number(r.score),
      type: r.priority === 0 ? 'normalized' : 'legacy',
    }));

    return NextResponse.json(normalized, { headers: CACHE_HEADERS });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '';
    console.error('Postgres Search Error:', error);
    if (message.includes('similarity') || message.includes('operator does not exist')) {
      return fuzzyFallback(q);
    }
    return NextResponse.json({ error: message || 'Search failed' }, { status: 500 });
  }
}
