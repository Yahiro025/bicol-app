import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePOS } from '@/lib/lexicography';
import { fuzzyMatch } from '@/lib/fuzzy';

/** Shape returned by the raw PostgreSQL trigram search query */
interface SearchResultRow {
  bikol: string
  pos: string | null
  english: string | null
  tagalog: string | null
  score: number
  priority: number
}

/**
 * Advanced Fuzzy Search Route
 * 
 * Uses PostgreSQL Trigrams (pg_trgm) to provide typo-tolerant search.
 * Results are deduplicated by lowercase bikol (normalized roots take priority)
 * and POS labels are normalized for consistent display.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length === 0) return NextResponse.json([]);

  try {
    const query = q.trim();

    // Search both roots and words with deduplication via DISTINCT ON
    // Normalized roots take priority over legacy words when both have the same bikol
    const results = await prisma.$queryRaw`
      WITH search_results AS (
        -- Search in Normalized Roots (highest priority)
        SELECT 
          r.bikol,
          r.pos,
          (
            SELECT STRING_AGG(d.english, '; ' ORDER BY d."createdAt")
            FROM definitions d 
            WHERE d."rootId" = r.id
          ) as english,
          (
            SELECT STRING_AGG(d.tagalog, '; ' ORDER BY d."createdAt")
            FROM definitions d 
            WHERE d."rootId" = r.id
          ) as tagalog,
          similarity(r.bikol, ${query}) as score,
          0 as priority
        FROM roots r
        WHERE r.bikol % ${query} OR r.bikol ILIKE ${query + '%'}

        UNION ALL

        -- Search in Legacy Words (lower priority)
        SELECT 
          bikol,
          pos,
          english,
          tagalog,
          similarity(bikol, ${query}) as score,
          1 as priority
        FROM words
        WHERE bikol % ${query} OR bikol ILIKE ${query + '%'}
      ),
      deduped AS (
        SELECT DISTINCT ON (LOWER(bikol))
          bikol, pos, english, tagalog, score, priority
        FROM search_results
        ORDER BY LOWER(bikol), priority ASC
      )
      SELECT * FROM deduped
      ORDER BY score DESC, bikol ASC
      LIMIT 10;
    `;

    // Normalize POS and serialize
    const rows = results as unknown as SearchResultRow[]
    const normalized = rows.map((r) => ({
      bikol: r.bikol,
      pos: normalizePOS(r.pos),
      english: r.english ?? null,
      tagalog: r.tagalog ?? null,
      score: Number(r.score),
      type: r.priority === 0 ? 'normalized' : 'legacy',
    }));

    // Cache search results for 2 minutes at CDN edge
    return NextResponse.json(normalized, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, max-age=30, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error('Postgres Search Error:', error);
    // If the extension isn't enabled, fallback to fuzzy JS-based search
    if (error.message?.includes('similarity') || error.message?.includes('operator does not exist')) {
       // Fetch candidate roots (broader prefix match to feed fuzzy scorer)
       const candidates = await prisma.root.findMany({
         where: { bikol: { startsWith: q.charAt(0), mode: 'insensitive' } },
         take: 200,
         include: { definitions: { take: 1 } }
       });

       const entries = candidates.map(c => ({
         bikol: c.bikol,
         pos: normalizePOS(c.pos),
         english: c.definitions[0]?.english ?? null,
         tagalog: c.definitions[0]?.tagalog ?? null,
       }));

       // Fuzzy match against bikol, english, and tagalog fields
       const matched = fuzzyMatch(q, entries, [
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
         headers: {
           'Cache-Control': 'public, s-maxage=120, max-age=30, stale-while-revalidate=300',
           'X-Search-Mode': 'fuzzy-fallback',
         },
       });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
