const POS_MAP: Record<string, string> = {
  // Full forms
  verb: 'Verb',
  noun: 'Noun',
  adjective: 'Adjective',
  adverb: 'Adverb',
  pronoun: 'Pronoun',
  preposition: 'Preposition',
  conjunction: 'Conjunction',
  interjection: 'Interjection',
  numeral: 'Numeral',
  particle: 'Particle',
  determiner: 'Determiner',
  article: 'Article',
  prefix: 'Prefix',
  suffix: 'Suffix',
  affix: 'Affix',
  root: 'Root',
  phrase: 'Phrase',
  expression: 'Expression',
  idiom: 'Idiom',
  proverb: 'Proverb',
  classifier: 'Classifier',
  linker: 'Linker',
  marker: 'Marker',

  // Abbreviated forms
  adj: 'Adjective',
  adv: 'Adverb',
  pron: 'Pronoun',
  prep: 'Preposition',
  conj: 'Conjunction',
  interj: 'Interjection',
  num: 'Numeral',
  part: 'Particle',
  det: 'Determiner',
  art: 'Article',
};

export function normalizePOS(pos: string | null | undefined): string {
  if (!pos) return '';

  const trimmed = pos.trim().toLowerCase().replace(/\.$/, '');

  if (POS_MAP[trimmed]) return POS_MAP[trimmed]!;

  const withoutDot = trimmed.replace(/\./g, '');
  if (POS_MAP[withoutDot]) return POS_MAP[withoutDot]!;

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function normalizeDefinitionText(text: string | null | undefined): string {
  if (!text) return '';

  let result = text.trim();

  if (!result) return '';

  result = result.replace(/^to\s+/i, '');
  result = result.charAt(0).toUpperCase() + result.slice(1);

  return result;
}

export function formatDialect(dialect: string | null | undefined): string {
  if (!dialect) return '';

  const trimmed = dialect.trim();

  const lower = trimmed.toLowerCase();
  if (lower === 'general' || lower === 'unknown' || lower === 'unspecified') return '';
  return trimmed;
}

export type LanguageMode = 'en' | 'tl' | 'all';

export function displayTranslation(
  item: { english: string | null; tagalog?: string | null },
  langMode: LanguageMode
): string {
  return langMode === 'tl' && item.tagalog ? item.tagalog : item.english ?? '';
}

