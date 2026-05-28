import { NextResponse } from 'next/server';
import { browseWords } from '@/lib/word-search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const letter = searchParams.get('letter');
  const category = searchParams.get('category');
  const q = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '0');
  const limit = parseInt(searchParams.get('limit') || '50');
  const sort = searchParams.get('sort');

  try {
    const words = await browseWords({
      filters: { letter, category, q },
      sort,
      limit,
      offset: page * limit,
    });

    // Cache for 5 minutes at CDN edge, 60 seconds in browser for stale-while-revalidate
    return NextResponse.json(words, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, max-age=60, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    console.error('Browse API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
