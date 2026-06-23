export const POS_OPTIONS = [
  { value: "", label: "Select part of speech" },
  { value: "Noun", label: "Noun" },
  { value: "Verb", label: "Verb" },
  { value: "Adjective", label: "Adjective" },
  { value: "Adverb", label: "Adverb" },
  { value: "Pronoun", label: "Pronoun" },
  { value: "Preposition", label: "Preposition" },
  { value: "Conjunction", label: "Conjunction" },
  { value: "Interjection", label: "Interjection" },
  { value: "Numeral", label: "Numeral" },
  { value: "Particle", label: "Particle" },
  { value: "Affix", label: "Affix" },
  { value: "Phrase", label: "Phrase" },
  { value: "Expression", label: "Expression" },
] as const;

export const DIALECT_OPTIONS = [
  "General Bikol",
  "Central Bikol (Naga)",
  "Central Bikol (Albay)",
  "Rinconada Bikol",
  "Masbateño",
  "Buhi-non",
  "Northern Catanduanes",
  "Southern Catanduanes",
  "Virac",
] as const;
