import { NextResponse } from 'next/server';
import { browseWords } from '@/lib/word-search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const data = await browseWords({
      filters: {},
      sort: 'frequency',
      limit,
      offset: 0,
    });

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, max-age=60, stale-while-revalidate=7200',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
