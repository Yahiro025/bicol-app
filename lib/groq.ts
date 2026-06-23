import Groq from 'groq-sdk';
import type { Word, QuizQuestion, DialogueMessage, DialogueScenario, LinguisticAudit } from './types/learn';

function getGroq(): Groq {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY is missing.');
  return new Groq({ apiKey: key });
}

const MODEL = 'qwen-3-32b';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

async function getCompletion(messages: ChatMessage[], jsonMode = true) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (attempt > 1) await new Promise(r => setTimeout(r, 2000));
      const completion = await getGroq().chat.completions.create({
        messages,
        model: MODEL,
        response_format: jsonMode ? { type: 'json_object' } : undefined,
        temperature: 0.1,
      });
      return completion.choices[0]?.message?.content;
    } catch (error: unknown) {
      const status = (error as { status?: number })?.status;
      const isRateLimit = status === 429 || (error as { name?: string })?.name === 'RateLimitError';
      if (isRateLimit && attempt < 3) {
        console.warn(`[Groq] Rate limit hit, retrying in 5s... (${attempt}/3)`);
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }
      throw error;
    }
  }
}

async function callGroq<T>(messages: ChatMessage[], label: string): Promise<T> {
  try {
    const content = await getCompletion(messages);
    if (!content) throw new Error(`Failed to ${label}`);
    return JSON.parse(content);
  } catch (err) {
    console.error(`[Groq] ${label}:`, err);
    throw err;
  }
}

export async function generateQuizQuestions(words: Word[]): Promise<QuizQuestion[]> {
  const prompt = `You are a Bicolano language expert. Generate a quiz with 10 multiple-choice questions based on the provided list of Bikol words.

WORDS:
${words.map(w => `- ${w.bikol}: ${w.english} (${w.pos}, ${w.category})`).join('\n')}

REQUIREMENTS:
1. Return ONLY a JSON object with a "questions" array.
2. Each question must test the meaning or usage of one of the provided words.
3. Include 4 options per question.
4. Options must be semantically plausible but incorrect (distractors).
5. The response must be valid JSON.
6. Output STRICTLY in Bikol. Do NOT mix Tagalog/English.

JSON SCHEMA:
{
  "questions": [
    { "id": "string", "question": "string", "options": ["string", "string", "string", "string"], "correctAnswer": "string", "explanation": "string", "word": "string" }
  ]
}`;

  const data = await callGroq<{ questions: QuizQuestion[] }>([
    { role: 'system', content: 'You are a helpful assistant that generates high-quality linguistic quiz questions in JSON format. Output STRICTLY in Bikol.' },
    { role: 'user', content: prompt },
  ], 'generate quiz from Groq');
  return data.questions;
}

export async function generateSubstitutionDrill(sentence: string): Promise<any> {
  const prompt = `Given this base Bikol sentence: '${sentence}', generate 3 substitution cues (single Bikol nouns). For each cue, provide the full Bikol sentence where a grammatically appropriate word from the base sentence is replaced by the cue, ensuring the rest of the sentence remains natural. Return as JSON with keys 'cues' (array of objects with 'cue' and 'expected' properties). Output STRICTLY in Bikol. Do NOT mix Tagalog/English.`;

  return callGroq<any>([
    { role: 'system', content: 'You are a Bicolano language expert. Generate natural, grammatically correct Bikol sentences. Maintain a formal and dignified tone, strictly avoiding slang or mixing with Tagalog/English. Output ONLY valid JSON.' },
    { role: 'user', content: prompt },
  ], 'generate drills from Groq');
}

export async function processDialogue(
  scenario: DialogueScenario,
  messages: DialogueMessage[]
): Promise<{ message: string; goalAchieved: boolean }> {
  const systemPrompt = `You are a patient and fluent speaker of Central Bikol. We are participating in a conversation practice.

SCENARIO: ${scenario.title}
DESCRIPTION: ${scenario.description}
GOAL: ${scenario.goal}
VOCABULARY TO ENCOURAGE: ${scenario.vocabulary.join(', ')}

CONSTRAINTS:
1. Respond naturally in Central Bikol. Use a formal and dignified tone.
2. Do NOT offer grammatical corrections or translations during the flow of conversation.
3. If the user makes a mistake that prevents comprehension, ask for clarification in Bikol.
4. Keep your responses concise and functional, as if you are the other person in the scenario.
5. Assess if the user has achieved the GOAL.

Output JSON format: { "message": "Your response in Bikol", "goalAchieved": boolean }`;

  return callGroq([
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role as ChatMessage['role'], content: m.content })),
  ], 'process dialogue');
}

export async function evaluateDialogue(
  scenario: DialogueScenario,
  messages: DialogueMessage[]
): Promise<LinguisticAudit> {
  const prompt = `Perform a 'Linguistic Audit' on the following Bikol dialogue session.

SCENARIO: ${scenario.title}
GOAL: ${scenario.goal}

TRANSCRIPT:
${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

CRITERIA:
1. COMPREHENSION: Was the intended message successfully conveyed?
2. FOCUS: Did the user correctly use Bikol focus affixes (e.g., Mag-, -on, -an) based on Mintz's grammar?
3. PARTICLES: Were the case markers and particles (e.g., si, ni, ki, nin) used appropriately?

Return a detailed JSON report with a score from 1-100.
JSON SCHEMA: { "comprehension": "string", "focus": "string", "particles": "string", "score": number }`;

  return callGroq([
    { role: 'system', content: 'You are a Bicolano Lexicographer and Language Tutor. Provide critical but constructive feedback.' },
    { role: 'user', content: prompt },
  ], 'evaluate dialogue');
}
