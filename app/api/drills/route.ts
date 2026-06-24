import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { escapeRegex } from '@/lib/fuzzy';

type ExampleWithRoot = Prisma.ExampleSentenceGetPayload<{
  include: {
    definition: {
      include: {
        root: {
          select: { id: true; bikol: true; pos: true };
        };
      };
    };
  };
}>;

export async function GET() {
  try {
    const count = await prisma.exampleSentence.count();
    if (count === 0) {
      return NextResponse.json(
        { error: 'No example sentences found in database.' },
        { status: 404 }
      );
    }

    // Fetch a random example sentence whose Bikol text verbatim contains
    // its definition's root. Retry up to 5 times before giving up.
    let base: ExampleWithRoot | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const skip = Math.floor(Math.random() * count);
      const candidate = await prisma.exampleSentence.findFirst({
        skip,
        take: 1,
        include: {
          definition: {
            include: {
              root: { select: { id: true; bikol: true; pos: true } },
            },
          },
        },
      });

      if (
        candidate &&
        candidate.bikol &&
        candidate.definition.root.bikol &&
        candidate.bikol.includes(candidate.definition.root.bikol)
      ) {
        base = candidate;
        break;
      }
    }

    if (!base || !base.bikol) {
      return NextResponse.json(
        { error: 'No suitable base sentence found.' },
        { status: 404 }
      );
    }

    const baseRoot = base.definition.root;
    const baseSentence = base.bikol;

    // Find up to 3 random roots sharing the same part of speech as the base root.
    const rootCount = await prisma.root.count({
      where: { pos: baseRoot.pos, id: { not: baseRoot.id } },
    });

    if (rootCount === 0) {
      return NextResponse.json(
        { error: 'No substitute roots found for this part of speech.' },
        { status: 404 }
      );
    }

    const maxSkip = Math.max(0, rootCount - 3);
    const skipRoots = Math.floor(Math.random() * (maxSkip + 1));
    const substitutes = await prisma.root.findMany({
      where: { pos: baseRoot.pos, id: { not: baseRoot.id } },
      select: { id: true; bikol: true; pos: true },
      skip: skipRoots,
      take: 3,
    });

    // Build cues by replacing the base root in the base sentence with each
    // substitute root, using a case-insensitive regular expression.
    const replaceRegex = new RegExp(escapeRegex(baseRoot.bikol), 'gi');
    const cues = substitutes.map((sub) => ({
      cue: sub.bikol,
      expected: baseSentence.replace(replaceRegex, sub.bikol),
    }));

    return NextResponse.json({ baseSentence, cues });
  } catch (error: unknown) {
    console.error('[DRILLS_API_ERROR]:', error);
    const message = error instanceof Error ? error.message : undefined;
    return NextResponse.json(
      {
        error: 'Failed to generate drill data.',
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 500 }
    );
  }
}
