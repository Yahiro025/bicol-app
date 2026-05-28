import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePOS } from '@/lib/lexicography';

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
    const normalized = (results as any[]).map((r: any) => ({
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
    // If the extension isn't enabled, fallback to basic search
    if (error.message?.includes('similarity')) {
       const fallback = await prisma.root.findMany({
         where: { bikol: { contains: q, mode: 'insensitive' } },
         take: 10,
         include: { definitions: true }
       });
       const seen = new Set<string>();
       const deduped = [];
       for (const f of fallback) {
         const key = f.bikol.toLowerCase();
         if (seen.has(key)) continue;
         seen.add(key);
         deduped.push({
           bikol: f.bikol,
           pos: normalizePOS(f.pos),
           english: f.definitions.map(d => d.english).filter(Boolean).join('; ') || null,
           tagalog: f.definitions.map(d => d.tagalog).filter(Boolean).join('; ') || null,
           score: 0.5,
           type: 'normalized',
         });
       }
       return NextResponse.json(deduped);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
