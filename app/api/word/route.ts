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
          include: {
            conjugations: true,
            exampleSentences: true,
          },
          orderBy: { createdAt: 'asc' },
        },
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
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, max-age=60, stale-while-revalidate=7200',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
