import BrowseClient from '@/components/BrowseClient';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { browseWords, getCategoryCounts, countDistinctWords, type WordSearchEntry } from '@/lib/word-search';

// ISR: dictionary content changes infrequently, revalidate every 5 minutes
export const revalidate = 300;

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ letter?: string; category?: string; q?: string; sort?: string }>;
}) {
  const { letter, category, q, sort } = await searchParams;

  let words: WordSearchEntry[] = [];
  let categories: string[] = [];
  let totalWords = 0;
  let dbError: string | null = null;

  const [wordsResult, categoriesResult, totalResult] = await Promise.allSettled([
    browseWords({
      filters: { letter, category, q },
      sort,
      limit: 50,
      offset: 0,
    }),
    getCategoryCounts(50),
    countDistinctWords(),
  ]);

  if (wordsResult.status === 'fulfilled') {
    words = wordsResult.value;
  } else {
    console.error(wordsResult.reason);
    dbError = wordsResult.reason?.message || 'Failed to load words';
  }

  if (categoriesResult.status === 'fulfilled') {
    categories = categoriesResult.value.map((c) => c.category).sort();
  } else {
    console.error('Categories failed:', categoriesResult.reason);
  }

  if (totalResult.status === 'fulfilled') {
    totalWords = totalResult.value;
  }

  return (
    <main
      className="min-h-screen p-8"
      style={{ backgroundColor: 'var(--editorial-bg)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section label + heading */}
        <span className="section-number">Dictionary</span>
        <div className="flex items-center justify-between mt-3 mb-8 flex-wrap gap-4">
          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--editorial-text)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Browse Dictionary
          </h1>
          <Link
            href="/flashcards"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{
              fontFamily: 'var(--font-body)',
              backgroundColor: 'var(--editorial-accent)',
              color: '#fff',
            }}
          >
            <BookOpen className="w-4 h-4" />
            Study with Flashcards
          </Link>
        </div>
        <div className="rule-divider mb-10" />

        {dbError && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-900/50 p-4 rounded-xl text-sm mb-6"
            style={{ fontFamily: 'var(--font-body)' }}>
            Database Error: {dbError}
          </div>
        )}

        <BrowseClient
          initialWords={words}
          initialCategories={categories}
          totalWords={totalWords}
          initialLetter={letter || ''}
          initialCategory={category || ''}
          initialQuery={q || ''}
          initialSort={sort || ''}
        />
      </div>
    </main>
  );
}
