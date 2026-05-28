import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bikol = searchParams.get('bikol');

  if (!bikol) return NextResponse.json({ error: 'Missing word' }, { status: 400 });

  try {
    // Query normalized roots first (includes Mintz data)
    const root = await prisma.root.findFirst({
      where: { bikol: { equals: bikol, mode: 'insensitive' } },
      include: {
        definitions: {
          orderBy: { createdAt: 'asc' },
        },
        conjugations: true,
      },
    });

    // Fall back to legacy words table
    const legacyWord = !root
      ? await prisma.word.findUnique({ where: { bikol } })
      : null;

    if (!root && !legacyWord) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }

    return NextResponse.json({
      root: root ?? null,
      legacy: legacyWord ?? null,
      source: root ? 'normalized' : 'legacy',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
