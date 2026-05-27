import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { generateQuizQuestions } from '@/lib/groq';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'flashcards';
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    if (mode === 'quiz') {
      // Fetch 10 random words with high confidence
      const words = await prisma.$queryRaw`
        SELECT bikol, english, tagalog, pos, category, example_bikol, example_english 
        FROM words 
        WHERE confidence >= 0.8 
        ORDER BY RANDOM() 
        LIMIT ${Math.min(limit, 50)}
      ` as any[];

      if (words.length < 5) {
        return NextResponse.json({ error: 'Not enough words to generate a quiz' }, { status: 400 });
      }

      const questions = await generateQuizQuestions(words);
      return NextResponse.json({ questions });
    } else {
      // Default: Flashcards
      const words = await prisma.$queryRaw`
        SELECT bikol, english, tagalog, pos, category, example_bikol, example_english 
        FROM words 
        WHERE confidence >= 0.8 
        ORDER BY RANDOM() 
        LIMIT ${Math.min(limit, 100)}
      ` as any[];

      return NextResponse.json(words);
    }
  } catch (error: any) {
    console.error('Learn API error:', error);
    return NextResponse.json({ error: 'Failed to fetch learning content', details: error.message }, { status: 500 });
  }
}
