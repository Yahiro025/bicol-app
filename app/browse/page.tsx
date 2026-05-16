import { prisma } from '@/lib/prisma';
import WordCard from '@/components/WordCard';
import { CATEGORY_META } from '@/lib/constants';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface BrowsePageProps {
  searchParams: {
    letter?: string;
    category?: string;
  };
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const activeLetter = searchParams.letter?.toUpperCase() || 'ALL';
  const activeCategory = searchParams.category || 'ALL';

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Construct filter
  const where: any = {};
  if (activeLetter !== 'ALL') {
    where.bikol = {
      startsWith: activeLetter,
      mode: 'insensitive'
    };
  }
  if (activeCategory !== 'ALL') {
    where.category = activeCategory;
  }

  const words = await prisma.word.findMany({
    where,
    orderBy: { bikol: 'asc' },
    take: 100 // Limit for performance, can add pagination later
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Browse Dictionary</h1>
          <p className="text-zinc-400">Explore the rich vocabulary of the Bikol language.</p>
        </div>

        {/* Alphabetical Filter */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Filter by Letter</h3>
            <Link 
              href="/browse" 
              className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
                activeLetter === 'ALL' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-white'
              }`}
            >
              ALL
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {letters.map((l) => (
              <Link
                key={l}
                href={`/browse?letter=${l}${activeCategory !== 'ALL' ? `&category=${encodeURIComponent(activeCategory)}` : ''}`}
                className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all border ${
                  activeLetter === l 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40' 
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
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/browse${activeLetter !== 'ALL' ? `?letter=${activeLetter}` : ''}`}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                activeCategory === 'ALL' 
                  ? 'bg-zinc-100 border-white text-zinc-950' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-white'
              }`}
            >
              All Categories
            </Link>
            {Object.keys(CATEGORY_META).filter((cat, index, self) => self.indexOf(cat) === index).map((cat) => (
              <Link
                key={cat}
                href={`/browse?category=${encodeURIComponent(cat)}${activeLetter !== 'ALL' ? `&letter=${activeLetter}` : ''}`}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
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

        {/* Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h2 className="text-xl font-bold">
              {words.length} {words.length === 1 ? 'Word' : 'Words'} Found
            </h2>
          </div>

          {words.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-3xl">
              <p className="text-zinc-500 font-medium">No words found for these filters.</p>
              <Link href="/browse" className="text-blue-500 hover:underline text-sm mt-2 inline-block">
                Clear all filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {words.map((word) => (
                <WordCard key={word.bikol} word={word} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
