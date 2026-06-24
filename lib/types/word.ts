import type { Root, Definition, Conjugation, ExampleSentence } from '@prisma/client';

export type EnrichedDefinition = Definition & {
  conjugations: Conjugation[];
  exampleSentences: ExampleSentence[];
};

export type EnrichedRoot = Root & {
  definitions: EnrichedDefinition[];
};

export type AffixGroup = {
  affixPair: string;
  focusType: string;
  conjugations: { tense: string | null; form: string | null }[];
};

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

export type WordDisplayData = {
  id: string | number | bigint;
  bikol: string;
  pos: string | null;
  pronunciation: string | null;
  audio_url: string | null;
  etymology: string | null;
  definitions?: DisplayDefinition[];
  // Legacy fields (only present when isNormalized=false)
  english?: string | null;
  tagalog?: string | null;
  dialect?: string | null;
  synonyms?: string | null;
  source_url?: string | null;
  example_bikol?: string | null;
  example_english?: string | null;
};
