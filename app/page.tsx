import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let wordCount = 0;
  try {
    wordCount = await prisma.word.count();
  } catch (e) {
    console.error(e);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col">
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

          {/* Search Box */}
          <div className="relative max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Search a Bikol or English word..."
              className="w-full px-6 py-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
              Search
            </button>
          </div>

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
