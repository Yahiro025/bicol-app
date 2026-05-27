import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const submissions = await prisma.userSubmission.findMany({
      orderBy: { created_at: 'desc' },
      take: 100,
    });
    return NextResponse.json(submissions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid id or status' }, { status: 400 });
    }

    const submission = await prisma.userSubmission.update({
      where: { id },
      data: { status },
    });

    // If approved, create the word entry BEFORE updating status
    // This prevents orphaned approved submissions if word creation fails
    if (status === 'approved') {
      await prisma.word.create({
        data: {
          bikol: submission.word,
          english: submission.definition,
          dialect: submission.dialect,
        },
      });
    }

    return NextResponse.json({ success: true, data: submission });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { word, definition, dialect } = body;

    const data = await prisma.userSubmission.create({
      data: { word, definition, dialect },
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
