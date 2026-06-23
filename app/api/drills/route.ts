import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSubstitutionDrill } from '@/lib/groq';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    let example;

    if (id) {
      // Fetch specific sentence
      example = await prisma.exampleSentence.findUnique({
        where: { id },
        include: {
          definition: {
            include: {
              root: true
            }
          }
        },
      });
    } else {
      // Fetch random sentence from entries that have examples
      const count = await prisma.exampleSentence.count();
      
      if (count === 0) {
        return NextResponse.json(
          { error: 'No example sentences found in database.' },
          { status: 404 }
        );
      }

      const skip = Math.floor(Math.random() * count);
      example = await prisma.exampleSentence.findFirst({
        skip,
        take: 1,
        include: {
          definition: {
            include: {
              root: true
            }
          }
        },
      });
    }

    if (!example || !example.bikol) {
      return NextResponse.json(
        { error: 'Sentence not found or missing Bikol content.' },
        { status: 404 }
      );
    }

    // AI Generation with Rate Limit Handling (managed in lib/groq.ts)
    const drillData = await generateSubstitutionDrill(example.bikol);

    return NextResponse.json({
      baseSentence: example.bikol,
      translation: example.english,
      root: example.definition.root.bikol,
      pos: example.definition.root.pos,
      cues: drillData.cues,
      metadata: {
        id: example.id,
        definitionId: example.definitionId,
        source: example.source || 'Mintz Dictionary'
      }
    });

  } catch (error: unknown) {
    console.error('[DRILLS_API_ERROR]:', error);

    // Differentiate between rate limits and generic errors
    const status = (error as { status?: number })?.status;
    if (status === 429) {
      return NextResponse.json(
        { error: 'Groq API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const message = error instanceof Error ? error.message : undefined;
    return NextResponse.json(
      { 
        error: 'Failed to generate drill data.', 
        details: process.env.NODE_ENV === 'development' ? message : undefined 
      },
      { status: 500 }
    );
  }
}
