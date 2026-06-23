export type FocusClass = 'ON' | 'I' | 'AN' | 'MAG';

export interface ConjugationForms {
  infinitive: string;
  future: string;
  past: string;
  progressive: string;
}

export interface ConjugationSet {
  actorFocus: ConjugationForms;
  objectFocus: ConjugationForms;
}

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú']);

/** Extracts the first syllable (CV) for reduplication (R-). */
function getReduplication(root: string): string {
  const normalized = root.toLowerCase();
  if (!normalized) return '';

  const firstChar = normalized[0]!;
  if (VOWELS.has(firstChar)) return firstChar;

  const firstVowelIndex = [...normalized].findIndex(ch => VOWELS.has(ch));
  return firstVowelIndex !== -1
    ? normalized.substring(0, firstVowelIndex + 1)
    : firstChar;
}

/** Applies Mintz's "Vowel Ending Rule": inserts 'h' before suffixes if base ends in a vowel. */
function applyVowelRule(base: string): string {
  if (!base) return '';
  return VOWELS.has(base[base.length - 1]!) ? base + 'h' : base;
}

/** Extracts the first vowel for object-focus reduplication. */
function getFirstVowel(root: string): string {
  const normalized = root.toLowerCase();
  for (const char of normalized) {
    if (VOWELS.has(char)) return char;
  }
  return normalized[0] ?? '';
}

/** Generates the full conjugation set for a root and its Mintz FocusClass. */
export function conjugateVerbMintz(root: string, focusClass: FocusClass): ConjugationSet {
  const normalized = root.toLowerCase();
  const r = getReduplication(normalized);
  const baseWithH = applyVowelRule(normalized);
  const first = normalized[0]!;

  const actor: ConjugationForms = {
    infinitive: `mag${normalized}`,
    future: `ma${r}${normalized}`,
    past: `nag${normalized}`,
    progressive: `nag${r}${normalized}`,
  };

  let object: ConjugationForms;

  switch (focusClass) {
    case 'ON': {
      const v = getFirstVowel(normalized);
      object = {
        infinitive: `${baseWithH}on`,
        future: `${r}${baseWithH}on`,
        past: `${first}in${normalized.slice(1)}`,
        progressive: `${first}in${v}${normalized}`,
      };
      break;
    }
    case 'I':
      object = {
        infinitive: `i${normalized}`,
        future: `i${r}${normalized}`,
        past: `ini${normalized}`,
        progressive: `ini${r}${normalized}`,
      };
      break;
    case 'AN': {
      const v = getFirstVowel(normalized);
      object = {
        infinitive: `${baseWithH}an`,
        future: `${r}${baseWithH}an`,
        past: `${first}in${normalized.slice(1)}an`,
        progressive: `${first}in${v}${normalized}an`,
      };
      break;
    }
    case 'MAG':
    default:
      object = { ...actor };
  }

  if (VOWELS.has(first) && (focusClass === 'ON' || focusClass === 'AN')) {
    object.past = `in${normalized}`;
    object.progressive = `in${r}${normalized}`;
  }

  return { actorFocus: actor, objectFocus: object };
}

/** Legacy wrapper for conjugateVerbMintz. */
export function conjugateBikolVerb(root: string, affixPair: string, preferredFocus?: string) {
  const focusClass = mapAffixToFocusClass(affixPair);
  const set = conjugateVerbMintz(root, focusClass);

  const pref = preferredFocus?.toUpperCase();
  const includeActor = !pref || pref === 'ACTOR';
  const includeObject = (!pref || pref === 'OBJECT') && focusClass !== 'MAG';

  const results: { tense: string; focus: string; form: string }[] = [];
  const TENSES: (keyof ConjugationForms)[] = ['infinitive', 'past', 'progressive', 'future'];

  if (includeActor) {
    for (const tense of TENSES) {
      results.push({ tense: tense.charAt(0).toUpperCase() + tense.slice(1), focus: 'Actor', form: set.actorFocus[tense] });
    }
  }
  if (includeObject) {
    for (const tense of TENSES) {
      results.push({ tense: tense.charAt(0).toUpperCase() + tense.slice(1), focus: 'Object', form: set.objectFocus[tense] });
    }
  }

  return results;
}

/** Heuristic to extract the root from a potentially conjugated Bikol verb. */
export function extractRoot(verb: string): string {
  let root = verb.toLowerCase().trim();

  // Remove prefixes
  const prefixes = [
    { p: 'mag', len: 3 }, { p: 'nag', len: 3 },
    { p: 'mang', len: 4 }, { p: 'nang', len: 4 },
    { p: 'ma', len: 2 }, { p: 'na', len: 2 },
  ];
  for (const { p, len } of prefixes) {
    if (root.startsWith(p)) { root = root.slice(len); break; }
  }
  if (root.startsWith('i') && !root.startsWith('in') && root.length > 3) {
    root = root.slice(1);
  }

  // Remove suffixes (-on, -an), accounting for vowel-rule 'h' insertion
  for (const suffix of ['on', 'an']) {
    if (root.endsWith(suffix)) {
      root = root.slice(0, -2);
      const penult = root[root.length - 2]!;
      if (root.endsWith('h') && VOWELS.has(penult)) root = root.slice(0, -1);
      break;
    }
  }

  // Remove infixes (-in-)
  const firstChar = root[0]!;
  if (root.length > 3 && !VOWELS.has(firstChar)) {
    if (root.slice(1, 3) === 'in') root = firstChar + root.slice(3);
  } else if (root.startsWith('in') && root.length > 3) {
    if (root.startsWith('ini') && root.length > 4) {
      root = root.slice(3);
    } else if (VOWELS.has(root[2]!)) {
      root = root.slice(2);
    }
  }

  // Remove reduplication (CV-)
  if (root.length >= 4 && root.slice(2, 4) === root.slice(0, 2)) {
    root = root.slice(2);
  }
  if (root.length >= 2 && VOWELS.has(root[0]!) && root[1] === root[0]) {
    root = root.slice(1);
  }

  return root;
}

/** Maps legacy affix pair strings (e.g., "MAG-, -ON") to Mintz FocusClasses. */
function mapAffixToFocusClass(affixPair: string): FocusClass {
  const upper = affixPair.toUpperCase();
  if (upper.includes('-ON')) return 'ON';
  if (upper.includes('I-') || upper.includes('I+')) return 'I';
  if (upper.includes('-AN')) return 'AN';
  if (upper.includes('MAG-') || upper.includes('MANG-') || upper.includes('MA-')) return 'MAG';
  return 'MAG';
}

