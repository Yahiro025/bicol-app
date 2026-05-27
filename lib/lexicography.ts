/**
 * Lexicography Utilities
 *
 * Normalizes dictionary display conventions for:
 * - Part of Speech (POS) labels
 * - Definition text formatting
 * - Dialect labels
 */

// ─── POS Normalization ────────────────────────────────────────────────────────

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

/**
 * Normalizes a raw POS string from the database into a proper
 * lexicographic label (e.g., "VERB" → "Verb", "adj." → "Adjective").
 * Returns an empty string if the value is null/empty.
 */
export function normalizePOS(pos: string | null | undefined): string {
  if (!pos) return '';

  const trimmed = pos.trim().toLowerCase().replace(/\.$/, '');

  // Direct match in map
  if (POS_MAP[trimmed]) return POS_MAP[trimmed]!;

  // Handle "v." / "n." etc.
  const withoutDot = trimmed.replace(/\./g, '');
  if (POS_MAP[withoutDot]) return POS_MAP[withoutDot]!;

  // Fallback: capitalize first letter only
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

// ─── Definition Text Formatting ───────────────────────────────────────────────

/**
 * Normalizes definition text for display:
 * - Trims whitespace
 * - Capitalizes first letter
 * - Removes redundant leading "to " for verb definitions (normalizes "to buy" → "buy")
 * - Removes trailing punctuation for consistency
 */
export function normalizeDefinitionText(text: string | null | undefined): string {
  if (!text) return '';

  let result = text.trim();

  if (!result) return '';

  // Normalize verb infinitive marker: strip leading "to " or "To "
  // for cleaner lexicographic display (e.g., "to purchase; to buy" → "Purchase; buy")
  result = result.replace(/^to\s+/i, '');

  // Capitalize first letter
  result = result.charAt(0).toUpperCase() + result.slice(1);

  return result;
}

// ─── Dialect Formatting ───────────────────────────────────────────────────────

/**
 * Formats a dialect label for display.
 * Returns empty string for null/empty/unknown values (no misleading "General").
 */
export function formatDialect(dialect: string | null | undefined): string {
  if (!dialect) return '';

  const trimmed = dialect.trim();

  // Don't show "General" or "Unknown" as standalone dialect labels
  const lower = trimmed.toLowerCase();
  if (lower === 'general' || lower === 'unknown' || lower === 'unspecified') {
    return '';
  }

  return trimmed;
}


