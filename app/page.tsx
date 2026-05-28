import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import WordOfTheDay from '@/components/WordOfTheDay';
import CategoryGrid from '@/components/CategoryGrid';
import WordCard from '@/components/WordCard';
import HomeVerbDemo from '@/components/HomeVerbDemo';
import ClientSubmissionWrapper from '@/components/ClientSubmissionWrapper';
import { ArrowRight, Zap, BookOpen } from 'lucide-react';
import { countDistinctWords, getCategoryCounts, findWordsByBikol, getWordOfTheDay, getInitialDictionary } from '@/lib/word-search';
import { POPULAR_WORDS } from '@/lib/constants';

// ISR: revalidate every 5 minutes. WOTD is time-based and may be up to 5min stale at midnight.
export const revalidate = 300;

export default async function HomePage() {
  let wordCount = 0;
  let categoryCounts: { category: string; _count: { bikol: number } }[] = [];
  let popularWords: { bikol: string; english: string; tagalog: string | null; pos: string | null; dialect: string | null; pronunciation: string | null }[] = [];
  let wotd: typeof popularWords[number] | null = null;

  // Fetch critical data first (word count, WOTD, search dictionary).
  // Non-critical fetches (categories, popular words) run in parallel but
  // won't block the initial page response thanks to ISR revalidation.
  //
  // NOTE: countDistinctWords is wrapped in React cache() so getWordOfTheDay()
  // reuses the same call instead of duplicating the expensive COUNT query.
  const [wordCountResult, wotdResult, dictionaryResult, categoriesResult, popularResult] =
    await Promise.allSettled([
      countDistinctWords(),
      getWordOfTheDay(),
      getInitialDictionary(50),
      getCategoryCounts(12),
      findWordsByBikol(POPULAR_WORDS),
    ]);

  // Word count
  if (wordCountResult.status === 'fulfilled') {
    wordCount = wordCountResult.value;
  }

  // Word of the Day
  if (wotdResult.status === 'fulfilled') {
    const wotdEntry = wotdResult.value;
    if (wotdEntry) {
      wotd = {
        bikol: wotdEntry.bikol,
        english: wotdEntry.english || '',
        tagalog: wotdEntry.tagalog,
        pos: wotdEntry.pos,
        dialect: wotdEntry.dialect,
        pronunciation: wotdEntry.pronunciation,
      };
    }
  }

  // Category counts (now faster with per-table counting)
  if (categoriesResult.status === 'fulfilled') {
    categoryCounts = categoriesResult.value.map(c => ({
      category: c.category,
      _count: { bikol: c.count },
    }));
  }

  // Popular words
  if (popularResult.status === 'fulfilled') {
    popularWords = popularResult.value.map(w => ({
      bikol: w.bikol,
      english: w.english || '',
      tagalog: w.tagalog,
      pos: w.pos,
      dialect: w.dialect,
      pronunciation: w.pronunciation,
    }));
  }

  // Initial dictionary (50 entries for search bar — rest loaded on demand via API)
  const initialDictionary =
    dictionaryResult.status === 'fulfilled' ? dictionaryResult.value : [];

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
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
              <SearchBar initialDictionary={initialDictionary} />
            </div>

            {/* Primary CTA */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                href="/learn" 
                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 text-lg"
              >
                <Zap className="w-5 h-5" />
                Start Learning Bikol
              </Link>
              <Link 
                href="/browse" 
                prefetch={false}
                className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl transition-all active:scale-[0.98] border border-white/10 flex items-center justify-center gap-2 text-lg"
              >
                <BookOpen className="w-5 h-5" />
                Browse Dictionary
              </Link>
            </div>

            {/* Social Proof Stats */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center group hover:bg-white/10 transition-colors">
                <div className="text-2xl font-black text-white">{wordCount.toLocaleString()}+</div>
                <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">Words</div>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center group hover:bg-white/10 transition-colors">
                <div className="text-2xl font-black text-white">5+</div>
                <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">Dialects</div>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center group hover:bg-white/10 transition-colors">
                <div className="text-2xl font-black text-white">AI</div>
                <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">Enhanced</div>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center group hover:bg-white/10 transition-colors">
                <div className="text-2xl font-black text-white">Free</div>
                <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">Forever</div>
              </div>
            </div>

            {/* Verb Conjugator Demo */}
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-display font-bold text-white tracking-tight">Verb Conjugator</h2>
                  <p className="text-zinc-500 mt-1">Instantly see how Bikol verbs transform across tenses and focus types</p>
                </div>
                <Link href="/word/bakal" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors group">
                  Explore More Verbs
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <HomeVerbDemo />
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
                  <WordCard key={word.bikol!} word={word} className="hover:scale-[1.02] transition-transform" />
                ))}
              </div>
            </div>

            {/* Contribute Section */}
            <div className="space-y-10 pt-8 border-t border-white/10">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-display font-bold text-white tracking-tight">Contribute a Word</h2>
                <p className="text-zinc-500">Help us document and preserve the Bikol language. All submissions are reviewed by moderators.</p>
              </div>
              <ClientSubmissionWrapper />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
