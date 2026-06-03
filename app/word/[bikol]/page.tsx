import { prisma } from '@/lib/prisma';
import { cache as reactCache } from 'react';
import WordClientPage from './WordClientPage';
import { notFound } from 'next/navigation';
import { conjugateBikolVerb } from '@/lib/conjugator';
import { POPULAR_WORDS } from '@/lib/constants';
import type { WordDisplayData } from '@/lib/types/word';
import type { Metadata } from 'next';

// ISR: word entries are essentially static, revalidate daily
export const revalidate = 86400;

// ─── SSG: Pre-build the most popular words at build time ────────────────────
// This ensures instant loads for frequently-visited entries.
// Less common words render on-demand via ISR (first hit slow, then cached).
export async function generateStaticParams() {
  try {
    // Pre-build popular words + words with frequency_rank <= 100
    const freqWords = await prisma.$queryRaw<{ bikol: string }[]>`
      SELECT bikol FROM roots
      WHERE bikol IS NOT NULL AND bikol != '' AND frequency_rank IS NOT NULL AND frequency_rank <= 100
      UNION ALL
      SELECT bikol FROM words
      WHERE bikol IS NOT NULL AND bikol != '' AND frequency_rank IS NOT NULL AND frequency_rank <= 100
      LIMIT 100
    `;

    const popularBikol: string[] = [...POPULAR_WORDS];
    for (const row of freqWords) {
      const b = row.bikol;
      if (!popularBikol.some((p) => p.toLowerCase() === b.toLowerCase())) {
        popularBikol.push(b);
      }
    }

    const existingWords: string[] = [];
    for (const word of popularBikol) {
      const result = await getWordData(word);
      if (result) existingWords.push(word);
    }

    return existingWords.map((b) => ({ bikol: encodeURIComponent(b) }));
  } catch {
    // Avoid prerendering non-existent popular-word pages when DB is unavailable.
    console.warn('generateStaticParams: DB unavailable, skipping word prebuild');
    return [];
  }
}

// Dynamic params for words not in the static set
export const dynamicParams = true;

// Cache the expensive word lookup so generateMetadata and the page component
// share the same query result instead of hitting the DB twice per request.
const getWordData = reactCache(async (bikolWord: string) => {
  try {
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
    if (root) return { type: 'root' as const, data: root };
  } catch (dbError) {
    console.error('Mintz Root table not ready or schema mismatch:', dbError);
  }

  const word = await prisma.word.findUnique({
    where: { bikol: bikolWord }
  });
  if (word) return { type: 'word' as const, data: word };

  return null;
});

export async function generateMetadata({ params }: { params: Promise<{ bikol: string }> }): Promise<Metadata> {
  const { bikol } = await params;
  const bikolWord = decodeURIComponent(bikol);

  try {
    const result = await getWordData(bikolWord);

    if (result?.type === 'root' && result.data.definitions?.[0]) {
      const def = result.data.definitions[0];
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

    if (result?.type === 'word') {
      const word = result.data;
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
  let result: Awaited<ReturnType<typeof getWordData>> = null;

  try {
    // Uses the same cached getWordData() as generateMetadata — no duplicate DB query.
    result = await getWordData(bikolWord);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'An unexpected error occurred';
    console.error('Error fetching word:', e);
    return (
      <main className="min-h-screen p-8 flex items-center justify-center" style={{ backgroundColor: 'var(--editorial-bg)' }}>
        <div className="text-center space-y-4">
          <div className="text-xl font-bold" style={{ color: 'var(--editorial-rust)', fontFamily: 'var(--font-display)' }}>Error loading word</div>
          <p style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>{message}</p>
        </div>
      </main>
    );
  }

  if (result?.type === 'root') {
      const root = result.data;
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

  if (result?.type === 'word') {
      const word = result.data;
      const displayWord: WordDisplayData = { ...word, bikol: word.bikol!, definitions: [] };
      return <WordClientPage word={displayWord} isNormalized={false} />;
    }

  return notFound();
}
