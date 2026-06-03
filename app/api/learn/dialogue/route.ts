import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { processDialogue, evaluateDialogue } from '@/lib/groq';
import type { DialogueMessage, DialogueScenario } from '@/lib/types/learn';

export async function GET() {
  try {
    const scenarios = await prisma.dialogueScenario.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(scenarios);
  } catch (error: unknown) {
    console.error('Failed to fetch dialogue scenarios:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch dialogue scenarios', details: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { scenario, messages, mode } = await request.json() as {
      scenario: DialogueScenario;
      messages: DialogueMessage[];
      mode: 'chat' | 'evaluate';
    };

    if (mode === 'evaluate') {
      const audit = await evaluateDialogue(scenario, messages);
      return NextResponse.json(audit);
    }

    const result = await processDialogue(scenario, messages);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Dialogue API error:', error);
    return NextResponse.json({ error: 'Failed to process dialogue interaction' }, { status: 500 });
  }
}
