export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSubstitutionDrill } from '@/lib/gemini';

export async function GET() {
  try {
    const count = await prisma.exampleSentence.count();
    if (count === 0) {
      return NextResponse.json(
        { error: 'No example sentences found in database.' },
        { status: 404 }
      );
    }

    // Fetch a random example sentence from the database
    const skip = Math.floor(Math.random() * count);
    const base = await prisma.exampleSentence.findFirst({
      skip,
      take: 1,
    });

    if (!base || !base.bikol) {
      return NextResponse.json(
        { error: 'No suitable base sentence found.' },
        { status: 404 }
      );
    }

    const baseSentence = base.bikol;

    // Use Gemini to intelligently generate substitution cues and grammatically correct expected sentences
    const drillData = await generateSubstitutionDrill(baseSentence);

    return NextResponse.json({ 
      baseSentence, 
      cues: drillData.cues 
    });
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
