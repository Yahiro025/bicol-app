export interface ConjugationResult {
  tense: string;
  focus: string;
  form: string;
}

/**
 * Extracts the first CV (Consonant-Vowel) pattern for reduplication.
 * Handling cases like: 
 * 'bakal' -> 'ba'
 * 'abot' -> 'a'
 * 'trabaho' -> 'ta' (Standard Bikol reduplication often drops the second consonant in a cluster)
 */
function getReduplication(root: string): string {
  if (!root) return '';
  const normalized = root.toLowerCase();
  const vowels = ['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú'];
  
  // If starts with vowel, reduplicate just the vowel
  const firstChar = normalized[0];
  if (firstChar && vowels.includes(firstChar)) {
    return firstChar;
  }

  // Find the first vowel to capture the CV pattern
  let firstVowelIndex = -1;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    if (char && vowels.includes(char)) {
      firstVowelIndex = i;
      break;
    }
  }

  if (firstVowelIndex !== -1) {
    // Return the first consonant and the first vowel
    // For clusters like 'tr', it takes the 't' and the first vowel
    return (normalized[0] || '') + (normalized[firstVowelIndex] || '');
  }

  return normalized[0] || '';
}

/**
 * Conjugates a Bikol verb based on the root and affix pair.
 * Supports a robust set of affixes including compound causative, potential,
 * participatory, and regular sets (e.g. MAG+PA-, MAKA-, MAKI-, MANG-, MA-, -ON, I-).
 */
export function conjugateBikolVerb(root: string, affixPair: string, preferredFocus?: string): ConjugationResult[] {
  const normalizedRoot = root.toLowerCase().trim();
  const parts = affixPair.toUpperCase().split(',').map(p => p.trim().replace(/\s/g, ''));
  const r = getReduplication(normalizedRoot);
  const results: ConjugationResult[] = [];

  const vowels = ['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú'];
  const lastChar = normalizedRoot[normalizedRoot.length - 1];
  const isVowelEnding = lastChar ? vowels.includes(lastChar) : false;

  for (const part of parts) {
    // 1. Causative Actor Focus (MAG+PA- or MAGPA-)
    if (part.startsWith('MAG+PA') || part.startsWith('MAGPA')) {
      results.push(
        { tense: 'Infinitive', focus: 'ACTOR', form: `magpa${normalizedRoot}` },
        { tense: 'Past', focus: 'ACTOR', form: `nagpa${normalizedRoot}` },
        { tense: 'Progressive', focus: 'ACTOR', form: `nagpapa${normalizedRoot}` },
        { tense: 'Future', focus: 'ACTOR', form: `mapapa${normalizedRoot}` }
      );
    }
    // 2. Regular Actor Focus (MAG-)
    else if (part.startsWith('MAG')) {
      results.push(
        { tense: 'Infinitive', focus: 'ACTOR', form: `mag${normalizedRoot}` },
        { tense: 'Past', focus: 'ACTOR', form: `nag${normalizedRoot}` },
        { tense: 'Progressive', focus: 'ACTOR', form: `nag${r}${normalizedRoot}` },
        { tense: 'Future', focus: 'ACTOR', form: `ma${r}${normalizedRoot}` }
      );
    }
    // 3. Actor Focus (MANG-)
    else if (part.startsWith('MANG')) {
      results.push(
        { tense: 'Infinitive', focus: 'ACTOR', form: `mang${normalizedRoot}` },
        { tense: 'Past', focus: 'ACTOR', form: `nang${normalizedRoot}` },
        { tense: 'Progressive', focus: 'ACTOR', form: `nang${r}${normalizedRoot}` },
        { tense: 'Future', focus: 'ACTOR', form: `ma${r}${normalizedRoot}` }
      );
    }
    // 4. Participatory Actor Focus (MAKI-)
    else if (part.startsWith('MAKI')) {
      results.push(
        { tense: 'Infinitive', focus: 'ACTOR', form: `maki${normalizedRoot}` },
        { tense: 'Past', focus: 'ACTOR', form: `naki${normalizedRoot}` },
        { tense: 'Progressive', focus: 'ACTOR', form: `nakiki${normalizedRoot}` },
        { tense: 'Future', focus: 'ACTOR', form: `makiki${normalizedRoot}` }
      );
    }
    // 5. Ability Actor Focus (MAKA- or MA+KA-)
    else if (part.startsWith('MAKA') || part.startsWith('MA+KA')) {
      results.push(
        { tense: 'Infinitive', focus: 'ACTOR', form: `maka${normalizedRoot}` },
        { tense: 'Past', focus: 'ACTOR', form: `naka${normalizedRoot}` },
        { tense: 'Progressive', focus: 'ACTOR', form: `nakaka${normalizedRoot}` },
        { tense: 'Future', focus: 'ACTOR', form: `makaka${normalizedRoot}` }
      );
    }
    // 6. Regular Actor/Ability Focus (MA-)
    else if (part.startsWith('MA') && !part.includes('ON')) {
      results.push(
        { tense: 'Infinitive', focus: 'ACTOR', form: `ma${normalizedRoot}` },
        { tense: 'Past', focus: 'ACTOR', form: `na${normalizedRoot}` },
        { tense: 'Progressive', focus: 'ACTOR', form: `na${r}${normalizedRoot}` },
        { tense: 'Future', focus: 'ACTOR', form: `ma${r}${normalizedRoot}` }
      );
    }
    // 7. Causative Object Focus (I+PA- or IPA-)
    else if (part.startsWith('I+PA') || part.startsWith('IPA')) {
      results.push(
        { tense: 'Infinitive', focus: 'OBJECT', form: `ipa${normalizedRoot}` },
        { tense: 'Past', focus: 'OBJECT', form: `ipina${normalizedRoot}` },
        { tense: 'Progressive', focus: 'OBJECT', form: `ipinapa${normalizedRoot}` },
        { tense: 'Future', focus: 'OBJECT', form: `ipapa${normalizedRoot}` }
      );
    }
    // 8. Regular Object Focus (I-)
    else if (part.startsWith('I')) {
      let pastForm = '';
      let progressiveForm = '';

      const firstChar = normalizedRoot[0];
      if (firstChar && vowels.includes(firstChar)) {
        pastForm = `ini${normalizedRoot}`;
        progressiveForm = `ini${r}${normalizedRoot}`;
      } else if (firstChar) {
        const restOfRoot = normalizedRoot.substring(1);
        pastForm = `i${firstChar}in${restOfRoot}`;
        progressiveForm = `i${firstChar}in${r.substring(1)}${normalizedRoot}`;
      }

      results.push(
        { tense: 'Infinitive', focus: 'OBJECT', form: `i${normalizedRoot}` },
        { tense: 'Past', focus: 'OBJECT', form: pastForm },
        { tense: 'Progressive', focus: 'OBJECT', form: progressiveForm },
        { tense: 'Future', focus: 'OBJECT', form: `i${r}${normalizedRoot}` }
      );
    }
    // 9. Object Focus (-ON series)
    else if (part.includes('ON') || part.includes('hon')) {
      const infinitiveSuffix = isVowelEnding ? 'hon' : 'on';
      const futureSuffix = infinitiveSuffix;

      let pastForm = '';
      let progressiveForm = '';

      const firstChar = normalizedRoot[0];
      if (firstChar && vowels.includes(firstChar)) {
        pastForm = `in${normalizedRoot}`;
        progressiveForm = `in${r}${normalizedRoot}`;
      } else if (firstChar) {
        const restOfRoot = normalizedRoot.substring(1);
        pastForm = `${firstChar}in${restOfRoot}`;
        progressiveForm = `${firstChar}in${r.substring(1)}${normalizedRoot}`;
      }

      results.push(
        { tense: 'Infinitive', focus: 'OBJECT', form: `${normalizedRoot}${infinitiveSuffix}` },
        { tense: 'Past', focus: 'OBJECT', form: pastForm },
        { tense: 'Progressive', focus: 'OBJECT', form: progressiveForm },
        { tense: 'Future', focus: 'OBJECT', form: `${r}${normalizedRoot}${futureSuffix}` }
      );
    }
    // 10. Fallback for other prefixes (e.g. PA-, HA-, PAG-, KA-)
    else {
      const prefix = part.replace('-', '').toLowerCase();
      results.push(
        { tense: 'Infinitive', focus: 'ACTOR', form: `${prefix}${normalizedRoot}` },
        { tense: 'Past', focus: 'ACTOR', form: `n${prefix.substring(1)}${normalizedRoot}` },
        { tense: 'Progressive', focus: 'ACTOR', form: `n${prefix.substring(1)}${r}${normalizedRoot}` },
        { tense: 'Future', focus: 'ACTOR', form: `m${prefix.substring(1)}${r}${normalizedRoot}` }
      );
    }
  }

  if (preferredFocus) {
    const filtered = results.filter(r => r.focus === preferredFocus.toUpperCase());
    if (filtered.length > 0) return filtered;
  }

  return results;
}
