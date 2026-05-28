import { prisma } from '../../lib/prisma';
import fs from 'fs';
import path from 'path';
import { extractRoot, conjugateBikolVerb } from '../../lib/conjugator';

const JSON_PATH = path.join(process.cwd(), 'data/mintz_verbs_extracted.json');

/**
 * Normalizes a string by removing Bikol accents/diacritics for insensitive matching.
 */
function normalizeBikol(str: string): string {
  if (!str) return '';
  return str.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’\']/g, "");
}

async function main() {
  console.log('🚀 Starting migration to Mintz schema...');

  // 1. Load PDF Extracted Data
  let extractedVerbs: any[] = [];
  if (fs.existsSync(JSON_PATH)) {
    const rawData = fs.readFileSync(JSON_PATH, 'utf-8');
    extractedVerbs = JSON.parse(rawData);
    console.log(`📦 Loaded ${extractedVerbs.length} verbs from PDF extraction.`);
  } else {
    console.warn('⚠️ No PDF extraction JSON found. Skipping enrichment.');
  }

  // Pre-process extracted verbs for faster matching
  const enrichmentMap = new Map();
  extractedVerbs.forEach(v => {
    const key = normalizeBikol(v.headword);
    if (!enrichmentMap.has(key)) {
      enrichmentMap.set(key, v);
    }
  });

  // 2. Fetch existing words
  const words = await prisma.word.findMany();
  console.log(`📖 Found ${words.length} records in legacy table.`);

  let migratedCount = 0;

  for (const word of words) {
    if (!word.bikol) {
      console.warn(`⚠️ Skipping record with ID ${word.id} because bikol is null.`);
      continue;
    }

    try {
      // 2.5 Identify if it's a verb and extract the root
      const isVerb = word.pos?.trim().toUpperCase() === 'VERB';
      const extractedRoot = isVerb ? extractRoot(word.bikol) : word.bikol;

      // Find matching extracted data (Accent-insensitive) using the root
      const enrichment = enrichmentMap.get(normalizeBikol(extractedRoot));
      
      // Use the enrichment headword if found (to preserve accents/metadata)
      const finalRootBikol = enrichment?.headword || extractedRoot;

      // 3. Upsert Root (Idempotency check by 'bikol')
      const existingRoot = await prisma.root.findFirst({
        where: { bikol: finalRootBikol }
      });

      let rootId: string;

      if (!existingRoot) {
        const root = await prisma.root.create({
          data: {
            bikol: finalRootBikol,
            pos: word.pos,
            category: word.category,
            pronunciation: word.pronunciation,
            etymology: word.etymology,
            frequency_rank: word.frequency_rank,
            audio_url: word.audio_url,
          }
        });
        rootId = root.id;
      } else {
        rootId = existingRoot.id;
      }

      // 4. Generate Conjugations
      const affixPair = enrichment?.affixPair || 'UNKNOWN';
      const focusType = enrichment?.focusType || 'UNKNOWN';
      
      const generatedConjugations = (affixPair !== 'UNKNOWN')
        ? conjugateBikolVerb(finalRootBikol, affixPair, focusType)
        : [];

      // 5. Create Definition with Conjugations
      await prisma.definition.create({
        data: {
          rootId: rootId,
          english: word.english,
          dialect: word.dialect,
          synonyms: word.synonyms,
          tagalog: word.tagalog,
          aiConfidence: word.confidence || 1.0,
          source_url: word.source_url,
          affixPair,
          focusType,
          series: enrichment?.series || 'REGULAR',
          conjugations: {
            create: generatedConjugations.map(c => ({
              tense: c.tense,
              focus: c.focus,
              form: c.form
            }))
          },
          exampleSentences: word.example_bikol ? {
            create: {
              bikol: word.example_bikol,
              english: word.example_english,
            }
          } : undefined
        }
      });

      migratedCount++;
      if (migratedCount % 100 === 0) {
        console.log(`✅ Migrated ${migratedCount}/${words.length} records...`);
      }
    } catch (error) {
      console.error(`❌ Failed to migrate "${word.bikol}":`, error);
    }
  }

  console.log(`🏁 Migration complete. ${migratedCount} definitions created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
