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
  
  if (vowels.includes(normalized[0])) {
    return normalized[0];
  }

  // Find first vowel for CV pattern
  let firstVowelIndex = -1;
  for (let i = 0; i < normalized.length; i++) {
    if (vowels.includes(normalized[i])) {
      firstVowelIndex = i;
      break;
    }
  }

  if (firstVowelIndex !== -1) {
    return normalized.substring(0, firstVowelIndex + 1);
  }

  return normalized[0] || '';
}

/**
 * Applies Mintz's "Vowel Ending Rule": if a base ends in a vowel, 
 * insert 'h' before adding suffixes like -on or -an.
 */
function applyVowelRule(base: string): string {
  const vowels = ['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú'];
  const lastChar = base[base.length - 1];
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
  if (vowels.includes(normalized[0]) && (focusClass === 'ON' || focusClass === 'AN')) {
    object.past = `in${normalized}`;
    object.progressive = `in${r}${normalized}`;
  }

  return { actorFocus: actor, objectFocus: object };
}

