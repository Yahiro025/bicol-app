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

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
