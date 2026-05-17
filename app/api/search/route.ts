import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length === 0) return NextResponse.json([]);

  try {
    const words = await prisma.word.findMany({
      where: {
        OR: [
          { bikol: { startsWith: q, mode: 'insensitive' } },
          { english: { startsWith: q, mode: 'insensitive' } },
          { bikol: { contains: q, mode: 'insensitive' } },
          { english: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 7, // Return up to 7 results for the dropdown
      orderBy: { bikol: 'asc' },
    });
    return NextResponse.json(words);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
