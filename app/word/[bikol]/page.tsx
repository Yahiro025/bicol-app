import { prisma } from '@/lib/prisma';
import WordClientPage from './WordClientPage';
import { notFound } from 'next/navigation';
import { conjugateBikolVerb } from '@/lib/conjugator';

export const dynamic = 'force-dynamic';

export default async function WordDetail({ params }: { params: Promise<{ bikol: string }> }) {
  const { bikol } = await params;
  const bikolWord = decodeURIComponent(bikol);

  try {
    // 1. Try to find in the normalized Root table (Mintz)
    const root = await prisma.root.findFirst({
      where: { 
        bikol: {
          equals: bikolWord,
          mode: 'insensitive'
        }
      },
      include: {
        definitions: {
          include: {
            conjugations: true,
            exampleSentences: true
          }
        }
      }
    });

    if (root) {
      // 1b. Fallback: If verb has affixPair but no conjugations, generate them on-the-fly
      const enrichedDefinitions = root.definitions.map(def => {
        if (def.affixPair && def.affixPair !== 'UNKNOWN' && (!def.conjugations || def.conjugations.length === 0)) {
          const generated = conjugateBikolVerb(root.bikol, def.affixPair, def.focusType || undefined);
          return {
            ...def,
            conjugations: generated.map(c => ({
              id: `temp-${c.tense}-${c.focus}`,
              tense: c.tense,
              focus: c.focus,
              form: c.form,
              definitionId: def.id,
              createdAt: new Date(),
              updatedAt: new Date()
            }))
          };
        }
        return def;
      });

      return <WordClientPage word={{ ...root, definitions: enrichedDefinitions }} isNormalized={true} />;
    }

    // 2. Fallback to the legacy words table
    const word = await prisma.word.findUnique({
      where: { bikol: bikolWord } 
    });

    if (!word) {
      return notFound();
    }

    return <WordClientPage word={word} isNormalized={false} />;
  } catch (e: any) {
    console.error('Error fetching word:', e);
    return (
      <main className="min-h-screen bg-zinc-950 text-white p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-xl font-bold">Error loading word</div>
          <p className="text-zinc-400">{e.message}</p>
        </div>
      </main>
    );
  }
}
