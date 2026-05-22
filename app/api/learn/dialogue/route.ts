import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { processDialogue, evaluateDialogue } from '@/lib/groq';
import type { DialogueMessage, DialogueScenario } from '@/lib/types/learn';

export async function GET() {
  try {
    // Check if table exists/is accessible
    const scenarios = await prisma.dialogueScenario.findMany({
      orderBy: { createdAt: 'desc' },
    }).catch(e => {
      console.error('Prisma DialogueScenario error:', e);
      return []; // Return empty array to trigger mock fallback in frontend
    });
    
    return NextResponse.json(scenarios || []);
  } catch (error: any) {
    console.error('Fetch Scenarios global error:', error);
    return NextResponse.json([], { status: 200 }); // Graceful fallback
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
  } catch (error: any) {
    console.error('Dialogue API error:', error);
    return NextResponse.json({ error: 'Failed to process dialogue interaction' }, { status: 500 });
  }
}
