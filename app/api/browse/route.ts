import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildBrowseConditions, buildBrowseOrderBy } from '@/lib/browse-query';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const letter = searchParams.get('letter');
  const category = searchParams.get('category');
  const q = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '0');
  const limit = parseInt(searchParams.get('limit') || '50');
  const sort = searchParams.get('sort');

  try {
    const whereClause = buildBrowseConditions({ letter, category, q });
    const orderByClause = buildBrowseOrderBy(sort);

    const words: any[] = await prisma.$queryRaw`
      SELECT * FROM "words"
      ${whereClause}
      ${orderByClause}
      LIMIT ${limit} OFFSET ${page * limit}
    `;

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
