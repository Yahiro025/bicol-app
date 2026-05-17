export type Word = {
  bikol: string;
  english: string;
  tagalog?: string | null;
  pos?: string | null;
  category?: string | null;
  example_bikol?: string | null;
  example_english?: string | null;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  word: string; // The Bikol word being tested
};

export type LearnMode = 'quiz' | 'flashcards';

export type QuizSession = {
  questions: QuizQuestion[];
};

export type FlashcardSession = {
  words: Word[];
};
