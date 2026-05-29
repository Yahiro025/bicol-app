import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { generateQuizQuestions } from '@/lib/groq';

// ─── In-memory cache with TTL ────────────────────────────────────────────────
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const learnCache = new Map<string, CacheEntry<any>>();
const LEARN_CACHE_TTL = 120; // 2 minutes — flashcards/quiz content can be slightly stale

function getCached<T>(key: string): T | null {
  const entry = learnCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    learnCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCached<T>(key: string, data: T): void {
  learnCache.set(key, { data, expiresAt: Date.now() + LEARN_CACHE_TTL * 1000 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'flashcards';
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

  // Cache key includes mode + limit so different deck sizes have separate entries
  const cacheKey = `learn:${mode}:${limit}`;

  // Serve from cache if available — avoids expensive ORDER BY RANDOM() on every request
  const cached = getCached<any>(cacheKey);
  if (cached !== null) {
    return NextResponse.json(cached, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, max-age=60, stale-while-revalidate=300',
        'X-Cache': 'HIT',
      },
    });
  }

  try {
    if (mode === 'quiz') {
      // Fetch random words with high confidence — partial index on confidence speeds this up
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
      setCached(cacheKey, { questions });

      return NextResponse.json(
        { questions },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=120, max-age=60, stale-while-revalidate=300',
            'X-Cache': 'MISS',
          },
        }
      );
    } else {
      // Default: Flashcards — random words with high confidence
      const words = await prisma.$queryRaw`
        SELECT bikol, english, tagalog, pos, category, example_bikol, example_english
        FROM words
        WHERE confidence >= 0.8
        ORDER BY RANDOM()
        LIMIT ${Math.min(limit, 100)}
      ` as any[];

      setCached(cacheKey, words);

      return NextResponse.json(words, {
        headers: {
          'Cache-Control': 'public, s-maxage=120, max-age=60, stale-while-revalidate=300',
          'X-Cache': 'MISS',
        },
      });
    }
  } catch (error: any) {
    console.error('Learn API error:', error);
    return NextResponse.json({ error: 'Failed to fetch learning content', details: error.message }, { status: 500 });
  }
}
