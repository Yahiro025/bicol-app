import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function LearnPage() {
  let words: any[] = [];
  try {
    words = await prisma.word.findMany({ 
  orderBy: { bikol: 'asc' },
  take: 10 });
  } catch (e) {
    console.error(e);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Learn Bikol</h1>
        <p className="text-zinc-400 mb-8">Flashcard and quiz functionality coming soon! Here are some words to study:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {words.map((word) => (
            <div key={word.bikol} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-blue-500">{word.bikol}</h2>
              <p className="text-zinc-300 mt-2">{word.english}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
