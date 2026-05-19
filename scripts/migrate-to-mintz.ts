import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';

const JSON_PATH = path.join(process.cwd(), 'data/mintz_verbs_extracted.json');

/**
 * Normalizes a string by removing Bikol accents/diacritics for insensitive matching.
 */
function normalizeBikol(str: string): string {
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
      // Find matching extracted data (Accent-insensitive)
      const enrichment = enrichmentMap.get(normalizeBikol(word.bikol));

      // 3. Upsert Root (Idempotency check by 'bikol')
      // Note: We use upsert to prevent duplicates if script is re-run.
      // We search by 'bikol' string as it's our primary anchor.
      
      const existingRoot = await prisma.root.findFirst({
        where: { bikol: word.bikol }
      });

      let rootId: string;

      if (!existingRoot) {
        const root = await prisma.root.create({
          data: {
            bikol: word.bikol,
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

      // 4. Create Definition
      // Definitions are always created for each legacy Word entry
      await prisma.definition.create({
        data: {
          rootId: rootId,
          english: word.english,
          dialect: word.dialect,
          synonyms: word.synonyms,
          tagalog: word.tagalog,
          aiConfidence: word.confidence || 1.0,
          source_url: word.source_url,
          affixPair: enrichment?.affixPair || 'UNKNOWN',
          focusType: enrichment?.focusType || 'UNKNOWN',
          series: enrichment?.series || 'REGULAR',
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
