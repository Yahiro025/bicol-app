import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function WordDetail({ params }: { params: { bikol: string } }) {
  const bikolWord = decodeURIComponent(params.bikol);

  try {
    const word = await prisma.word.findUnique({
      where: { bikol: bikolWord } 
    });

    if (!word) {
      return <div className="p-8 text-center text-red-500">Word not found</div>;
    }

    return (
      <main className="min-h-screen bg-zinc-950 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-blue-500">{word.bikol}</h1>
          <p className="text-xl text-zinc-300 mb-6">{word.english}</p>
          
          {word.tagalog && (
            <div className="mb-4">
              <span className="font-semibold">Tagalog:</span> {word.tagalog}
            </div>
          )}

          {word.pos && (
            <div className="mb-4">
              <span className="font-semibold">Part of Speech:</span> {word.pos}
            </div>
          )}

          {word.dialect && (
            <div className="mb-4">
              <span className="font-semibold">Dialect:</span> {word.dialect}
            </div>
          )}

          {word.pronunciation && (
            <div className="mb-4">
              <span className="font-semibold">Pronunciation:</span> {word.pronunciation}
            </div>
          )}

          {/* Handle Synonyms as comma-separated string */}
          {word.synonyms && (
            <div className="mb-4">
              <span className="font-semibold">Synonyms:</span> {word.synonyms}
            </div>
          )}

          {word.example_bikol && (
            <div className="mt-8 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-500 uppercase mb-2">Example</h3>
              <p className="text-lg italic">"{word.example_bikol}"</p>
              {word.example_english && <p className="text-zinc-400 mt-1">— {word.example_english}</p>}
            </div>
          )}
        </div>
      </main>
    );
  } catch (e: any) {
    console.error(e);
    return <div className="p-8 text-center text-red-500">Error loading word: {e.message}</div>;
  }
}
