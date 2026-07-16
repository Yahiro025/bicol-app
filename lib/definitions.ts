import type { DisplayDefinition } from '@/lib/types/word';

/**
 * Groups redundant definition rows that share the same english gloss into a
 * single display entry, so that grammatical `series` variants (e.g. the same
 * "Verbal affix, infinitive or command" stored once per LOCATIVE / REFLEXIVE /
 * REGULAR_VERB series) render as ONE definition with ONE source badge instead
 * of several near-duplicate numbered entries.
 *
 * This is a non-destructive, display-layer transform: it never mutates or
 * deletes database rows. Distinct meanings are always preserved. Example
 * sentences from merged variants are combined and de-duplicated so the USAGE
 * panel keeps every available example.
 */

function normalizeEnglishKey(text: string | null | undefined): string | null {
  if (text == null) return null;
  const trimmed = text.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

function mergeExampleSentences(
  a: NonNullable<DisplayDefinition['exampleSentences']>,
  b: NonNullable<DisplayDefinition['exampleSentences']>,
): NonNullable<DisplayDefinition['exampleSentences']> {
  const seen = new Set<string>();
  const out: NonNullable<DisplayDefinition['exampleSentences']> = [];
  for (const ex of [...a, ...b]) {
    const key = `${ex.bikol ?? ''}\u0000${ex.english ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(ex);
  }
  return out;
}

export function groupDefinitions(definitions: DisplayDefinition[]): DisplayDefinition[] {
  const order: string[] = [];
  const groups = new Map<string, DisplayDefinition>();
  let nullCounter = 0;

  for (const def of definitions) {
    const key = normalizeEnglishKey(def.english);
    // Entries without a usable english gloss are kept individually (never
    // collapsed with each other), since we cannot prove they are duplicates.
    const mapKey = key === null ? `__empty_${nullCounter++}` : `en:${key}`;

    const existing = groups.get(mapKey);
    if (!existing) {
      groups.set(mapKey, {
        ...def,
        exampleSentences: [...(def.exampleSentences ?? [])],
        conjugations: def.conjugations ? [...def.conjugations] : def.conjugations,
      });
      order.push(mapKey);
      continue;
    }

    // Merge this redundant variant into the existing grouped definition.
    existing.exampleSentences = mergeExampleSentences(
      existing.exampleSentences ?? [],
      def.exampleSentences ?? [],
    );
    if (def.conjugations && def.conjugations.length > 0) {
      existing.conjugations = [...(existing.conjugations ?? []), ...def.conjugations];
    }
    // Prefer the first non-null value for scalar fields.
    existing.tagalog = existing.tagalog ?? def.tagalog ?? null;
    existing.dialect = existing.dialect ?? def.dialect ?? null;
    existing.synonyms = existing.synonyms ?? def.synonyms ?? null;
    existing.source = existing.source ?? def.source ?? null;
    existing.source_url = existing.source_url ?? def.source_url ?? null;
    if (!existing.affixPair || existing.affixPair === 'UNKNOWN') {
      existing.affixPair = def.affixPair ?? existing.affixPair;
    }
    if (!existing.focusType || existing.focusType === 'UNKNOWN') {
      existing.focusType = def.focusType ?? existing.focusType;
    }
  }

  return order.map((k) => groups.get(k)!);
}
