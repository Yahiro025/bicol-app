import { describe, expect, test } from "bun:test";
import {
  damerauLevenshtein,
  stringSimilarity,
  fuzzyMatch,
} from "../lib/fuzzy";

// ─── damerauLevenshtein ─────────────────────────────────────────────────────

describe("damerauLevenshtein", () => {
  test("empty strings", () => {
    expect(damerauLevenshtein("", "")).toBe(0);
    expect(damerauLevenshtein("abc", "")).toBe(3);
    expect(damerauLevenshtein("", "xyz")).toBe(3);
  });

  test("identical strings", () => {
    expect(damerauLevenshtein("hello", "hello")).toBe(0);
    expect(damerauLevenshtein("a", "a")).toBe(0);
  });

  test("single character difference", () => {
    expect(damerauLevenshtein("a", "b")).toBe(1);
    expect(damerauLevenshtein("cat", "car")).toBe(1); // substitution
  });

  test("insertion", () => {
    expect(damerauLevenshtein("cat", "cats")).toBe(1);
    expect(damerauLevenshtein("hello", "hellos")).toBe(1);
  });

  test("deletion", () => {
    expect(damerauLevenshtein("cats", "cat")).toBe(1);
    expect(damerauLevenshtein("hello", "helo")).toBe(1);
  });

  test("transposition (adjacent swap)", () => {
    // "psa" → "pas" (swap last two chars)
    expect(damerauLevenshtein("psa", "pas")).toBe(1);
    // "recieve" → "receive" (swap ie → ei = single transposition)
    // r-e-c-i-e-v-e vs r-e-c-e-i-v-e: positions 3,4 swapped = 1 transposition
    expect(damerauLevenshtein("recieve", "receive")).toBe(1);
    // Simple 2-char swap
    expect(damerauLevenshtein("ab", "ba")).toBe(1);
  });

  test("two edits", () => {
    expect(damerauLevenshtein("kitten", "sitting")).toBe(3);
    expect(damerauLevenshtein("hello", "hallo")).toBe(1);
    expect(damerauLevenshtein("book", "back")).toBe(2);
  });

  test("completely different strings", () => {
    expect(damerauLevenshtein("abc", "xyz")).toBe(3);
    expect(damerauLevenshtein("hello", "world")).toBe(4);
  });

  test("case sensitive (raw function — casing is caller's responsibility)", () => {
    expect(damerauLevenshtein("Hello", "hello")).toBe(1); // H → h substitution
    expect(damerauLevenshtein("HELLO", "hello")).toBe(5); // all different case
  });

  test("long strings", () => {
    const a = "magayon".repeat(5); // 35 chars
    const b = "magayon".repeat(5);
    expect(damerauLevenshtein(a, b)).toBe(0);
    expect(damerauLevenshtein(a, b + "x")).toBe(1);
  });

  test("unicode characters", () => {
    // Bikol words with ñ
    expect(damerauLevenshtein("niño", "nino")).toBe(1); // ñ → n substitution
    expect(damerauLevenshtein("niño", "niña")).toBe(1); // o → a substitution
  });
});

// ─── stringSimilarity ───────────────────────────────────────────────────────

describe("stringSimilarity", () => {
  test("empty / falsy inputs", () => {
    expect(stringSimilarity("", "")).toBe(0);
    expect(stringSimilarity("hello", "")).toBe(0);
    expect(stringSimilarity("", "hello")).toBe(0);
  });

  test("identical strings (case-insensitive)", () => {
    expect(stringSimilarity("hello", "hello")).toBe(1);
    expect(stringSimilarity("HELLO", "hello")).toBe(1);
    expect(stringSimilarity("Hello", "hELLo")).toBe(1);
  });

  test("completely different strings", () => {
    const sim = stringSimilarity("abc", "xyz");
    expect(sim).toBe(0); // 3 / 3 = 1 → 1 - 1 = 0
  });

  test("single edit on short strings", () => {
    const sim = stringSimilarity("cat", "car");
    // dist = 1, maxLen = 3 → 1 - 1/3 = 0.667
    expect(sim).toBeCloseTo(0.667, 2);
  });

  test("single edit on long strings", () => {
    const sim = stringSimilarity("magayon", "magayun");
    // dist = 1, maxLen = 7 → 1 - 1/7 ≈ 0.857
    expect(sim).toBeCloseTo(0.857, 2);
  });

  test("transposition similarity", () => {
    const sim = stringSimilarity("psa", "pas");
    // dist = 1 (transposition), maxLen = 3 → 1 - 1/3 ≈ 0.667
    expect(sim).toBeCloseTo(0.667, 2);
  });

  test("similarity increases as strings get closer", () => {
    const far = stringSimilarity("kitten", "sitting"); // dist = 3
    const close = stringSimilarity("kitten", "kittin"); // dist = 1
    expect(close).toBeGreaterThan(far);
  });

  test("similarity uses max length as denominator", () => {
    // "hel" vs "hello" → dist = 2 (add l, o), maxLen = 5 → 1 - 2/5 = 0.6
    const sim = stringSimilarity("hel", "hello");
    expect(sim).toBeCloseTo(0.6, 1);
  });
});

// ─── fuzzyMatch (integration tests) ─────────────────────────────────────────

interface TestWord {
  bikol: string;
  english: string;
  tagalog: string | null;
}

const dictionary: TestWord[] = [
  { bikol: "magayon", english: "beautiful", tagalog: "maganda" },
  { bikol: "kumusta", english: "how are you", tagalog: "kamusta" },
  { bikol: "harong", english: "house", tagalog: "bahay" },
  { bikol: "dakol", english: "many", tagalog: "marami" },
  { bikol: "salamat", english: "thank you", tagalog: "salamat" },
  { bikol: "kakanon", english: "food", tagalog: "pagkain" },
  { bikol: "aldaw", english: "day", tagalog: "araw" },
  { bikol: "unod", english: "follow", tagalog: "sundin" },
  { bikol: "tukdo", english: "teach", tagalog: "turo" },
  { bikol: "tabang", english: "help", tagalog: "tulong" },
  { bikol: "maluto", english: "cook", tagalog: "magluto" },
  { bikol: "kawat", english: "play", tagalog: "laro" },
];

const bikolExtractor = (w: TestWord) => w.bikol;
const englishExtractor = (w: TestWord) => w.english;
const tagalogExtractor = (w: TestWord) => w.tagalog;

describe("fuzzyMatch", () => {
  test("empty query returns empty array", () => {
    expect(fuzzyMatch("", dictionary, [bikolExtractor])).toEqual([]);
    expect(fuzzyMatch("  ", dictionary, [bikolExtractor])).toEqual([]);
  });

  test("exact match (bikol field)", () => {
    const results = fuzzyMatch("magayon", dictionary, [bikolExtractor]);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0]?.item.bikol).toBe("magayon");
    expect(results[0]?.score).toBe(1.0);
  });

  test("exact match (english field)", () => {
    const results = fuzzyMatch("beautiful", dictionary, [bikolExtractor, englishExtractor]);
    expect(results.length).toBeGreaterThanOrEqual(1);
    // "beautiful" is an exact match on english
    const best = results[0];
    expect(best?.item.bikol).toBe("magayon");
    expect(best?.score).toBe(1.0);
  });

  test("prefix match on bikol", () => {
    const results = fuzzyMatch("mag", dictionary, [bikolExtractor]);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((r) => r.item.bikol === "magayon")).toBe(true);
    // Prefix score is 0.95
    const magResult = results.find((r) => r.item.bikol === "magayon");
    expect(magResult?.score).toBe(0.95);
  });

  test("contains match on bikol", () => {
    const results = fuzzyMatch("ron", dictionary, [bikolExtractor]);
    const harongResult = results.find((r) => r.item.bikol === "harong");
    expect(harongResult).toBeDefined();
    // Contains (with word boundary) → 0.9
    // "ron" doesn't start at a word boundary in "harong" so: 0.85
    expect(harongResult?.score).toBe(0.85);
  });

  test("word-boundary contains match", () => {
    // "you" starts at a word boundary in "thank you"
    const results = fuzzyMatch("you", dictionary, [englishExtractor]);
    const thanksResult = results.find((r) => r.item.english === "thank you");
    expect(thanksResult).toBeDefined();
    expect(thanksResult?.score).toBe(0.9); // word-boundary bonus
  });

  test("fuzzy/typo match — transposition", () => {
    // "harogn" (typo: transposed 'o' and 'n') should match "harong"
    const results = fuzzyMatch("harogn", dictionary, [bikolExtractor], {
      minScore: 0.4,
    });
    const harongResult = results.find((r) => r.item.bikol === "harong");
    expect(harongResult).toBeDefined();
    // transposition = 1 edit → similarity = 1 - 1/6 ≈ 0.833 → score = 0.833 * 0.8 ≈ 0.667
    expect(harongResult?.score).toBeGreaterThan(0.6);
  });

  test("fuzzy match — single missing char", () => {
    // "maby" should fuzzy-match "many"
    const results = fuzzyMatch("maby", dictionary, [englishExtractor], {
      minScore: 0.4,
    });
    const manyResult = results.find((r) => r.item.english === "many");
    expect(manyResult).toBeDefined();
    // "maby" → "many": 1 substitution, len=4 → sim=0.75 → 0.75*0.8=0.6
    expect(manyResult?.score).toBeCloseTo(0.6, 1);
  });

  test("fuzzy match — queries under 3 chars do NOT use DL (noise guard)", () => {
    // "ab" — 2-char query: only exact/prefix/contains, no DL fallback
    const results = fuzzyMatch("ab", dictionary, [bikolExtractor], {
      minScore: 0.4,
    });
    // "tabang" contains "ab" → score 0.85
    const tabangResult = results.find((r) => r.item.bikol === "tabang");
    expect(tabangResult).toBeDefined();
    // Should not fuzzy-match e.g. "ar" to something completely different
    const arResults = fuzzyMatch("ar", dictionary, [bikolExtractor], {
      minScore: 0.3, // lower threshold to catch accidental fuzzy matches
    });
    // "ar" is 2 chars, so only exact/prefix/contains matches should appear
    // "aldaw" does NOT contain "ar" and shouldn't show up
    expect(arResults.every((r) => r.item.bikol.includes("ar"))).toBe(true);
  });

  test("minScore filters out weak matches", () => {
    // "xyzabc" vs dictionary — similarity is very low
    const results = fuzzyMatch("xyzabc", dictionary, [bikolExtractor], {
      minScore: 0.5,
    });
    expect(results.length).toBe(0);
  });

  test("limit caps results", () => {
    // "a" should match many prefix/contains results
    const results = fuzzyMatch("a", dictionary, [
      bikolExtractor,
      englishExtractor,
      tagalogExtractor,
    ], { limit: 3 });
    expect(results.length).toBeLessThanOrEqual(3);
  });

  test("results are sorted by score descending", () => {
    const results = fuzzyMatch("ma", dictionary, [bikolExtractor]);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1]!.score).toBeGreaterThanOrEqual(results[i]!.score);
    }
  });

  test("matches across multiple extractors (best field wins)", () => {
    // "maganda" matches tagalog for "magayon", not bikol
    const results = fuzzyMatch("maganda", dictionary, [
      bikolExtractor,
      englishExtractor,
      tagalogExtractor,
    ]);
    const magayonResult = results.find((r) => r.item.bikol === "magayon");
    expect(magayonResult).toBeDefined();
    expect(magayonResult?.score).toBe(1.0); // exact match on tagalog
  });

  test("case-insensitive matching", () => {
    const results = fuzzyMatch("MAGAYON", dictionary, [bikolExtractor]);
    expect(results[0]?.item.bikol).toBe("magayon");
    expect(results[0]?.score).toBe(1.0);
  });

  test("null/undefined extractor values are skipped", () => {
    // "kamusta" should fuzzy-match "kumusta" via bikol, even though tagalog="kamusta"
    // But tagalog for kumusta is "kamusta" so fuzzyMatch via tagalog would be exact
    const results = fuzzyMatch("kamusta", dictionary, [
      bikolExtractor,
      tagalogExtractor,
    ]);
    // Should find kumusta via tagalog exact match OR bikol fuzzy match
    const kumustaResult = results.find((r) => r.item.bikol === "kumusta");
    expect(kumustaResult).toBeDefined();
  });

  test("pre-filter: items with no field matching first char AND length diff > 3 are skipped", () => {
    // Create an item where ALL fields start with 'x' and lengths are far from 'hello'
    const weirdItem = { bikol: "xyzzy", english: "xylophone stuff", tagalog: null };
    const items = [weirdItem, ...dictionary];
    const results = fuzzyMatch("hello", items, [
      bikolExtractor,
      englishExtractor,
      tagalogExtractor,
    ], { minScore: 0.01, limit: 50 });
    // "xyzzy" should be pre-filtered out (first char 'x' ≠ 'h', lengths 5 vs 5 not >3 diff... actually length diff is 0)
    // Wait: |len("xyzzy") - len("hello")| = |5 - 5| = 0 <= 3, so it passes pre-filter on length
    // Let me fix the test with a truly unfilterable item
    const realWeird = { bikol: "x", english: "x-ray", tagalog: null };
    const items2 = [realWeird, ...dictionary];
    const results2 = fuzzyMatch("hello", items2, [
      bikolExtractor,
      englishExtractor,
      tagalogExtractor,
    ], { minScore: 0.01, limit: 50 });
    // "x" — first char 'x' ≠ 'h', length diff = |1 - 5| = 4 > 3 → should be pre-filtered out
    expect(results2.find((r) => r.item.bikol === "x")).toBeUndefined();
  });
});

// ─── Realistic Bikol dictionary search scenarios ────────────────────────────

describe("Bikol search scenarios", () => {
  const bikolDictionary: TestWord[] = [
    { bikol: "magayon", english: "beautiful", tagalog: "maganda" },
    { bikol: "marhay", english: "good", tagalog: "mabuti" },
    { bikol: "madali", english: "easy", tagalog: "madali" },
    { bikol: "makuri", english: "difficult", tagalog: "mahirap" },
    { bikol: "maluto", english: "cook", tagalog: "magluto" },
    { bikol: "mataba", english: "fat", tagalog: "mataba" },
  ];

  const extractors = [
    (w: TestWord) => w.bikol,
    (w: TestWord) => w.english,
    (w: TestWord) => w.tagalog,
  ];

  test("typo: 'magayno' should find 'magayon'", () => {
    const results = fuzzyMatch("magayno", bikolDictionary, extractors, {
      minScore: 0.4,
    });
    expect(results.some((r) => r.item.bikol === "magayon")).toBe(true);
  });

  test("typo: 'marhag' should find 'marhay' (two edits — transposed ay)", () => {
    const results = fuzzyMatch("marhag", bikolDictionary, extractors, {
      minScore: 0.4,
    });
    // marhag vs marhay: 2 edits → sim = 1 - 2/6 ≈ 0.667 → score ≈ 0.533
    expect(results.some((r) => r.item.bikol === "marhay")).toBe(true);
  });

  test("searching english 'beauty' finds 'beautiful'", () => {
    const results = fuzzyMatch("beauty", bikolDictionary, extractors, {
      minScore: 0.4,
    });
    expect(results.some((r) => r.item.bikol === "magayon")).toBe(true);
  });

  test("searching tagalog 'mabuti' finds 'marhay'", () => {
    const results = fuzzyMatch("mabuti", bikolDictionary, extractors);
    expect(results.some((r) => r.item.bikol === "marhay")).toBe(true);
  });

  test("searching tagalog 'mahirap' finds 'makuri' (fuzzy match)", () => {
    const results = fuzzyMatch("mahirap", bikolDictionary, extractors, {
      minScore: 0.4,
    });
    expect(results.some((r) => r.item.bikol === "makuri")).toBe(true);
  });
});
