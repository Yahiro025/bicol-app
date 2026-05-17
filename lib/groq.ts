import Groq from 'groq-sdk';
import type { Word, QuizQuestion } from './types/learn';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = 'qwen-2.5-32b';

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
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates high-quality linguistic quiz questions in JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: MODEL,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
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
