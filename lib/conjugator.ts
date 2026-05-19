export interface ConjugationResult {
  tense: string;
  focus: string;
  form: string;
}

/**
 * Extracts the first CV (Consonant-Vowel) pattern for reduplication.
 * Handling cases like: 
 * 'bakál' -> 'ba'
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
 * Currently supports MAG-, -ON (Regular Series).
 */
export function conjugateBikolVerb(root: string, affixPair: string): ConjugationResult[] {
  const normalizedRoot = root.toLowerCase().trim();
  const normalizedAffix = affixPair.toUpperCase().replace(/\s/g, '');
  const r = getReduplication(normalizedRoot);
  const results: ConjugationResult[] = [];

  const vowels = ['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú'];
  const lastChar = normalizedRoot[normalizedRoot.length - 1];
  const isVowelEnding = lastChar ? vowels.includes(lastChar) : false;

  // Actor Focus (MAG- series)
  if (normalizedAffix.includes('MAG-')) {
    results.push(
      { tense: 'Infinitive', focus: 'ACTOR', form: `mag${normalizedRoot}` },
      { tense: 'Past', focus: 'ACTOR', form: `nag${normalizedRoot}` },
      { tense: 'Progressive', focus: 'ACTOR', form: `nag${r}${normalizedRoot}` },
      { tense: 'Future', focus: 'ACTOR', form: `ma${r}${normalizedRoot}` }
    );
  }

  // Object Focus (-ON series)
  if (normalizedAffix.includes('-ON')) {
    const infinitiveSuffix = isVowelEnding ? 'hon' : 'on';
    const futureSuffix = infinitiveSuffix;

    // Past / Progressive Infixation (-in-)
    let pastForm = '';
    let progressiveForm = '';

    const firstChar = normalizedRoot[0];
    if (firstChar && vowels.includes(firstChar)) {
      pastForm = `in${normalizedRoot}`;
      progressiveForm = `in${r}${normalizedRoot}`;
    } else if (firstChar) {
      // Consonant starting: insert -in- after first consonant
      const restOfRoot = normalizedRoot.substring(1);
      pastForm = `${firstChar}in${restOfRoot}`;
      
      // Progressive: infix -in- into the reduplicated form
      // e.g., 'bakal' -> 'ba' -> 'binabakal'
      progressiveForm = `${firstChar}in${r.substring(1)}${normalizedRoot}`;
    } else {
      pastForm = normalizedRoot;
      progressiveForm = normalizedRoot;
    }

    results.push(
      { tense: 'Infinitive', focus: 'OBJECT', form: `${normalizedRoot}${infinitiveSuffix}` },
      { tense: 'Past', focus: 'OBJECT', form: pastForm },
      { tense: 'Progressive', focus: 'OBJECT', form: progressiveForm },
      { tense: 'Future', focus: 'OBJECT', form: `${r}${normalizedRoot}${futureSuffix}` }
    );
  }

  return results;
}
