import { prisma } from '@/lib/prisma';
import SearchBar from '@/components/SearchBar';
import WordOfTheDay from '@/components/WordOfTheDay';
import CategoryGrid from '@/components/CategoryGrid';
import WordCard from '@/components/WordCard';
import { POPULAR_WORDS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let wordCount = 0;
  let categoryCounts: any[] = [];
  let popularWords: any[] = [];
  let wotd: any = null;
  let dbError = null;

  try {
    // 1. Basic Stats
    wordCount = await prisma.word.count();
    
    // 2. Category Counts
    categoryCounts = await prisma.word.groupBy({
      by: ['category'],
      _count: {
        bikol: true
      },
      orderBy: {
        _count: {
          bikol: 'desc'
        }
      },
      take: 12
    });

    // 3. Popular Words
    popularWords = await prisma.word.findMany({
      where: {
        bikol: {
          in: POPULAR_WORDS
        }
      }
    });

    // 4. Word of the Day (Deterministic based on date)
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const skip = dayOfYear % (wordCount || 1);
    
    const wotdList = await prisma.word.findMany({
      take: 1,
      skip: skip
    });
    wotd = wotdList[0];

  } catch (e: any) {
    console.error(e);
    dbError = e.message;
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col pb-20">
      {dbError && (
        <div className="bg-red-900 text-red-100 p-4 text-center text-sm">
          Database Error: {dbError}
        </div>
      )}

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24 bg-gradient-to-b from-blue-900/10 to-transparent">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
              Master the <span className="text-blue-500">Bikol</span> Language
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              Search thousands of words across 5+ dialects with AI-enhanced translations and offline support.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-white">{wordCount.toLocaleString()}+</span>
              <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black">Words</span>
            </div>
            <div className="flex flex-col items-center border-l border-zinc-800 pl-8">
              <span className="text-2xl font-bold text-white">5+</span>
              <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black">Dialects</span>
            </div>
            <div className="flex flex-col items-center border-l border-zinc-800 pl-8">
              <span className="text-2xl font-bold text-white">AI</span>
              <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black">Enhanced</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 w-full space-y-20">
        {/* Word of the Day */}
        {wotd && (
          <section className="space-y-6">
            <WordOfTheDay word={wotd} />
          </section>
        )}

        {/* Categories */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Browse by Category</h3>
              <p className="text-zinc-500">Explore words grouped by topic and usage.</p>
            </div>
            <a href="/browse" className="text-blue-500 font-bold text-sm hover:underline">View All</a>
          </div>
          <CategoryGrid categoryCounts={categoryCounts} />
        </section>

        {/* Popular Words */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Popular Words</h3>
              <p className="text-zinc-500">Most commonly searched and used Bikol words.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularWords.map((word) => (
              <WordCard key={word.bikol} word={word} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
