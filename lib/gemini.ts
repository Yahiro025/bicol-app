import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { Schema } from '@google/generative-ai';
import type { Word, QuizQuestion, DialogueMessage, DialogueScenario, LinguisticAudit } from './types/learn';

function getGemini(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is missing. Please set it in your environment variables.');
  return new GoogleGenerativeAI(key);
}

// Fallback strategy: Primary -> Lighter fallback (for rate limits) -> Heavy fallback (for complex tasks)
const MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b', 
  'gemini-1.5-pro'
];

async function callGemini<T>(prompt: string, schema: Schema, systemInstruction?: string, label: string = 'Gemini Call'): Promise<T> {
  const genAI = getGemini();

  let lastError: unknown;
  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.1,
        },
        ...(systemInstruction ? { systemInstruction } : {})
      });

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      if (!responseText) throw new Error(`Empty response from ${modelName}`);
      
      return JSON.parse(responseText) as T;
      
    } catch (error: any) {
      console.warn(`[Gemini] ${label} failed with model ${modelName}:`, error?.message || error);
      lastError = error;
      
      // If the error is a 429 Rate Limit, we immediately try the next model in the fallback chain.
      // If it's another type of error, we might still want to try the fallback models.
    }
  }

  console.error(`[Gemini] All models exhausted for ${label}. Last error:`, lastError);
  throw lastError;
}

export async function generateQuizQuestions(words: Word[]): Promise<QuizQuestion[]> {
  const prompt = `Generate a quiz with 10 multiple-choice questions based on the provided list of Bikol words.

WORDS:
${words.map(w => `- ${w.bikol}: ${w.english} (${w.pos}, ${w.category})`).join('\n')}

REQUIREMENTS:
1. Return ONLY a JSON object with a "questions" array.
2. Each question must test the meaning or usage of one of the provided words.
3. Include 4 options per question.
4. Options must be semantically plausible but incorrect (distractors).
5. The response must be valid JSON.
6. Output STRICTLY in Bikol. Do NOT mix Tagalog/English.`;

  const schema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
      questions: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            id: { type: SchemaType.STRING },
            question: { type: SchemaType.STRING },
            options: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Must contain exactly 4 options"
            },
            correctAnswer: { type: SchemaType.STRING },
            explanation: { type: SchemaType.STRING },
            word: { type: SchemaType.STRING },
          },
          required: ["id", "question", "options", "correctAnswer", "explanation", "word"]
        }
      }
    },
    required: ["questions"]
  };

  const data = await callGemini<{ questions: QuizQuestion[] }>(
    prompt,
    schema,
    'You are a helpful assistant that generates high-quality linguistic quiz questions in JSON format. Output STRICTLY in Bikol.',
    'generate quiz from Gemini'
  );
  return data.questions;
}

export async function generateSubstitutionDrill(sentence: string): Promise<any> {
  const prompt = `Given this base Bikol sentence: '${sentence}', generate 3 substitution cues (single Bikol nouns). For each cue, provide the full Bikol sentence where a grammatically appropriate word from the base sentence is replaced by the cue, ensuring the rest of the sentence remains natural. Return as JSON with keys 'cues' (array of objects with 'cue' and 'expected' properties). Output STRICTLY in Bikol. Do NOT mix Tagalog/English.`;

  const schema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
      cues: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            cue: { type: SchemaType.STRING, description: "A single Bikol noun to substitute into the sentence" },
            expected: { type: SchemaType.STRING, description: "The full grammatically correct Bikol sentence after substitution" }
          },
          required: ["cue", "expected"]
        }
      }
    },
    required: ["cues"]
  };

  return callGemini<any>(
    prompt,
    schema,
    'You are a Bicolano language expert. Generate natural, grammatically correct Bikol sentences. Maintain a formal and dignified tone, strictly avoiding slang or mixing with Tagalog/English.',
    'generate drills from Gemini'
  );
}

export async function processDialogue(
  scenario: DialogueScenario,
  messages: DialogueMessage[]
): Promise<{ message: string; goalAchieved: boolean }> {
  const transcript = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
  const prompt = `SCENARIO: ${scenario.title}
DESCRIPTION: ${scenario.description}
GOAL: ${scenario.goal}
VOCABULARY TO ENCOURAGE: ${scenario.vocabulary.join(', ')}

TRANSCRIPT SO FAR:
${transcript}

Based on the transcript, respond as the ASSISTANT. Assess if the user has achieved the GOAL.`;

  const schema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
      message: { type: SchemaType.STRING, description: "Your response in Bikol" },
      goalAchieved: { type: SchemaType.BOOLEAN, description: "True if the user has achieved the scenario's goal" }
    },
    required: ["message", "goalAchieved"]
  };

  return callGemini(
    prompt,
    schema,
    `You are a patient and fluent speaker of Central Bikol. We are participating in a conversation practice.
CONSTRAINTS:
1. Respond naturally in Central Bikol. Use a formal and dignified tone.
2. Do NOT offer grammatical corrections or translations during the flow of conversation.
3. If the user makes a mistake that prevents comprehension, ask for clarification in Bikol.
4. Keep your responses concise and functional, as if you are the other person in the scenario.`,
    'process dialogue'
  );
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
3. PARTICLES: Were the case markers and particles (e.g., si, ni, ki, nin) used appropriately?`;

  const schema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
      comprehension: { type: SchemaType.STRING },
      focus: { type: SchemaType.STRING },
      particles: { type: SchemaType.STRING },
      score: { type: SchemaType.NUMBER, description: "A score from 1-100" }
    },
    required: ["comprehension", "focus", "particles", "score"]
  };

  return callGemini(
    prompt,
    schema,
    'You are a Bicolano Lexicographer and Language Tutor. Provide critical but constructive feedback.',
    'evaluate dialogue'
  );
}
