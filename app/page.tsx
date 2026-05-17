import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import WordOfTheDay from '@/components/WordOfTheDay';
import CategoryGrid from '@/components/CategoryGrid';
import WordCard from '@/components/WordCard';
import { ArrowRight } from 'lucide-react';
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
    categoryCounts = await (prisma.word.groupBy as any)({
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
    <main className="min-h-screen bg-zinc-950 text-white">
      {dbError && (
        <div className="bg-red-900 text-red-100 p-4 text-center text-sm">
          Database Error: {dbError}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-br from-blue-950/20 to-zinc-950/40 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1440 320%22><path fill=%22%231e293b%22 opacity=%220.15%22 d=%22M0,160L48,155.4C96,151,192,141,288,125.3C384,110,480,89,576,90.7C672,92,768,117,864,128C960,139,1056,134,1152,117.3C1248,101,1344,73,1392,58.7L1440,48L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z%22></path></svg>')"></div>
        </div>
        <div className="relative px-6 py-20 md:py-28">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <div className="space-y-3">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-blue-400 to-purple-500 py-2">
                BIKOL
              </h1>
              <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto text-balance">
                Discover the richness of the Bikol language with comprehensive definitions, examples, and audio pronunciations.
              </p>
            </div>
            
            <div className="mt-8 mx-auto w-full max-w-2xl">
              <SearchBar />
            </div>
            
            {/* Stats */}
            <div className="mt-16 flex flex-wrap justify-center gap-12 text-center">
              <div className="flex flex-col items-center space-y-1">
                <span className="text-4xl font-bold text-white tracking-tight">{wordCount.toLocaleString()}</span>
                <span className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Words</span>
              </div>
              <div className="flex flex-col items-center space-y-1 md:border-l border-zinc-800 md:pl-12">
                <span className="text-4xl font-bold text-white tracking-tight">5+</span>
                <span className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Dialects</span>
              </div>
              <div className="flex flex-col items-center space-y-1 md:border-l border-zinc-800 md:pl-12">
                <span className="text-4xl font-bold text-white tracking-tight">AI</span>
                <span className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Enhanced</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative py-20">
        <div className="absolute inset-0 -z-10">
          <div className="w-full h-full bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1440 320%22><path fill=%22%230f172a%22 opacity=%220.03%22 d=%22M0,224L60,208C120,192,240,160,360,138.7C480,117,600,107,720,125.3C840,143,960,187,1080,202.7C1200,219,1320,208,1380,202.7L1440,197.3L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z%22></path></svg>')"></div>
        </div>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid gap-16">
            {/* Word of the Day */}
            {wotd && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center text-xl">📅</span>
                  Word of the Day
                </h2>
                <WordOfTheDay word={wotd} className="max-w-xl mx-auto" />
              </div>
            )}
            
            {/* Categories */}
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-display font-bold text-white tracking-tight">Browse by Category</h2>
                  <p className="text-zinc-500 mt-1">Explore words by topic, organized for easy learning</p>
                </div>
<Link href="/browse" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors group">
  View All Categories
  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
</Link>
              </div>
              <CategoryGrid categoryCounts={categoryCounts} className="grid gap-6" />
            </div>
            
            {/* Popular Words */}
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-display font-bold text-white tracking-tight">Popular Words</h2>
                  <p className="text-zinc-500 mt-1">Frequently searched and most looked-up Bikol words</p>
                </div>
<Link href="/browse?sort=popular" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors group">
  See All Popular
  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
</Link>
              </div>
              <div className="grid gap-6">
                {popularWords.map((word) => (
                  <WordCard key={word.bikol} word={word} className="hover:scale-[1.02] transition-transform" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
