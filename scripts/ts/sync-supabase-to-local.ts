/**
 * Sync Script: Copy all data from Supabase to local PostgreSQL
 *
 * Fetches roots, definitions, conjugations, example_sentences, and the legacy
 * words table from Supabase REST API and inserts them into the local database
 * via Prisma raw SQL.
 *
 * Usage: bun run scripts/sync-supabase-to-local.ts
 */

import { createClient } from '@supabase/supabase-js';
import { prisma } from '../../lib/prisma';

const SUPABASE_URL = 'https://ayvxqbxnrbcgbffrzbia.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dnhxYnhucmJjZ2JmZnJ6YmlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIwOTMwMCwiZXhwIjoyMDkyNzg1MzAwfQ.VmOqtJOQ4NnqO4cnMPNPa-ABq_xUZlrbZYl8V6nUUc4';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ─── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAll(table: string, select: string, order = 'id'): Promise<any[]> {
  const all: any[] = [];
  let from = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase
      .from(table as any)
      .select(select)
      .range(from, from + limit - 1)
      .order(order as any);

    if (error) throw new Error(`Error fetching ${table}: ${error.message}`);
    if (!data || data.length === 0) break;

    all.push(...data);
    from += limit;
  }

  return all;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   SYNC: Supabase → Local PostgreSQL                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // ── Step 1: Check local connection ──
  console.log('🔍 Step 1: Checking local database connection...');
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('  ✅ Local PostgreSQL connected.\n');
  } catch (err: any) {
    console.error('  ❌ Cannot connect to local PostgreSQL. Is it running?\n');
    console.error(`  ${err.message}\n`);
    process.exit(1);
  }

  // ── Step 2: Fetch data from Supabase ──
  console.log('🔍 Step 2: Fetching data from Supabase...\n');

  const [roots, definitions, conjugations, exampleSentences, legacyWords] = await Promise.all([
    fetchAll('roots', '*'),
    fetchAll('definitions', '*'),
    fetchAll('conjugations', '*'),
    fetchAll('example_sentences', '*'),
    fetchAll('words', '*'),
  ]);

  console.log(`  Roots:              ${roots.length}`);
  console.log(`  Definitions:        ${definitions.length}`);
  console.log(`  Conjugations:       ${conjugations.length}`);
  console.log(`  Example sentences:  ${exampleSentences.length}`);
  console.log(`  Legacy words:       ${legacyWords.length}\n`);

  // ── Step 3: Check current local state ──
  const localRootCount: any[] = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "roots"`;
  const localDefCount: any[] = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "definitions"`;
  const localCount = Number(localRootCount[0]?.count || 0);
  const localDefs = Number(localDefCount[0]?.count || 0);

  if (localCount > 0 || localDefs > 0) {
    console.log(`⚠️  Local database already has ${localCount} roots and ${localDefs} definitions.`);
    console.log('   Wiping existing data before sync...\n');

    // TRUNCATE roots with CASCADE to recursively drop all dependent tables
    // (definitions → conjugations & example_sentences)
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "roots" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "words"');

    console.log('  ✅ Tables truncated.\n');
  }

  // ── Step 4: Insert all data within a transaction ──
  console.log('🔍 Step 4: Inserting data...\n');

  // Wrap all inserts in a transaction
  await prisma.$transaction(async (tx) => {
    // 4a. Roots
    console.log(`  Inserting ${roots.length} roots...`);
    const rootColumns = ['id', 'bikol', 'pos', 'category', 'pronunciation', 'etymology',
      'frequency_rank', 'audio_url', 'focusClass', 'isTransitive', 'createdAt', 'updatedAt'];
    const rootsInserted = await batchInsertWithTx(tx, 'roots', rootColumns, roots);
    console.log(`  ✅ ${rootsInserted} roots inserted.\n`);

    // 4b. Definitions
    console.log(`  Inserting ${definitions.length} definitions...`);
    const defColumns = ['id', 'rootId', 'english', 'dialect', 'synonyms', 'tagalog',
      'aiConfidence', 'source_url', 'source', 'affixPair', 'focusType', 'series',
      'isVerified', 'notes', 'createdAt', 'updatedAt'];
    const defsInserted = await batchInsertWithTx(tx, 'definitions', defColumns, definitions);
    console.log(`  ✅ ${defsInserted} definitions inserted.\n`);

    // 4c. Conjugations
    if (conjugations.length > 0) {
      console.log(`  Inserting ${conjugations.length} conjugations...`);
      const conjColumns = ['id', 'definitionId', 'tense', 'focus', 'form', 'createdAt', 'updatedAt'];
      const conjInserted = await batchInsertWithTx(tx, 'conjugations', conjColumns, conjugations);
      console.log(`  ✅ ${conjInserted} conjugations inserted.\n`);
    } else {
      console.log('  No conjugations to insert.\n');
    }

    // 4d. Example sentences
    if (exampleSentences.length > 0) {
      console.log(`  Inserting ${exampleSentences.length} example sentences...`);
      const sentColumns = ['id', 'definitionId', 'bikol', 'english', 'source', 'createdAt', 'updatedAt'];
      const sentsInserted = await batchInsertWithTx(tx, 'example_sentences', sentColumns, exampleSentences);
      console.log(`  ✅ ${sentsInserted} example sentences inserted.\n`);
    } else {
      console.log('  No example sentences to insert.\n');
    }

    // 4e. Legacy words (used as fallback in word page)
    if (legacyWords.length > 0) {
      console.log(`  Inserting ${legacyWords.length} legacy words...`);
      const wordColumns = ['id', 'bikol', 'english', 'pos', 'category', 'dialect',
        'example_bikol', 'example_english', 'pronunciation', 'synonyms', 'tagalog',
        'confidence', 'source_url', 'audio_url', 'etymology', 'frequency_rank', 'created_at'];
      const wordsInserted = await batchInsertWithTx(tx, 'words', wordColumns, legacyWords);
      console.log(`  ✅ ${wordsInserted} legacy words inserted.\n`);
    } else {
      console.log('  No legacy words to insert.\n');
    }
  });

  // ── Final Verification ──
  console.log('══════════════════════════════════════════════════════════');
  console.log('📋 VERIFICATION');
  console.log('══════════════════════════════════════════════════════════\n');

  const finalRootCount = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM "roots"`;
  const finalDefCount = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM "definitions"`;
  const finalConjCount = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM "conjugations"`;
  const finalSentCount = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM "example_sentences"`;
  const finalWordCount = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM "words"`;

  console.log(`  Roots:              ${Number(finalRootCount[0]?.count || 0)}`);
  console.log(`  Definitions:        ${Number(finalDefCount[0]?.count || 0)}`);
  console.log(`  Conjugations:       ${Number(finalConjCount[0]?.count || 0)}`);
  console.log(`  Example sentences:  ${Number(finalSentCount[0]?.count || 0)}`);
  console.log(`  Legacy words:       ${Number(finalWordCount[0]?.count || 0)}\n`);

  // Verify source column is populated
  const sourceDistribution = await prisma.$queryRaw<{ source: string | null; count: bigint }[]>`
    SELECT source, COUNT(*) as count FROM "definitions" GROUP BY source ORDER BY count DESC
  `;
  console.log('  Source distribution:');
  for (const row of sourceDistribution) {
    console.log(`    ${row.source || '(null)'}: ${row.count}`);
  }
  console.log();

  if (Number(finalRootCount[0]?.count || 0) === roots.length &&
      Number(finalDefCount[0]?.count || 0) === definitions.length) {
    console.log('✅ Sync complete! All data copied successfully.\n');
  } else {
    console.log('⚠️  Sync completed with some discrepancies (see above).\n');
  }
}

// ─── Transaction-aware batch insert ────────────────────────────────────

async function batchInsertWithTx(
  tx: any,
  table: string,
  columns: string[],
  rows: any[],
  batchSize = 100
): Promise<number> {
  let inserted = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);

    const placeholders = batch.map((_, rowIdx) => {
      const offset = rowIdx * columns.length;
      return `(${columns.map((_, colIdx) => `$${offset + colIdx + 1}`).join(', ')})`;
    }).join(', ');

    const values = batch.flatMap(row => columns.map(col => {
      const val = row[col];
      if (typeof val === 'object' && val !== null) {
        return JSON.stringify(val);
      }
      return val ?? null;
    }));

    const colList = columns.map(c => `"${c}"`).join(', ');
    const sql = `INSERT INTO "${table}" (${colList}) VALUES ${placeholders} ON CONFLICT ("id") DO NOTHING;`;

    try {
      await tx.$executeRawUnsafe(sql, ...values);
      inserted += batch.length;
    } catch (err: any) {
      console.error(`  ⚠️  Batch insert error on ${table} (row ${i}): ${err.message}`);
      for (let ri = 0; ri < batch.length; ri++) {
        const row = batch[ri];
        const singlePlaceholders = columns.map((_, ci) => `$${ci + 1}`).join(', ');
        const singleValues = columns.map(col => {
          const val = row[col];
          if (typeof val === 'object' && val !== null) {
            return JSON.stringify(val);
          }
          return val ?? null;
        });
        const singleSQL = `INSERT INTO "${table}" (${colList}) VALUES (${singlePlaceholders}) ON CONFLICT ("id") DO NOTHING;`;
        try {
          await tx.$executeRawUnsafe(singleSQL, ...singleValues);
          inserted++;
        } catch (singleErr: any) {
          console.error(`     Failed single insert: ${singleErr.message} — skipping`);
        }
        await sleep(25);
      }
    }

    if (i % 500 === 0 || i + batchSize >= rows.length) {
      console.log(`    Inserted ${Math.min(inserted, i + batchSize)}/${rows.length} into ${table}...`);
    }
  }

  return inserted;
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
