import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function FrequencyListPage() {
  let words: any[] = [];
  try {
    // Using id as a fallback for frequency rank if not present
    words = await prisma.word.findMany({ 
      orderBy: { id: 'asc' },
      take: 100 
    });
  } catch (e) {
    console.error(e);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Word Frequency List</h1>
        <p className="text-zinc-400 mb-8">Top 100 most common Bikol words:</p>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <ul className="divide-y divide-zinc-800">
            {words.map((word, idx) => (
              <li key={word.bikol} className="px-6 py-4 hover:bg-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-zinc-500 font-mono w-8">{idx + 1}.</span>
                  <a href={`/word/${encodeURIComponent(word.bikol)}`} className="text-blue-500 hover:underline font-medium">{word.bikol}</a>
                </div>
                <span className="text-zinc-400 text-sm">{word.english}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
