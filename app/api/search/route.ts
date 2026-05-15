import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) return NextResponse.json([]);

  try {
    const words = await prisma.word.findMany({
      where: {
        OR: [
          { bikol: { contains: q, mode: 'insensitive' } },
          { english: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 10,
    });
    return NextResponse.json(words);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
