import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { processDialogue, evaluateDialogue } from '@/lib/groq';
import type { DialogueMessage, DialogueScenario } from '@/lib/types/learn';

function errorResponse(message: string, details?: string) {
  return NextResponse.json({ error: message, ...(details && { details }) }, { status: 500 });
}

export async function GET() {
  try {
    return NextResponse.json(await prisma.dialogueScenario.findMany({ orderBy: { createdAt: 'desc' } }));
  } catch (error: unknown) {
    console.error('Failed to fetch dialogue scenarios:', error);
    return errorResponse('Failed to fetch dialogue scenarios', error instanceof Error ? error.message : undefined);
  }
}

export async function POST(request: Request) {
  try {
    const { scenario, messages, mode } = (await request.json()) as {
      scenario: DialogueScenario;
      messages: DialogueMessage[];
      mode: 'chat' | 'evaluate';
    };

    const result = mode === 'evaluate'
      ? await evaluateDialogue(scenario, messages)
      : await processDialogue(scenario, messages);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Dialogue API error:', error);
    return errorResponse('Failed to process dialogue interaction');
  }
}
