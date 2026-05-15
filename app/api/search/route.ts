import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    // Use pg_trgm for fuzzy matching with a similarity threshold
    // Note: requires pg_trgm extension enabled in Supabase/Postgres
    const data = await prisma.$queryRaw`
      SELECT bikol, english, tagalog, similarity(bikol, ${query}) as score
      FROM words
      WHERE bikol % ${query} 
         OR english ILIKE ${'%' + query + '%'}
         OR tagalog ILIKE ${'%' + query + '%'}
      ORDER BY score DESC, bikol ASC
      LIMIT 10
    `;

    return NextResponse.json(data);
  } catch (error: any) {
    // Fallback to basic ILIKE if pg_trgm fails or for simplicity
    const fallback = await prisma.word.findMany({
      where: {
        OR: [
          { bikol: { contains: query, mode: 'insensitive' } },
          { english: { contains: query, mode: 'insensitive' } },
          { tagalog: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        bikol: true,
        english: true,
        tagalog: true,
      },
      take: 10,
    });
    return NextResponse.json(fallback);
  }
}
