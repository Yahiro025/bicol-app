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

export type LearnMode = 'quiz' | 'flashcards' | 'drill';

export type SubstitutionDrill = {
  id: string;
  baseSentence: string;
  cue: string;
  expectedAnswer: string;
  explanation?: string;
};

export type DialogueMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
};

export type DialogueScenario = {
  id: string;
  title: string;
  description: string;
  goal: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  visualCue: string; // Icon name from lucide-react
  vocabulary: string[]; // Specific words to encourage using
};

export type DialogueSession = {
  id: string;
  scenarioId: string;
  messages: DialogueMessage[];
  status: 'active' | 'completed';
  goalAchieved: boolean;
};

export type LinguisticAudit = {
  comprehension: string;
  focus: string;
  particles: string;
  score: number; // 1-100
};

export type QuizSession = {
  questions: QuizQuestion[];
};

export type FlashcardSession = {
  words: Word[];
};
