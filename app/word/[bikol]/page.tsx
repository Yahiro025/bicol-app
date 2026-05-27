import { prisma } from '@/lib/prisma';
import WordClientPage from './WordClientPage';
import { notFound } from 'next/navigation';
import { conjugateBikolVerb } from '@/lib/conjugator';
import type { WordDisplayData } from '@/lib/types/word';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ bikol: string }> }): Promise<Metadata> {
  const { bikol } = await params;
  const bikolWord = decodeURIComponent(bikol);

  try {
    // Try normalized Root table first
    const root = await prisma.root.findFirst({
      where: { bikol: { equals: bikolWord, mode: 'insensitive' } },
      include: { definitions: { select: { english: true, tagalog: true, dialect: true } } }
    });

    if (root?.definitions?.[0]) {
      const def = root.definitions[0];
      const english = def.english || '';
      const desc = `Learn the Bikol word "${bikolWord}": ${english}.${def.tagalog ? ` Tagalog: ${def.tagalog}.` : ''} Includes verb conjugations, example sentences, and pronunciation.`;
      return {
        title: `${bikolWord} — ${english}`,
        description: desc.substring(0, 160),
        openGraph: {
          title: `${bikolWord} — ${english} | BIKOL Dictionary`,
          description: desc.substring(0, 160),
          type: 'article',
        },
        twitter: {
          title: `${bikolWord} — ${english}`,
          description: desc.substring(0, 160),
        }
      };
    }

    // Fallback to legacy Word table
    const word = await prisma.word.findUnique({ where: { bikol: bikolWord } });
    if (word) {
      const desc = `Learn the Bikol word "${bikolWord}": ${word.english}.${word.tagalog ? ` Tagalog: ${word.tagalog}.` : ''} Part of speech: ${word.pos || 'word'}.`;
      return {
        title: `${bikolWord} — ${word.english}`,
        description: desc.substring(0, 160),
        openGraph: {
          title: `${bikolWord} — ${word.english} | BIKOL Dictionary`,
          description: desc.substring(0, 160),
          type: 'article',
        },
        twitter: {
          title: `${bikolWord} — ${word.english}`,
          description: desc.substring(0, 160),
        }
      };
    }
  } catch {
    // Fall through to default
  }

  return {
    title: `${bikolWord} — BIKOL Dictionary`,
    description: `Look up the Bikol word "${bikolWord}" in our comprehensive Bikol language dictionary with translations, conjugations, and examples.`,
  };
}

export default async function WordDetail({ params }: { params: Promise<{ bikol: string }> }) {
  const { bikol } = await params;
  const bikolWord = decodeURIComponent(bikol);

  try {
    // 1. Try to find in the normalized Root table (Mintz)
    let root = null;
    try {
      root = await prisma.root.findFirst({
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
    } catch (dbError) {
      console.error('Mintz Root table not ready or schema mismatch:', dbError);
      // Proceed to fallback
    }

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

    const displayWord: WordDisplayData = { ...word, bikol: word.bikol!, definitions: [] };
    return <WordClientPage word={displayWord} isNormalized={false} />;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'An unexpected error occurred';
    console.error('Error fetching word:', e);
    return (
      <main className="min-h-screen bg-zinc-950 text-white p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-xl font-bold">Error loading word</div>
          <p className="text-zinc-400">{message}</p>
        </div>
      </main>
    );
  }
}
