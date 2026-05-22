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

/**
 * Extracts the first syllable (CV) for reduplication (R-).
 * Rule: Reduplicate first vowel if root starts with vowel, 
 * or first consonant + vowel if it starts with consonant.
 */
function getReduplication(root: string): string {
  const vowels = ['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú'];
  const normalized = root.toLowerCase();
  
  if (!normalized) return '';

  const firstChar = normalized[0] || '';
  if (vowels.includes(firstChar)) {
    return firstChar;
  }

  // Find first vowel for CV pattern
  let firstVowelIndex = -1;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i] || '';
    if (vowels.includes(char)) {
      firstVowelIndex = i;
      break;
    }
  }

  if (firstVowelIndex !== -1) {
    return normalized.substring(0, firstVowelIndex + 1);
  }

  return firstChar;
}

/**
 * Applies Mintz's "Vowel Ending Rule": if a base ends in a vowel, 
 * insert 'h' before adding suffixes like -on or -an.
 */
function applyVowelRule(base: string): string {
  if (!base) return '';
  const vowels = ['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú'];
  const lastChar = base[base.length - 1] || '';
  return vowels.includes(lastChar) ? base + 'h' : base;
}

/**
 * Generates the full conjugation set for a root and its Mintz FocusClass.
 * Handles Actor Focus (MAG-) and Object Focus (-on, i-, -an).
 */
export function conjugateVerbMintz(root: string, focusClass: FocusClass): ConjugationSet {
  const normalized = root.toLowerCase();
  const r = getReduplication(normalized);
  const baseWithH = applyVowelRule(normalized);

  // 1. Actor Focus (MAG-)
  const actor: ConjugationForms = {
    infinitive: `mag${normalized}`,
    future: `ma${r}${normalized}`,
    past: `nag${normalized}`,
    progressive: `nag${r}${normalized}`
  };

  // 2. Object Focus
  let object: ConjugationForms;

  switch (focusClass) {
    case 'ON':
      object = {
        infinitive: `${baseWithH}on`,
        future: `${r}${baseWithH}on`,
        past: `${normalized[0]}in${normalized.substring(1)}`,
        progressive: `${normalized[0]}in${r}${normalized.substring(1)}`
      };
      break;
    case 'I':
      object = {
        infinitive: `i${normalized}`,
        future: `i${r}${normalized}`,
        past: `ini${normalized}`,
        progressive: `ini${r}${normalized}`
      };
      break;
    case 'AN':
      object = {
        infinitive: `${baseWithH}an`,
        future: `${r}${baseWithH}an`,
        past: `${normalized[0]}in${normalized.substring(1)}an`,
        progressive: `${normalized[0]}in${r}${normalized.substring(1)}an`
      };
      break;
    case 'MAG':
    default:
      // For purely intransitive, object focus is identical to actor or empty
      object = { ...actor };
  }

  // Special case for vowel-starting roots in past/progressive infixation
  const vowels = ['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú'];
  const firstChar = normalized[0] || '';
  if (vowels.includes(firstChar) && (focusClass === 'ON' || focusClass === 'AN')) {
    object.past = `in${normalized}`;
    object.progressive = `in${r}${normalized}`;
  }

  return { actorFocus: actor, objectFocus: object };
}

/**
 * Legacy wrapper for conjugateVerbMintz to maintain compatibility with 
 * existing call sites while leveraging the new Mintz-based logic.
 */
export function conjugateBikolVerb(root: string, affixPair: string, preferredFocus?: string) {
  const focusClass = mapAffixToFocusClass(affixPair);
  const set = conjugateVerbMintz(root, focusClass);

  const results: { tense: string; focus: string; form: string }[] = [];

  // Determine which focus to include. 
  // If no preference is given, we include both to allow the UI to decide.
  const isActorPref = preferredFocus?.toUpperCase() === 'ACTOR';
  const isObjectPref = preferredFocus?.toUpperCase() === 'OBJECT';
  
  const includeActor = !preferredFocus || isActorPref;
  const includeObject = (!preferredFocus || isObjectPref) && focusClass !== 'MAG';

  if (includeActor) {
    results.push({ tense: 'Infinitive', focus: 'Actor', form: set.actorFocus.infinitive });
    results.push({ tense: 'Past', focus: 'Actor', form: set.actorFocus.past });
    results.push({ tense: 'Progressive', focus: 'Actor', form: set.actorFocus.progressive });
    results.push({ tense: 'Future', focus: 'Actor', form: set.actorFocus.future });
  }

  if (includeObject) {
    results.push({ tense: 'Infinitive', focus: 'Object', form: set.objectFocus.infinitive });
    results.push({ tense: 'Past', focus: 'Object', form: set.objectFocus.past });
    results.push({ tense: 'Progressive', focus: 'Object', form: set.objectFocus.progressive });
    results.push({ tense: 'Future', focus: 'Object', form: set.objectFocus.future });
  }

  return results;
}

/**
 * Heuristic to extract the root from a potentially conjugated Bikol verb.
 * This is the inverse of the conjugation rules.
 */
export function extractRoot(verb: string): string {
  let root = verb.toLowerCase().trim();
  const vowels = ['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú'];

  // 1. Remove common prefixes (mag-, nag-, ma-, na-, mang-, nang-, i-)
  if (root.startsWith('mag')) root = root.substring(3);
  else if (root.startsWith('nag')) root = root.substring(3);
  else if (root.startsWith('mang')) root = root.substring(4);
  else if (root.startsWith('nang')) root = root.substring(4);
  else if (root.startsWith('ma')) root = root.substring(2);
  else if (root.startsWith('na')) root = root.substring(2);
  else if (root.startsWith('i') && root.length > 3) root = root.substring(1);

  // 2. Remove suffixes (-on, -an)
  // Note: if word ends in vowel, 'h' might have been inserted.
  if (root.endsWith('on')) {
    root = root.substring(0, root.length - 2);
    if (root.endsWith('h') && vowels.includes(root[root.length - 2])) {
      root = root.substring(0, root.length - 1);
    }
  } else if (root.endsWith('an')) {
    root = root.substring(0, root.length - 2);
    if (root.endsWith('h') && vowels.includes(root[root.length - 2])) {
      root = root.substring(0, root.length - 1);
    }
  }

  // 3. Remove infixes (-in-)
  // Infixes occur after the first consonant
  if (root.length > 3 && !vowels.includes(root[0])) {
    if (root.substring(1, 3) === 'in') {
      root = root[0] + root.substring(3);
    }
  } else if (root.startsWith('in') && root.length > 2 && vowels.includes(root[2])) {
    // If root starts with vowel, infix becomes prefix 'in-'
    root = root.substring(2);
  }

  // 4. Remove reduplication (CV-)
  // If first 2 chars match next 2 chars, it might be reduplication (e.g., babakal -> bakal)
  if (root.length >= 4) {
    const cv = root.substring(0, 2);
    if (root.substring(2, 4) === cv) {
      root = root.substring(2);
    }
  }
  // Vowel reduplication (e.g., aalis -> alis)
  if (root.length >= 2 && vowels.includes(root[0]) && root[1] === root[0]) {
    root = root.substring(1);
  }

  return root;
}

/**
 * Maps legacy affix pair strings (e.g., "MAG-, -ON") to Mintz FocusClasses.
 */
function mapAffixToFocusClass(affixPair: string): FocusClass {
  const upper = affixPair.toUpperCase();
  if (upper.includes('-ON')) return 'ON';
  if (upper.includes('I-') || upper.includes('I+')) return 'I';
  if (upper.includes('-AN')) return 'AN';
  if (upper.includes('MAG-') || upper.includes('MANG-') || upper.includes('MA-')) return 'MAG';
  return 'MAG'; // Fallback
}

