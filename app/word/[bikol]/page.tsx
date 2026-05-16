import { prisma } from '@/lib/prisma';
import WordClientPage from './WordClientPage';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function WordDetail({ params }: { params: Promise<{ bikol: string }> }) {
  const { bikol } = await params;
  const bikolWord = decodeURIComponent(bikol);

  try {
    const word = await prisma.word.findUnique({
      where: { bikol: bikolWord } 
    });

    if (!word) {
      return notFound();
    }

    return <WordClientPage word={word} />;
  } catch (e: any) {
    console.error(e);
    return (
      <main className="min-h-screen bg-zinc-950 text-white p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-xl font-bold">Error loading word</div>
          <p className="text-zinc-400">{e.message}</p>
        </div>
      </main>
    );
  }
}
