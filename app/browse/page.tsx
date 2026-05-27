import { prisma } from '@/lib/prisma';
import BrowseClient from '@/components/BrowseClient';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ letter?: string; category?: string; q?: string; sort?: string }>;
}) {
  const { letter, category, q, sort } = await searchParams;

  let words: any[] = [];
  let categories: string[] = [];
  let dbError = null;

  try {
    // Build WHERE conditions as Prisma.Sql fragments for safe parameterization
    const conditions: Prisma.Sql[] = [];

    if (letter) {
      conditions.push(Prisma.sql`LOWER("bikol") LIKE LOWER(${letter + '%'})`);
    }
    if (category) {
      conditions.push(Prisma.sql`LOWER("category") = LOWER(${category})`);
    }
    if (q) {
      conditions.push(Prisma.sql`(
        LOWER("bikol") LIKE LOWER(${'%' + q + '%'}) OR
        LOWER("english") LIKE LOWER(${'%' + q + '%'}) OR
        LOWER("tagalog") LIKE LOWER(${'%' + q + '%'})
      )`);
    }

    const whereClause = conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

    // Case-insensitive sort: LOWER(bikol) ensures Adwana sorts among adwana, not before all lowercase
    const orderByClause = sort === 'frequency'
      ? Prisma.sql`ORDER BY "frequency_rank" ASC NULLS LAST, LOWER("bikol") ASC`
      : Prisma.sql`ORDER BY LOWER("bikol") ASC`;

    const rawWords: any[] = await prisma.$queryRaw`
      SELECT * FROM "words"
      ${whereClause}
      ${orderByClause}
      LIMIT 50
    `;

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
