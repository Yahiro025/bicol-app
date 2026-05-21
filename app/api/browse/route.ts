import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const letter = searchParams.get('letter');
  const category = searchParams.get('category');
  const q = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '0');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const whereClause: any = {
      AND: [
        letter ? { bikol: { startsWith: letter, mode: 'insensitive' } } : {},
        category ? { category: { equals: category, mode: 'insensitive' } } : {},
        q
          ? {
              OR: [
                { bikol: { contains: q, mode: 'insensitive' } },
                { english: { contains: q, mode: 'insensitive' } },
                { tagalog: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    };

    const words = await prisma.word.findMany({
      where: whereClause,
      orderBy: { bikol: 'asc' },
      skip: page * limit,
      take: limit,
    });

    // BigInt serialization fix
    const serializedWords = words.map(w => ({
      ...w,
      id: Number(w.id)
    }));

    return NextResponse.json(serializedWords);
  } catch (error: any) {
    console.error('Browse API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
