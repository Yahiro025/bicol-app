import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const words = await prisma.word.findMany({
      where: {
        confidence: { gte: 0.8 },
        english: { not: null },
      },
      take: 20,
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json(words);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 });
  }
}
