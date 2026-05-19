import Groq from 'groq-sdk';
import type { Word, QuizQuestion } from './types/learn';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// GLOBAL MANDATE: Use qwen-3-32b and handle RateLimitError
const MODEL = 'qwen-3-32b';

/**
 * Executes a Groq completion with retry logic and rate limit respect.
 */
async function getCompletion(messages: any[], jsonMode: boolean = true) {
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      // Respect 30 RPM limit: 2s delay between calls
      if (attempts > 0) await new Promise(resolve => setTimeout(resolve, 2000));

      const completion = await groq.chat.completions.create({
        messages,
        model: MODEL,
        response_format: jsonMode ? { type: 'json_object' } : undefined,
        temperature: 0.1,
      });

      return completion.choices[0]?.message?.content;
    } catch (error: any) {
      attempts++;
      const isRateLimit = error?.status === 429 || error?.name === 'RateLimitError';
      
      if (isRateLimit && attempts < maxAttempts) {
        console.warn(`[Groq] Rate limit hit, retrying in 5s... (Attempt ${attempts}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }
      throw error;
    }
  }
}

export async function generateQuizQuestions(words: Word[]): Promise<QuizQuestion[]> {
  const prompt = `
    You are a Bicolano language expert. Generate a quiz with 10 multiple-choice questions based on the provided list of Bikol words.
    
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
        {
          "id": "string",
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string",
          "word": "string"
        }
      ]
    }
  `;

  try {
    const content = await getCompletion([
      {
        role: 'system',
        content: 'You are a helpful assistant that generates high-quality linguistic quiz questions in JSON format. Output STRICTLY in Bikol.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);

    if (!content) {
      throw new Error('Failed to generate content from Groq');
    }

    const parsed = JSON.parse(content);
    return parsed.questions;
  } catch (error) {
    console.error('Groq generation error:', error);
    throw error;
  }
}

export async function generateSubstitutionDrill(sentence: string) {
  const prompt = `Given this base Bikol sentence: '${sentence}', generate 3 substitution cues (single Bikol nouns). For each cue, provide the full Bikol sentence where a grammatically appropriate word from the base sentence is replaced by the cue, ensuring the rest of the sentence remains natural. Return as JSON with keys 'cues' (array of objects with 'cue' and 'expected' properties). Output STRICTLY in Bikol. Do NOT mix Tagalog/English.`;

  try {
    const content = await getCompletion([
      {
        role: 'system',
        content: 'You are a Bicolano language expert. Generate natural, grammatically correct Bikol sentences. Maintain a formal and dignified tone, strictly avoiding slang or mixing with Tagalog/English. Output ONLY valid JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);

    if (!content) {
      throw new Error('Failed to generate drills from Groq');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Substitution Drill generation error:', error);
    throw error;
  }
}
