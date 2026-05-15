import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const words = await prisma.word.findMany({
      where: {
        confidence: { gte: 0.8 },
      },
      take: 20,
      orderBy: {
        bikol: 'asc',
      },
    });

    return NextResponse.json(words);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 });
  }
}
