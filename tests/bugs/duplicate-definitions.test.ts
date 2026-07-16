/**
 * Reproduction test: Duplicate/redundant definitions for word entries.
 *
 * Reported bug (word "-an" and other headwords):
 *   - Multiple numbered definition entries share byte-identical english text
 *     (e.g. "Verbal affix, infinitive or command" appears 3x, differing only by
 *     the `series` grammatical discriminator: LOCATIVE / REFLEXIVE / REGULAR_VERB).
 *   - Each renders as a fully separate numbered meaning with its own repeated
 *     "Mintz Dictionary" source badge, never grouped or deduplicated.
 *
 * Confirmed root cause (see investigation): the `definitions` table legitimately
 * stores series variants as separate rows, but the word page renders one block +
 * one badge per row with NO grouping. The desired outcome (per the bug report) is
 * that variants sharing the same english gloss are GROUPED as one definition.
 *
 * Corrective logic under test: `groupDefinitions()` collapses definitions that
 * share the same (normalized) english text into a single display entry, merging
 * their example sentences, WITHOUT deleting any legitimate distinct meaning.
 *
 * This is a non-destructive, display-layer fix. It touches no database rows.
 *
 * Test data mirrors the real DB state of "-an" confirmed during investigation.
 */
import { describe, test, expect } from 'bun:test';
import { groupDefinitions } from '../../lib/definitions';
import type { DisplayDefinition } from '../../lib/types/word';

// Real "-an" definition rows (english + source), as confirmed in the live DB.
const AN_DEFINITIONS: DisplayDefinition[] = [
  { english: 'Verbal affix, infinitive or command', tagalog: null, dialect: null, synonyms: null, source: 'mintz_book', source_url: null, exampleSentences: [] }, // series LOCATIVE
  { english: 'Verbal affix, infinitive or command', tagalog: null, dialect: null, synonyms: null, source: 'mintz_book', source_url: null, exampleSentences: [] }, // series REFLEXIVE
  { english: 'Alternant command suffix for verbs taking i- in the infinitive', tagalog: null, dialect: null, synonyms: null, source: 'mintz_book', source_url: null, exampleSentences: [] }, // REGULAR
  { english: 'Nominal affix, locative', tagalog: null, dialect: null, synonyms: null, source: 'mintz_book', source_url: null, exampleSentences: [] }, // REGULAR
  { english: 'Verbal affix, infinitive or command', tagalog: null, dialect: null, synonyms: null, source: 'mintz_book', source_url: null, exampleSentences: [] }, // series REGULAR_VERB
];

describe('groupDefinitions: duplicate/redundant definition grouping', () => {
  test('"-an" collapses 5 rows (3 identical + 2 distinct) into 3 grouped definitions', () => {
    const grouped = groupDefinitions(AN_DEFINITIONS);
    expect(grouped.length).toBe(3);
  });

  test('the three identical "Verbal affix, infinitive or command" rows become exactly one entry', () => {
    const grouped = groupDefinitions(AN_DEFINITIONS);
    const verbal = grouped.filter((d) => d.english === 'Verbal affix, infinitive or command');
    expect(verbal.length).toBe(1);
  });

  test('legitimate distinct meanings are retained (never deleted)', () => {
    const grouped = groupDefinitions(AN_DEFINITIONS);
    const englishes = grouped.map((d) => d.english);
    expect(englishes).toContain('Verbal affix, infinitive or command');
    expect(englishes).toContain('Alternant command suffix for verbs taking i- in the infinitive');
    expect(englishes).toContain('Nominal affix, locative');
  });

  test('grouping is case- and whitespace-insensitive on the english gloss', () => {
    const withVariants: DisplayDefinition[] = [
      { english: 'Verbal affix, infinitive or command', tagalog: null, dialect: null, synonyms: null, source: 'mintz_book', source_url: null, exampleSentences: [] },
      { english: '  verbal affix, infinitive or command ', tagalog: null, dialect: null, synonyms: null, source: 'mintz_book', source_url: null, exampleSentences: [] },
    ];
    expect(groupDefinitions(withVariants).length).toBe(1);
  });

  test('example sentences from merged variants are preserved (deduplicated)', () => {
    const withExamples: DisplayDefinition[] = [
      { english: 'x', tagalog: null, dialect: null, synonyms: null, source: 'mintz_book', source_url: null, exampleSentences: [{ bikol: 'A', english: 'a' }] },
      { english: 'x', tagalog: null, dialect: null, synonyms: null, source: 'mintz_book', source_url: null, exampleSentences: [{ bikol: 'B', english: 'b' }, { bikol: 'A', english: 'a' }] },
    ];
    const grouped = groupDefinitions(withExamples);
    expect(grouped.length).toBe(1);
    expect(grouped[0]!.exampleSentences!.length).toBe(2); // A + B, "A" not duplicated
  });

  test('distinct-meaning definitions are never merged together', () => {
    const distinct: DisplayDefinition[] = [
      { english: 'dog', tagalog: null, dialect: null, synonyms: null, source: 'mintz_book', source_url: null, exampleSentences: [] },
      { english: 'cat', tagalog: null, dialect: null, synonyms: null, source: 'wiktionary', source_url: null, exampleSentences: [] },
    ];
    expect(groupDefinitions(distinct).length).toBe(2);
  });

  test('empty/null english entries are preserved individually (not collapsed together)', () => {
    const empties: DisplayDefinition[] = [
      { english: null, tagalog: null, dialect: null, synonyms: null, source: 'mintz_book', source_url: null, exampleSentences: [] },
      { english: '', tagalog: null, dialect: null, synonyms: null, source: 'mintz_book', source_url: null, exampleSentences: [] },
    ];
    expect(groupDefinitions(empties).length).toBe(2);
  });
});
