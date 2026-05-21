import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Advanced Fuzzy Search Route
 * 
 * Uses PostgreSQL Trigrams (pg_trgm) to provide typo-tolerant search.
 * This implementation is optimized for Vercel/Supabase.
 * 
 * REQUIRED SQL (Run in Supabase SQL Editor):
 * CREATE EXTENSION IF NOT EXISTS pg_trgm;
 * CREATE INDEX IF NOT EXISTS idx_roots_bikol_trgm ON roots USING gin (bikol gin_trgm_ops);
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length === 0) return NextResponse.json([]);

  try {
    const query = q.trim();

    // We use a raw SQL query to leverage the 'similarity' function from pg_trgm
    // This allows for typo tolerance (e.g., 'bakall' matches 'bakal')
    // We search both the normalized roots and the legacy words table for maximum coverage
    const results = await prisma.$queryRaw`
      WITH search_results AS (
        -- Search in Normalized Roots
        SELECT 
          r.id,
          r.bikol,
          r.pos,
          (
            SELECT d.english 
            FROM definitions d 
            WHERE d."rootId" = r.id 
            LIMIT 1
          ) as english,
          (
            SELECT d.tagalog 
            FROM definitions d 
            WHERE d."rootId" = r.id 
            LIMIT 1
          ) as tagalog,
          similarity(r.bikol, ${query}) as score,
          'normalized' as type
        FROM roots r
        WHERE r.bikol % ${query} OR r.bikol ILIKE ${query + '%'}

        UNION ALL

        -- Search in Legacy Words
        SELECT 
          id::text,
          bikol,
          pos,
          english,
          tagalog,
          similarity(bikol, ${query}) as score,
          'legacy' as type
        FROM words
        WHERE bikol % ${query} OR bikol ILIKE ${query + '%'}
      )
      SELECT * FROM search_results
      ORDER BY score DESC, bikol ASC
      LIMIT 10;
    `;

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Postgres Search Error:', error);
    // If the extension isn't enabled, fallback to basic search
    if (error.message?.includes('similarity')) {
       const fallback = await prisma.root.findMany({
         where: { bikol: { contains: q, mode: 'insensitive' } },
         take: 10,
         include: { definitions: { take: 1 } }
       });
       return NextResponse.json(fallback.map(f => ({
         id: f.id,
         bikol: f.bikol,
         pos: f.pos,
         english: f.definitions[0]?.english,
         tagalog: f.definitions[0]?.tagalog,
         score: 0.5
       })));
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
