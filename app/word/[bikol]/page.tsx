import React from 'react';
import { prisma } from '@/lib/prisma';
import WordClientPage from './WordClientPage';

// Static site generation for all words in the database
export async function generateStaticParams() {
  const words = await prisma.word.findMany({
    select: { bikol: true },
  });

  return words.map((word) => ({
    bikol: encodeURIComponent(word.bikol),
  }));
}

export default async function WordDetail({ params }: { params: { bikol: string } }) {
  const bikol = decodeURIComponent(params.bikol);
  
  const word = await prisma.word.findUnique({
    where: { bikol },
  });

  if (!word) {
    return <div className="p-10 text-center text-red-500 font-bold">Word not found.</div>;
  }

  // Convert Date and Decimal to JSON-safe formats
  const serializedWord = {
    ...word,
    created_at: word.created_at.toISOString(),
  };

  return <WordClientPage word={serializedWord} />;
}

