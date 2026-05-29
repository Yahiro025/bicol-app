import BrowseClient from '@/components/BrowseClient';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { browseWords, getCategoryCounts, countDistinctWords } from '@/lib/word-search';

// ISR: dictionary content changes infrequently, revalidate every 5 minutes
export const revalidate = 300;

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ letter?: string; category?: string; q?: string; sort?: string }>;
}) {
  const { letter, category, q, sort } = await searchParams;

  let words: any[] = [];
  let categories: string[] = [];
  let totalWords = 0;
  let dbError = null;

  // Fetch words, categories & total count independently — one failing won't block the others
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
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h1 className="text-3xl font-bold">Browse Dictionary</h1>
          <Link
            href="/flashcards"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition-colors active:scale-95 shadow-lg shadow-blue-500/20"
          >
            <BookOpen className="w-4 h-4" />
            Study with Flashcards
          </Link>
        </div>
        
        {dbError && (
          <div className="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100 border border-red-200 dark:border-red-900/50 p-4 rounded-xl text-sm mb-6">
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
