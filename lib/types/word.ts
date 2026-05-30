import type { Root, Definition, Conjugation, ExampleSentence, Word } from '@prisma/client';

export type EnrichedDefinition = Definition & {
  conjugations: Conjugation[];
  exampleSentences: ExampleSentence[];
};

export type EnrichedRoot = Root & {
  definitions: EnrichedDefinition[];
};

/** VerbConjugator-compatible affix group */
export type AffixGroup = {
  affixPair: string;
  focusType: string;
  conjugations: { tense: string | null; form: string | null }[];
};

/** Definition shape used for display (from either Root or legacy Word) */
export type DisplayDefinition = {
  english: string | null;
  tagalog: string | null;
  dialect: string | null;
  synonyms: string | null;
  source: string | null;
  source_url: string | null;
  affixPair?: string | null;
  focusType?: string | null;
  conjugations?: { tense: string | null; focus: string | null; form: string | null }[];
  exampleSentences?: { bikol: string | null; english: string | null }[];
};

/**
 * Unified display data for WordClientPage.
 * Normalized path passes an EnrichedRoot; legacy path passes a Prisma Word.
 * This type captures all fields accessed in both code paths.
 */
export type WordDisplayData = {
  id: string | number | bigint;
  bikol: string;
  pos: string | null;
  pronunciation: string | null;
  audio_url: string | null;
  etymology: string | null;
  definitions?: DisplayDefinition[];
  // Legacy word fields (only present when isNormalized=false)
  english?: string | null;
  tagalog?: string | null;
  dialect?: string | null;
  synonyms?: string | null;
  source_url?: string | null;
  example_bikol?: string | null;
  example_english?: string | null;
};
