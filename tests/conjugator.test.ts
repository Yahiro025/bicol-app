import { describe, expect, test } from "bun:test";
import { conjugateVerbMintz, conjugateBikolVerb, extractRoot } from "../lib/conjugator";

describe("conjugateVerbMintz", () => {
  test("conjugates ON-class root 'bakal' (consonant-starting)", () => {
    const result = conjugateVerbMintz("bakal", "ON");

    // Actor focus (MAG-)
    expect(result.actorFocus.infinitive).toBe("magbakal");
    expect(result.actorFocus.future).toBe("mababakal");
    expect(result.actorFocus.past).toBe("nagbakal");
    expect(result.actorFocus.progressive).toBe("nagbabakal");

    // Object focus (-ON)
    expect(result.objectFocus.infinitive).toBe("bakalon");
    expect(result.objectFocus.future).toBe("babakalon");
    expect(result.objectFocus.past).toBe("binakal");
    expect(result.objectFocus.progressive).toBe("binabakal");
  });

  test("conjugates AN-class root 'hugas'", () => {
    const result = conjugateVerbMintz("hugas", "AN");

    // Actor focus (MAG-)
    expect(result.actorFocus.infinitive).toBe("maghugas");
    expect(result.actorFocus.future).toBe("mahuhugas");
    expect(result.actorFocus.past).toBe("naghugas");
    expect(result.actorFocus.progressive).toBe("naghuhugas");

    // Object focus (-AN)
    expect(result.objectFocus.infinitive).toBe("hugasan");
    expect(result.objectFocus.future).toBe("huhugasan");
    expect(result.objectFocus.past).toBe("hinugasan");
    expect(result.objectFocus.progressive).toBe("hinuhugasan");
  });

  test("conjugates I-class root 'abot' (vowel-starting)", () => {
    const result = conjugateVerbMintz("abot", "I");

    // Actor focus (MAG-) — vowel root reduplicates only the first vowel
    expect(result.actorFocus.infinitive).toBe("magabot");
    expect(result.actorFocus.future).toBe("maaabot");
    expect(result.actorFocus.past).toBe("nagabot");
    expect(result.actorFocus.progressive).toBe("nagaabot");

    // Object focus (I-)
    expect(result.objectFocus.infinitive).toBe("iabot");
    expect(result.objectFocus.future).toBe("iaabot");
    expect(result.objectFocus.past).toBe("iniabot");
    expect(result.objectFocus.progressive).toBe("iniaabot");
  });

  test("conjugates vowel-starting root 'apod' with ON class", () => {
    const result = conjugateVerbMintz("apod", "ON");

    // Actor focus (MAG-) — vowel root reduplicates only the first vowel
    expect(result.actorFocus.infinitive).toBe("magapod");
    expect(result.actorFocus.future).toBe("maaapod");
    expect(result.actorFocus.past).toBe("nagapod");
    expect(result.actorFocus.progressive).toBe("nagaapod");

    // Object focus (-ON) — vowel-starting special case
    expect(result.objectFocus.infinitive).toBe("apodon");
    expect(result.objectFocus.future).toBe("aapodon");
    expect(result.objectFocus.past).toBe("inapod");
    expect(result.objectFocus.progressive).toBe("inaapod");
  });

  test("conjugates vowel-starting root 'abot' with AN class", () => {
    const result = conjugateVerbMintz("abot", "AN");

    // Object focus (-AN) — vowel-starting special case
    expect(result.objectFocus.past).toBe("inabot");
    expect(result.objectFocus.progressive).toBe("inaabot");
  });

  test("conjugates MAG-class (intransitive) root 'lakaw'", () => {
    const result = conjugateVerbMintz("lakaw", "MAG");

    // Actor focus (MAG-)
    expect(result.actorFocus.infinitive).toBe("maglakaw");
    expect(result.actorFocus.future).toBe("malalakaw");
    expect(result.actorFocus.past).toBe("naglakaw");
    expect(result.actorFocus.progressive).toBe("naglalakaw");

    // Object focus should mirror actor for MAG class
    expect(result.objectFocus.infinitive).toBe("maglakaw");
    expect(result.objectFocus.past).toBe("naglakaw");
  });

  test("handles vowel-ending root 'basa' with ON class (h-insertion)", () => {
    const result = conjugateVerbMintz("basa", "ON");

    // Object focus should insert 'h' before -on
    expect(result.objectFocus.infinitive).toBe("basahon");
    expect(result.objectFocus.future).toBe("babasahon");
  });

  test("handles vowel-ending root 'sabi' with AN class (h-insertion)", () => {
    const result = conjugateVerbMintz("sabi", "AN");

    // Object focus should insert 'h' before -an
    expect(result.objectFocus.infinitive).toBe("sabihan");
    expect(result.objectFocus.future).toBe("sasabihan");
  });
});

describe("conjugateBikolVerb", () => {
  test("returns actor and object focus forms for ON-class verb", () => {
    const results = conjugateBikolVerb("bakal", "MAG-, -ON");

    expect(results.length).toBe(8);

    const infinitiveActor = results.find(r => r.tense === "Infinitive" && r.focus === "Actor");
    expect(infinitiveActor?.form).toBe("magbakal");

    const pastObject = results.find(r => r.tense === "Past" && r.focus === "Object");
    expect(pastObject?.form).toBe("binakal");
  });

  test("returns only actor focus when preferredFocus is ACTOR", () => {
    const results = conjugateBikolVerb("bakal", "MAG-, -ON", "ACTOR");

    expect(results.length).toBe(4);
    expect(results.every(r => r.focus === "Actor")).toBe(true);
  });

  test("returns only object focus when preferredFocus is OBJECT", () => {
    const results = conjugateBikolVerb("bakal", "MAG-, -ON", "OBJECT");

    expect(results.length).toBe(4);
    expect(results.every(r => r.focus === "Object")).toBe(true);
  });

  test("maps affix pair to correct focus class", () => {
    const onResults = conjugateBikolVerb("hugas", "MAG-, -AN");
    const pastObject = onResults.find(r => r.tense === "Past" && r.focus === "Object");
    expect(pastObject?.form).toBe("hinugasan");
  });

  test("returns only actor for MAG-only verbs", () => {
    const results = conjugateBikolVerb("lakaw", "MAG-");

    expect(results.length).toBe(4);
    expect(results.every(r => r.focus === "Actor")).toBe(true);
  });
});

describe("extractRoot", () => {
  test("extracts root from actor-focus infinitive magbakal", () => {
    expect(extractRoot("magbakal")).toBe("bakal");
  });

  test("extracts root from actor-focus past nagbakal", () => {
    expect(extractRoot("nagbakal")).toBe("bakal");
  });

  test("extracts root from actor-focus progressive nagbabakal", () => {
    expect(extractRoot("nagbabakal")).toBe("bakal");
  });

  test("extracts root from actor-focus future mabakal", () => {
    expect(extractRoot("mabakal")).toBe("bakal");
  });

  test("extracts root from object-focus past binakal", () => {
    expect(extractRoot("binakal")).toBe("bakal");
  });

  test("extracts root from object-focus infinitive bakalon", () => {
    expect(extractRoot("bakalon")).toBe("bakal");
  });

  test("extracts root from vowel-initial past inapod", () => {
    expect(extractRoot("inapod")).toBe("apod");
  });

  test("extracts root from I-class past initao", () => {
    expect(extractRoot("initao")).toBe("tao");
  });

  test("extracts root from object-focus with -an suffix hinugasan", () => {
    expect(extractRoot("hinugasan")).toBe("hugas");
  });

  test("extracts root from vowel-ending root with h-insertion basahon", () => {
    expect(extractRoot("basahon")).toBe("basa");
  });

  test("handles simple, non-conjugated word", () => {
    expect(extractRoot("si")).toBe("si");
    expect(extractRoot("nin")).toBe("nin");
  });
});
