import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
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

/**
 * Builds a Prisma.sql query that fetches random words from both roots and legacy
 * words tables, deduplicated by LOWER(bikol) with roots taking priority.
 */
function buildRandomWordsQuery(limit: number): Prisma.Sql {
  return Prisma.sql`
    SELECT bikol, english, tagalog, pos, category, example_bikol, example_english
    FROM (
      SELECT DISTINCT ON (LOWER(bikol))
        bikol, english, tagalog, pos, category, example_bikol, example_english
      FROM (
        SELECT
          r.bikol,
          def.english,
          def.tagalog,
          r.pos,
          r.category,
          NULL as example_bikol,
          NULL as example_english,
          0 as source_priority
        FROM roots r
        LEFT JOIN LATERAL (
          SELECT d.english, d.tagalog
          FROM definitions d
          WHERE d."rootId" = r.id
          ORDER BY d."createdAt" ASC
          LIMIT 1
        ) def ON true
        WHERE r.bikol IS NOT NULL AND r.bikol != '' AND def.english IS NOT NULL

        UNION ALL

        SELECT
          w.bikol,
          w.english,
          w.tagalog,
          w.pos,
          w.category,
          w.example_bikol,
          w.example_english,
          1 as source_priority
        FROM words w
        WHERE w.bikol IS NOT NULL AND w.bikol != '' AND confidence >= 0.8
      ) combined
      ORDER BY LOWER(bikol), source_priority ASC
    ) deduped
    ORDER BY RANDOM()
    LIMIT ${limit}
  `;
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
      const words = await prisma.$queryRaw(buildRandomWordsQuery(Math.min(limit, 50))) as any[];

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
      // Default: Flashcards
      const words = await prisma.$queryRaw(buildRandomWordsQuery(Math.min(limit, 100))) as any[];

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
