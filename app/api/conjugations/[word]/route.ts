import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { conjugateBikolVerb } from '@/lib/conjugator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ word: string }> }
) {
  const { word } = await params;

  if (!word) {
    return NextResponse.json({ error: 'Word parameter is required' }, { status: 400 });
  }

  const decodedWord = decodeURIComponent(word);

  try {
    const root = await prisma.root.findFirst({
      where: {
        bikol: {
          equals: decodedWord,
          mode: 'insensitive',
        },
      },
      include: {
        definitions: {
          include: { conjugations: true },
        },
      },
    });

    if (!root) {
      return NextResponse.json({ error: 'Root word not found' }, { status: 404 });
    }

    const affixPairs: Record<string, Record<string, Array<{ form: string; focus: string }>>> = {};

    for (const definition of root.definitions) {
      const affixPairName = definition.affixPair || 'UNKNOWN';
      
      if (!affixPairs[affixPairName]) {
        affixPairs[affixPairName] = {
          Infinitive: [],
          Past: [],
          Progressive: [],
          Future: [],
        };
      }

      let conjugations = definition.conjugations;

      if (conjugations.length === 0 && affixPairName !== 'UNKNOWN') {
        const generated = conjugateBikolVerb(root.bikol, affixPairName);
        conjugations = generated.map((g) => ({
          ...g,
          id: `gen_${Math.random().toString(36).slice(2, 11)}`,
          definitionId: definition.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })) as unknown as typeof definition.conjugations;
      }

      for (const conj of conjugations) {
        const tense = conj.tense || 'Unknown';
        
        const group = affixPairs[affixPairName]?.[tense];
        if (group && conj.form && conj.focus && !group.some((c) => c.form === conj.form && c.focus === conj.focus)) {
          group.push({ form: conj.form, focus: conj.focus });
        }
      }
    }

    return NextResponse.json({
      root: root.bikol,
      affixPairs,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Error in conjugations API:', error);
    return NextResponse.json(
      { error: message }, 
      { status: 500 }
    );
  }
}
