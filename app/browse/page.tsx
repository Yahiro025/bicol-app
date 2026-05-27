import { prisma } from '@/lib/prisma';
import BrowseClient from '@/components/BrowseClient';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ letter?: string; category?: string; q?: string; sort?: string }>;
}) {
  const { letter, category, q, sort } = await searchParams;

  // Build the dynamic Prisma where clause
  const whereClause: any = {
    AND: [
      letter ? { bikol: { startsWith: letter, mode: 'insensitive' } } : {},
      category ? { category: { equals: category, mode: 'insensitive' } } : {},
      q
        ? {
            OR: [
              { bikol: { contains: q, mode: 'insensitive' } },
              { english: { contains: q, mode: 'insensitive' } },
              { tagalog: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {},
    ],
  };

  let words: any[] = [];
  let categories: string[] = [];
  let dbError = null;

  try {
    // Initial fetch of words for SSR (SEO and fast first paint)
    // We only fetch 50 to keep the initial HTML small and fast
    const sortOrder = sort === 'frequency'
      ? [{ frequency_rank: { sort: 'asc' as const, nulls: 'last' as const } }, { bikol: 'asc' as const }]
      : [{ bikol: 'asc' as const }];

    const rawWords = await prisma.word.findMany({
      where: whereClause,
      orderBy: sortOrder,
      take: 50,
    });

    // BigInt serialization fix for Next.js
    words = rawWords.map(w => ({
      ...w,
      id: Number(w.id)
    }));

    // Fetch distinct categories for the filter buttons
    const result = await prisma.word.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ['category'],
    });
    categories = result.map((r: any) => r.category).filter(Boolean).sort() as string[];
    
  } catch (e: any) {
    console.error(e);
    dbError = e.message;
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
          initialLetter={letter || ''} 
          initialCategory={category || ''} 
          initialQuery={q || ''}
          initialSort={sort || ''}
        />
      </div>
    </main>
  );
}
