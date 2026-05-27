import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const letter = searchParams.get('letter');
  const category = searchParams.get('category');
  const q = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '0');
  const limit = parseInt(searchParams.get('limit') || '50');
  const sort = searchParams.get('sort');

  try {
    // Build WHERE conditions as Prisma.Sql fragments for safe parameterization
    const conditions: Prisma.Sql[] = [];

    if (letter) {
      conditions.push(Prisma.sql`LOWER("bikol") LIKE LOWER(${letter + '%'})`);
    }
    if (category) {
      conditions.push(Prisma.sql`LOWER("category") = LOWER(${category})`);
    }
    if (q) {
      conditions.push(Prisma.sql`(
        LOWER("bikol") LIKE LOWER(${'%' + q + '%'}) OR
        LOWER("english") LIKE LOWER(${'%' + q + '%'}) OR
        LOWER("tagalog") LIKE LOWER(${'%' + q + '%'})
      )`);
    }

    const whereClause = conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

    // Case-insensitive sort: LOWER(bikol) ensures Adwana sorts among adwana, not before all lowercase
    const orderByClause = sort === 'frequency'
      ? Prisma.sql`ORDER BY "frequency_rank" ASC NULLS LAST, LOWER("bikol") ASC`
      : Prisma.sql`ORDER BY LOWER("bikol") ASC`;

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
