import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length === 0) return NextResponse.json([]);

  try {
    const qLower = q.toLowerCase();
    
    // Fetch a larger pool to allow for better in-memory sorting
    const words = await prisma.word.findMany({
      where: {
        OR: [
          { bikol: { contains: q, mode: 'insensitive' } },
          { english: { contains: q, mode: 'insensitive' } },
          { tagalog: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 20, 
    });

    // Score and sort results
    const scoredWords = words.map(word => {
      let score = 0;
      const bikolLower = word.bikol?.toLowerCase() || '';
      const englishLower = word.english?.toLowerCase() || '';
      const tagalogLower = word.tagalog?.toLowerCase() || '';

      if (bikolLower.startsWith(qLower)) {
        score = 100;
      } else if (englishLower.startsWith(qLower)) {
        score = 80;
      } else if (tagalogLower.startsWith(qLower)) {
        score = 70;
      } else if (bikolLower.includes(qLower)) {
        score = 50;
      } else {
        score = 30;
      }

      return { word, score };
    })
    .sort((a, b) => b.score - a.score || (a.word.bikol || '').localeCompare(b.word.bikol || ''))
    .map(sw => sw.word)
    .slice(0, 10);

    return NextResponse.json(scoredWords);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
