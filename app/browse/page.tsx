import { prisma } from '@/lib/prisma';
import BrowseClient from '@/components/BrowseClient';

export const dynamic = 'force-dynamic';

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ letter?: string; category?: string; q?: string }>;
}) {
  const { letter, category, q } = await searchParams;

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
    // Fetch a larger set of words for client-side filtering
    // We still apply initial filters if they exist to keep the first paint relevant
    // but we'll fetch more words than before (1000 instead of 100)
    words = await prisma.word.findMany({
      where: whereClause,
      orderBy: { bikol: 'asc' },
      take: 1000,
    });

    // If we have filters but didn't get many results, or even if we did, 
    // for a better client-side experience we might want to fetch ALL words 
    // if the total count is small. For now, 1000 is a good compromise.

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
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Browse Dictionary</h1>
        
        {dbError && (
          <div className="bg-red-900 text-red-100 p-4 rounded-xl text-sm mb-6">
            Database Error: {dbError}
          </div>
        )}

        <BrowseClient 
          initialWords={words} 
          initialCategories={categories}
          initialLetter={letter || ''} 
          initialCategory={category || ''} 
          initialQuery={q || ''} 
        />
      </div>
    </main>
  );
}
