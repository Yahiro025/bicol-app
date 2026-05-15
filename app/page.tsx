import { prisma } from '@/lib/prisma';
import SearchBar from '@/components/SearchBar';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let wordCount = 0;
  let dbError = null;
  try {
    wordCount = await prisma.word.count();
  } catch (e: any) {
    console.error(e);
    dbError = e.message;
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {dbError && (
        <div className="bg-red-900 text-red-100 p-4 text-center text-sm">
          Database Error: {dbError}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-blue-500">BIKOL</span>DICT
          </h1>
          <nav className="flex gap-6 text-sm">
            <a href="/" className="text-zinc-400 hover:text-white transition">Home</a>
            <a href="/learn" className="text-zinc-400 hover:text-white transition">Learn</a>
            <a href="/frequency-list" className="text-zinc-400 hover:text-white transition">Frequency</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold tracking-tight">
              Master the <span className="text-blue-500">Bikol</span> Language
            </h2>
            <p className="text-xl text-zinc-400 leading-relaxed">
              Search thousands of words across 5+ dialects with AI-enhanced translations and offline support.
            </p>
          </div>

          <SearchBar />

          {/* Stats */}
          <div className="flex justify-center gap-8 text-sm text-zinc-500">
            <span>{wordCount.toLocaleString()}+ Words</span>
            <span>5+ Dialects</span>
            <span>AI Enhanced</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex justify-center gap-4">
            <a href="/learn" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition">
              Start Learning
            </a>
            <a href="/frequency-list" className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition border border-zinc-700">
              Word Frequency List
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
