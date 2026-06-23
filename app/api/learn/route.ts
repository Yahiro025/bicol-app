import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { generateQuizQuestions } from '@/lib/groq';

const learnCache = new Map<string, { data: unknown; expiresAt: number }>();
const LEARN_CACHE_TTL = 120_000; // 2 minutes

function getCached<T>(key: string): T | null {
  const entry = learnCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { learnCache.delete(key); return null; }
  return entry.data as T;
}

function setCached<T>(key: string, data: T): void {
  learnCache.set(key, { data, expiresAt: Date.now() + LEARN_CACHE_TTL });
}

function buildRandomWordsQuery(limit: number): Prisma.Sql {
  return Prisma.sql`
    SELECT bikol, english, tagalog, pos, category, example_bikol, example_english
    FROM (
      SELECT DISTINCT ON (LOWER(bikol))
        bikol, english, tagalog, pos, category, example_bikol, example_english
      FROM (
        SELECT r.bikol, def.english, def.tagalog, r.pos, r.category,
          NULL as example_bikol, NULL as example_english, 0 as source_priority
        FROM roots r
        LEFT JOIN LATERAL (
          SELECT d.english, d.tagalog FROM definitions d
          WHERE d."rootId" = r.id ORDER BY d."createdAt" ASC LIMIT 1
        ) def ON true
        WHERE r.bikol IS NOT NULL AND r.bikol != '' AND def.english IS NOT NULL
        UNION ALL
        SELECT w.bikol, w.english, w.tagalog, w.pos, w.category,
          w.example_bikol, w.example_english, 1 as source_priority
        FROM words w
        WHERE w.bikol IS NOT NULL AND w.bikol != '' AND confidence >= 0.8
      ) combined
      ORDER BY LOWER(bikol), source_priority ASC
    ) deduped
    ORDER BY RANDOM()
    LIMIT ${limit}
  `;
}

type WordRow = {
  bikol: string;
  english: string | null;
  tagalog: string | null;
  pos: string | null;
  category: string | null;
  example_bikol: string | null;
  example_english: string | null;
};

const HEADERS = {
  'Cache-Control': 'public, s-maxage=120, max-age=60, stale-while-revalidate=300',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'flashcards';
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const cacheKey = `learn:${mode}:${limit}`;

  const cached = getCached<unknown>(cacheKey);
  if (cached !== null) {
    return NextResponse.json(cached, { headers: { ...HEADERS, 'X-Cache': 'HIT' } });
  }

  try {
    const rawWords = await prisma.$queryRaw(buildRandomWordsQuery(Math.min(limit, mode === 'quiz' ? 50 : 100))) as unknown as WordRow[];

    if (mode === 'quiz') {
      const validWords = rawWords.filter((w): w is WordRow & { english: string } => w.english !== null);
      if (validWords.length < 5) {
        return NextResponse.json({ error: 'Not enough words to generate a quiz' }, { status: 400 });
      }
      const questions = await generateQuizQuestions(validWords);
      setCached(cacheKey, { questions });
      return NextResponse.json({ questions }, { headers: { ...HEADERS, 'X-Cache': 'MISS' } });
    }

    setCached(cacheKey, rawWords);
    return NextResponse.json(rawWords, { headers: { ...HEADERS, 'X-Cache': 'MISS' } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Learn API error:', error);
    return NextResponse.json({ error: 'Failed to fetch learning content', details: message }, { status: 500 });
  }
}
