import 'dotenv/config';
import { prisma } from '../lib/prisma';

interface WordRecord {
  id: bigint;
  bikol: string | null;
  english: string | null;
  pos: string | null;
  category: string | null;
  dialect: string | null;
  example_bikol: string | null;
  example_english: string | null;
  pronunciation: string | null;
  synonyms: string | null;
  tagalog: string | null;
  confidence: number | null;
  source_url: string | null;
  audio_url: string | null;
  etymology: string | null;
  frequency_rank: number | null;
}

const EXCLUDE_LOWERCASE = ['abo']; // strictly exclude "Abo" / "abo"

const matchLower = (str1: string | null, str2: string | null): boolean => {
  return (str1 || '').trim().toLowerCase() === (str2 || '').trim().toLowerCase();
};

async function main() {
  console.log('🤖 Starting Lossless Database Case Deduplication...');

  // 1. Fetch all words from legacy table
  const allWords = await prisma.word.findMany() as unknown as WordRecord[];
  console.log(`📖 Total records loaded from 'Word' table: ${allWords.length}`);

  // 2. Group by lowercase bikol representation
  const lowerMap = new Map<string, WordRecord[]>();
  for (const w of allWords) {
    if (!w.bikol) continue;
    const lower = w.bikol.toLowerCase();
    if (!lowerMap.has(lower)) {
      lowerMap.set(lower, []);
    }
    lowerMap.get(lower)!.push(w);
  }

  // Filter out duplicates (excluding Abo/abo)
  const duplicateGroups: [string, WordRecord[]][] = [];
  for (const [lower, list] of lowerMap.entries()) {
    if (list.length > 1 && !EXCLUDE_LOWERCASE.includes(lower)) {
      duplicateGroups.push([lower, list]);
    }
  }

  console.log(`🔍 Found ${duplicateGroups.length} case-duplicate word groups to merge (excluding 'Abo').`);

  let wordsMergedCount = 0;
  let rootsMergedCount = 0;

  for (const [lower, list] of duplicateGroups) {
    // We assume there's exactly one lowercase and one capitalized version
    const wordLower = list.find(w => w.bikol === lower);
    const wordUpper = list.find(w => w.bikol !== lower);

    if (!wordLower || !wordUpper) {
      console.warn(`⚠️ Group for "${lower}" does not have clear lowercase/capitalized pair. Skipping.`);
      continue;
    }

    console.log(`\n📦 Merging pair: "${wordUpper.bikol}" ➡️ "${wordLower.bikol}"`);

    // --- STEP A: Merge legacy 'Word' table fields ---
    const updateData: any = {};
    const fieldsToMerge = [
      'english', 'pos', 'category', 'dialect', 'example_bikol',
      'example_english', 'pronunciation', 'synonyms', 'tagalog',
      'confidence', 'source_url', 'audio_url', 'etymology', 'frequency_rank'
    ];

    for (const f of fieldsToMerge) {
      if ((wordLower as any)[f] === null && (wordUpper as any)[f] !== null) {
        updateData[f] = (wordUpper as any)[f];
      }
    }

    if (Object.keys(updateData).length > 0) {
      console.log(`  - Copying Word fields to lower: ${JSON.stringify(updateData)}`);
      await prisma.word.update({
        where: { id: wordLower.id },
        data: updateData
      });
    }

    // Delete the capitalized legacy word
    await prisma.word.delete({
      where: { id: wordUpper.id }
    });
    wordsMergedCount++;

    // --- STEP B: Merge normalized 'Root' and 'Definition' models ---
    const rootLower = await prisma.root.findFirst({
      where: { bikol: wordLower.bikol ?? undefined },
      include: {
        definitions: {
          include: {
            conjugations: true,
            exampleSentences: true
          }
        }
      }
    });

    const rootUpper = await prisma.root.findFirst({
      where: { bikol: wordUpper.bikol ?? undefined },
      include: {
        definitions: {
          include: {
            conjugations: true,
            exampleSentences: true
          }
        }
      }
    });

    if (rootLower && rootUpper) {
      console.log(`  - Both roots exist in normalized table. Merging definitions...`);

      for (const defUpper of rootUpper.definitions) {
        // Look for matching definition in the lowercase root by trim/case-insensitive english field
        const matchingDefLower = rootLower.definitions.find(d => matchLower(d.english, defUpper.english));

        if (!matchingDefLower) {
          // Case 1: The capitalized root has a unique definition. Re-link it to lowercase root.
          console.log(`  - Re-linking unique definition: "${defUpper.english}"`);
          await prisma.definition.update({
            where: { id: defUpper.id },
            data: { rootId: rootLower.id }
          });
        } else {
          // Case 2: Redundant definition. Merge unique child records (conjugations and examples).
          console.log(`  - Redundant definition: "${defUpper.english}". Merging child records...`);

          // Merge definition fields when they are redundant
          let mergedDialect = matchingDefLower.dialect;
          if (defUpper.dialect && matchingDefLower.dialect !== defUpper.dialect) {
            if (!matchingDefLower.dialect) {
              mergedDialect = defUpper.dialect;
            } else if (!matchingDefLower.dialect.includes(defUpper.dialect) && !defUpper.dialect.includes(matchingDefLower.dialect)) {
              mergedDialect = `${matchingDefLower.dialect} / ${defUpper.dialect}`;
            }
          }

          let mergedSynonyms = matchingDefLower.synonyms;
          if (defUpper.synonyms && defUpper.synonyms.trim() !== '') {
            if (!matchingDefLower.synonyms || matchingDefLower.synonyms.trim() === '') {
              mergedSynonyms = defUpper.synonyms;
            } else if (matchingDefLower.synonyms.toLowerCase() !== defUpper.synonyms.toLowerCase()) {
              const partsKeep = matchingDefLower.synonyms.split(/[\/;,\.]+/).map(p => p.trim()).filter(Boolean);
              const partsMerge = defUpper.synonyms.split(/[\/;,\.]+/).map(p => p.trim()).filter(Boolean);
              const allParts = Array.from(new Set([...partsKeep, ...partsMerge]));
              mergedSynonyms = allParts.join('; ');
            }
          }

          let mergedTagalog = matchingDefLower.tagalog;
          if (defUpper.tagalog && defUpper.tagalog.trim() !== '') {
            if (!matchingDefLower.tagalog || matchingDefLower.tagalog.trim() === '') {
              mergedTagalog = defUpper.tagalog;
            } else if (matchingDefLower.tagalog.toLowerCase() !== defUpper.tagalog.toLowerCase()) {
              const partsKeep = matchingDefLower.tagalog.split(/[\/;,\.]+/).map(p => p.trim()).filter(Boolean);
              const partsMerge = defUpper.tagalog.split(/[\/;,\.]+/).map(p => p.trim()).filter(Boolean);
              const allParts = Array.from(new Set([...partsKeep, ...partsMerge]));
              mergedTagalog = allParts.join('; ');
            }
          }

          let mergedNotes = matchingDefLower.notes;
          if (defUpper.notes && defUpper.notes.trim() !== '') {
            if (!matchingDefLower.notes || matchingDefLower.notes.trim() === '') {
              mergedNotes = defUpper.notes;
            } else if (matchingDefLower.notes.toLowerCase() !== defUpper.notes.toLowerCase()) {
              mergedNotes = `${matchingDefLower.notes.trim()}; ${defUpper.notes.trim()}`;
            }
          }

          await prisma.definition.update({
            where: { id: matchingDefLower.id },
            data: {
              dialect: mergedDialect,
              synonyms: mergedSynonyms,
              tagalog: mergedTagalog,
              notes: mergedNotes
            }
          });

          // 1. Merge example sentences
          for (const exUpper of defUpper.exampleSentences) {
            const hasIdenticalExample = matchingDefLower.exampleSentences.some(ex => 
              matchLower(ex.bikol, exUpper.bikol)
            );
            if (!hasIdenticalExample) {
              console.log(`    * Re-linking unique example: "${exUpper.bikol}"`);
              await prisma.exampleSentence.update({
                where: { id: exUpper.id },
                data: { definitionId: matchingDefLower.id }
              });
            }
          }

          // 2. Merge conjugations (unique on definitionId, tense, focus)
          for (const conjUpper of defUpper.conjugations) {
            const matchingConjLower = matchingDefLower.conjugations.find(c => 
              matchLower(c.tense, conjUpper.tense) && matchLower(c.focus, conjUpper.focus)
            );

            if (!matchingConjLower) {
              console.log(`    * Re-linking unique conjugation: tense="${conjUpper.tense}", focus="${conjUpper.focus}"`);
              await prisma.conjugation.update({
                where: { id: conjUpper.id },
                data: { definitionId: matchingDefLower.id }
              });
              matchingDefLower.conjugations.push(conjUpper);
            } else {
              const formKeep = (matchingConjLower.form || '').trim();
              const formMerge = (conjUpper.form || '').trim();

              if (formKeep.toLowerCase() !== formMerge.toLowerCase() && formMerge !== '') {
                let mergedForm = formKeep;
                if (!formKeep) {
                  mergedForm = formMerge;
                } else {
                  const partsKeep = formKeep.split(/[\/;,\.]+/).map(p => p.trim()).filter(Boolean);
                  const partsMerge = formMerge.split(/[\/;,\.]+/).map(p => p.trim()).filter(Boolean);
                  const allParts = Array.from(new Set([...partsKeep, ...partsMerge]));
                  mergedForm = allParts.join('; ');
                }

                await prisma.conjugation.update({
                  where: { id: matchingConjLower.id },
                  data: { form: mergedForm }
                });
                matchingConjLower.form = mergedForm;
                console.log(`    * Merged conjugation forms side-by-side: "${formKeep}" + "${formMerge}" ➡️ "${mergedForm}"`);
              } else {
                console.log(`    * Removed redundant duplicate conjugation with identical form: "${formKeep}"`);
              }

              // Always delete the redundant conjugation to satisfy constraint
              await prisma.conjugation.delete({
                where: { id: conjUpper.id }
              });
            }
          }

          // Delete the redundant upper definition
          await prisma.definition.delete({
            where: { id: defUpper.id }
          });
        }
      }

      // Delete the capitalized root (cascading deletes will handle any remaining relations)
      await prisma.root.delete({
        where: { id: rootUpper.id }
      });
      rootsMergedCount++;
      console.log(`  - Capitalized Root "${rootUpper.bikol}" safely removed.`);
    } else if (rootUpper && !rootLower) {
      // If for some reason only the capitalized root exists, rename it to lowercase
      console.log(`  - Only capitalized root exists. Renaming to lowercase...`);
      await prisma.root.update({
        where: { id: rootUpper.id },
        data: { bikol: wordLower.bikol ?? undefined }
      });
      rootsMergedCount++;
    }
  }

  console.log('\n==================================================');
  console.log('🏁 DEDUPLICATION FINISHED SUCCESSFULLY!');
  console.log(`🎉 Merged ${wordsMergedCount} Word records in 'Word' table.`);
  console.log(`🎉 Merged ${rootsMergedCount} Root records in 'Root' table.`);
  console.log('==================================================');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
