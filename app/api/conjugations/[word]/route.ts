import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { conjugateBikolVerb } from '@/lib/conjugator';

/**
 * GET /api/conjugations/[word]
 * Fetches or generates conjugations for a given Bikol root word.
 */
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
    // 2. Query the database (using Prisma) for the Root
    const root = await prisma.root.findFirst({
      where: {
        bikol: {
          equals: decodedWord,
          mode: 'insensitive',
        },
      },
      include: {
        // 3. Fetch all associated Definitions
        definitions: {
          include: {
            // 4. Fetch related Conjugations for those definitions
            conjugations: true,
          },
        },
      },
    });

    if (!root) {
      return NextResponse.json({ error: 'Root word not found' }, { status: 404 });
    }

    // 6. Return a JSON structure grouped by Affix Pair and Tense
    const affixPairs: Record<string, Record<string, any[]>> = {};

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

      // 5. FALLBACK: If no pre-generated Conjugations in the database, 
      // use the logic in lib/conjugator.ts to generate them on the fly.
      if (conjugations.length === 0 && affixPairName !== 'UNKNOWN') {
        const generated = conjugateBikolVerb(root.bikol, affixPairName);
        
        // Map generated results to match the schema-like structure for the loop below
        conjugations = generated.map((g) => ({
          ...g,
          id: `gen_${Math.random().toString(36).substring(2, 11)}`,
          definitionId: definition.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })) as unknown as typeof definition.conjugations;
      }

      for (const conj of conjugations) {
        const tense = conj.tense || 'Unknown';
        
        // We only group the 4 specific tenses requested
        if (affixPairs[affixPairName] && affixPairs[affixPairName][tense]) {
          // Deduplicate if multiple definitions yield the same conjugation
          const alreadyExists = affixPairs[affixPairName][tense]?.some(
            (c: any) => c.form === conj.form && c.focus === conj.focus
          );
          
          if (!alreadyExists) {
            affixPairs[affixPairName][tense]?.push({
              form: conj.form,
              focus: conj.focus,
            });
          }
        }
      }
    }

    return NextResponse.json({
      root: root.bikol,
      affixPairs,
    });
  } catch (error: any) {
    console.error('Error in conjugations API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
