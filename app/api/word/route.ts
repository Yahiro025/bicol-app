import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bikol = searchParams.get('bikol');

  if (!bikol) return NextResponse.json({ error: 'Missing word' }, { status: 400 });

  try {
    const data = await prisma.word.findUnique({
      where: { bikol },
    });

    if (!data) return NextResponse.json({ error: 'Word not found' }, { status: 404 });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
