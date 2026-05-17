import { prisma } from '@/lib/prisma';
import BrowseClient from '@/components/BrowseClient';
import { CATEGORY_META } from '@/lib/constants';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface BrowsePageProps {
  searchParams: Promise<{
    letter?: string;
    category?: string;
    q?: string;
  }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const { letter, category, q } = await searchParams;
  
  const activeLetter = letter?.toUpperCase() || '';
  const activeCategory = category || '';
  const query = q || '';

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Build the dynamic Prisma where clause
  const where: any = {
    AND: [
      activeLetter ? { bikol: { startsWith: activeLetter, mode: 'insensitive' } } : {},
      activeCategory ? { category: { equals: activeCategory, mode: 'insensitive' } } : {},
      query ? {
        OR: [
          { bikol: { contains: query, mode: 'insensitive' } },
          { english: { contains: query, mode: 'insensitive' } },
          { tagalog: { contains: query, mode: 'insensitive' } },
        ],
      } : {},
    ],
  };

  let words: any[] = [];
  let dbError = null;

  try {
    words = await prisma.word.findMany({
      where,
      orderBy: { bikol: 'asc' },
      take: 100,
    });
  } catch (e: any) {
    console.error(e);
    dbError = e.message;
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Browse Dictionary</h1>
          <p className="text-zinc-400">Explore and search the Bikol language.</p>
        </div>

        {dbError && (
          <div className="bg-red-900 text-red-100 p-4 rounded-xl text-sm">
            Database Error: {dbError}
          </div>
        )}

        {/* Filters Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-8">
            {/* Alphabetical Filter */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Letter</h3>
                {activeLetter && (
                  <Link href={`/browse?${new URLSearchParams({ ...(activeCategory && { category: activeCategory }), ...(query && { q: query }) })}`} className="text-xs text-blue-500 hover:underline">Clear</Link>
                )}
              </div>
              <div className="grid grid-cols-6 gap-1">
                {letters.map((l) => (
                  <Link
                    key={l}
                    href={`/browse?${new URLSearchParams({ letter: l, ...(activeCategory && { category: activeCategory }), ...(query && { q: query }) })}`}
                    className={`h-8 flex items-center justify-center rounded text-xs font-bold transition-all border ${
                      activeLetter === l 
                        ? 'bg-blue-600 border-blue-500 text-white' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    {l}
                  </Link>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Category</h3>
                {activeCategory && (
                  <Link href={`/browse?${new URLSearchParams({ ...(activeLetter && { letter: activeLetter }), ...(query && { q: query }) })}`} className="text-xs text-blue-500 hover:underline">Clear</Link>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {Object.keys(CATEGORY_META).map((cat) => (
                  <Link
                    key={cat}
                    href={`/browse?${new URLSearchParams({ category: cat, ...(activeLetter && { letter: activeLetter }), ...(query && { q: query }) })}`}
                    className={`px-3 py-2 rounded text-xs font-bold transition-all border text-left ${
                      activeCategory === cat 
                        ? 'bg-zinc-100 border-white text-zinc-950' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Search and Results */}
          <div className="lg:col-span-3">
            <BrowseClient 
              initialWords={words} 
              initialLetter={activeLetter} 
              initialCategory={activeCategory} 
              initialQuery={query} 
            />
          </div>
        </div>
      </div>
    </main>
  );
}
