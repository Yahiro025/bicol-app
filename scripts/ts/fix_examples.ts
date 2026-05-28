import 'dotenv/config';
import { prisma } from '../../lib/prisma';

function stripOuterQuotes(str: string | null): string | null {
  if (!str) return null;
  let cleaned = str.trim();
  
  // Recursively remove nested outer quotes
  let changed = true;
  while (changed) {
    changed = false;
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.substring(1, cleaned.length - 1).trim();
      changed = true;
    }
    if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
      cleaned = cleaned.substring(1, cleaned.length - 1).trim();
      changed = true;
    }
  }
  return cleaned;
}

async function main() {
  console.log('🧹 Starting Example Sentence Cleanup & Enhancements...');

  // --- STEP 1: Clean outer quotes in ExampleSentence table ---
  const exampleSentences = await prisma.exampleSentence.findMany();
  console.log(`📖 Loaded ${exampleSentences.length} records from 'ExampleSentence' table.`);

  let ESUpdated = 0;
  for (const es of exampleSentences) {
    const cleanBikol = stripOuterQuotes(es.bikol);
    const cleanEnglish = stripOuterQuotes(es.english);

    if (cleanBikol !== es.bikol || cleanEnglish !== es.english) {
      await prisma.exampleSentence.update({
        where: { id: es.id },
        data: {
          bikol: cleanBikol,
          english: cleanEnglish
        }
      });
      ESUpdated++;
    }
  }
  console.log(`✅ Stripped outer quotes from ${ESUpdated} records in 'ExampleSentence' table.`);

  // --- STEP 2: Clean outer quotes in legacy Word table ---
  const words = await prisma.word.findMany();
  console.log(`📖 Loaded ${words.length} records from legacy 'Word' table.`);

  let WordUpdated = 0;
  for (const w of words) {
    const cleanBikol = stripOuterQuotes(w.example_bikol);
    const cleanEnglish = stripOuterQuotes(w.example_english);

    if (cleanBikol !== w.example_bikol || cleanEnglish !== w.example_english) {
      await prisma.word.update({
        // Word id is BigInt
        where: { id: w.id },
        data: {
          example_bikol: cleanBikol,
          example_english: cleanEnglish
        }
      });
      WordUpdated++;
    }
  }
  console.log(`✅ Stripped outer quotes from ${WordUpdated} records in legacy 'Word' table.`);

  // --- STEP 3: Enhance 'bakal' examples to feature 'si' and 'ni' class markers ---
  console.log('\n🎨 Enhancing "bakal" examples with "si" and "ni" particles...');

  // Find root record for 'bakal'
  const rootBakal = await prisma.root.findFirst({
    where: { bikol: { equals: 'bakal', mode: 'insensitive' } },
    include: {
      definitions: {
        include: {
          exampleSentences: true
        }
      }
    }
  });

  if (rootBakal) {
    console.log(`📍 Found root 'bakal' (ID: ${rootBakal.id})`);
    
    // Find the Central Bikol definition (usually "to purchase; to buy")
    const centralBikolDef = rootBakal.definitions.find(d => 
      d.dialect?.toLowerCase().includes('central') || 
      d.english?.toLowerCase().includes('purchase')
    ) || rootBakal.definitions[0]; // fallback to first def if not found

    if (centralBikolDef) {
      console.log(`📍 Found target definition: "${centralBikolDef.english}" (ID: ${centralBikolDef.id})`);

      // Delete existing example sentences for this definition to overwrite cleanly
      if (centralBikolDef.exampleSentences.length > 0) {
        await prisma.exampleSentence.deleteMany({
          where: { definitionId: centralBikolDef.id }
        });
        console.log(`   - Removed old example sentences.`);
      }

      // Add high-quality 'si' and 'ni' examples
      await prisma.exampleSentence.createMany({
        data: [
          {
            definitionId: centralBikolDef.id,
            bikol: 'Nagbakal si Maria nin tinapay.',
            english: 'Maria bought some bread.'
          },
          {
            definitionId: centralBikolDef.id,
            bikol: 'Binakal ni Maria an libro.',
            english: 'Maria bought the book.'
          }
        ]
      });
      console.log('   - Added "si" example: "Nagbakal si Maria nin tinapay."');
      console.log('   - Added "ni" example: "Binakal ni Maria an libro."');
    }
  }

  // Update legacy 'Word' table entry for 'bakal' as well
  const legacyWordBakal = await prisma.word.findFirst({
    where: { bikol: { equals: 'bakal', mode: 'insensitive' } }
  });

  if (legacyWordBakal) {
    await prisma.word.update({
      where: { id: legacyWordBakal.id },
      data: {
        example_bikol: 'Nagbakal si Maria nin tinapay.',
        example_english: 'Maria bought some bread.'
      }
    });
    console.log('✅ Updated legacy Word entry for "bakal" with "si" example.');
  }

  console.log('\n🎉 ALL SENTENCE CLEANUP & GRAMMAR ENHANCEMENTS COMPLETED SUCCESSFULLY!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
