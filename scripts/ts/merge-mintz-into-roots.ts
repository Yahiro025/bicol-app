/**
 * Merge Script: Import Mintz Dictionary Data into Roots + Definitions
 *
 * Reads all entries from `bikol_dictionary` (Mintz PDF) and merges them
 * into `roots`, `definitions`, and `example_sentences` with source tracking
 * and deduplication.
 *
 * PREREQUISITE (One-time): Run this SQL in Supabase SQL Editor:
 *   ALTER TABLE "definitions" ADD COLUMN IF NOT EXISTS "source" TEXT DEFAULT 'unknown';
 *
 * Usage: bun run scripts/merge-mintz-into-roots.ts
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = 'https://ayvxqbxnrbcgbffrzbia.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dnhxYnhucmJjZ2JmZnJ6YmlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIwOTMwMCwiZXhwIjoyMDkyNzg1MzAwfQ.VmOqtJOQ4NnqO4cnMPNPa-ABq_xUZlrbZYl8V6nUUc4';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ─── Helpers ───────────────────────────────────────────────────────────────────

function uid(): string {
  return crypto.randomUUID();
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’'´`]/g, '')
    .trim();
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Fetch All (Paginated) ─────────────────────────────────────────────────────

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

// ─── Normalize Definition Text ─────────────────────────────────────────────────

function defKey(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

// ─── Batch Upsert ──────────────────────────────────────────────────────────────

async function batchInsert(table: string, rows: any[], batchSize = 100): Promise<number> {
  let inserted = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase
      .from(table as any)
      .insert(batch as any);

    if (error) {
      // Retry one-by-one
      console.error(`  ⚠️  Batch insert error on ${table} (row ${i}): ${error.message}`);
      for (const row of batch) {
        const { error: singleErr } = await supabase
          .from(table as any)
          .insert(row as any);
        if (singleErr) {
          console.error(`     Failed single insert: ${singleErr.message} — skipping`);
        } else {
          inserted++;
        }
        await sleep(50);
      }
    } else {
      inserted += batch.length;
    }

    if (i % 500 === 0 && i > 0) {
      console.log(`  ${inserted}/${rows.length} inserted into ${table}...`);
    }
    await sleep(150);
  }

  return inserted;
}

// ─── Check Source Column ───────────────────────────────────────────────────────

async function checkSourceColumn(): Promise<boolean> {
  const { error } = await supabase.from('definitions').select('source').limit(1);
  return !error;
}

// ─── Infer Part of Speech ──────────────────────────────────────────────────────

function inferPos(entry: any): string | null {
  if (!entry.definitions || !Array.isArray(entry.definitions)) return null;
  // Check if any definition has a grammatical tag
  for (const d of entry.definitions) {
    if (d.grammatical) return d.grammatical;
  }
  return null;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

interface MintzDef {
  definition: string;
  examples?: { bikol: string; english: string }[];
  homograph?: string;
  grammatical?: string;
  cross_reference?: string;
  notes?: string;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   MERGE: Mintz Dictionary → Roots + Definitions        ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // ── Step 0: Check schema ──
  console.log('🔍 Step 0: Checking schema...');
  const hasSource = await checkSourceColumn();
  if (!hasSource) {
    console.log('\n⚠️  Missing source column on definitions table.');
    console.log('   Run this SQL in Supabase SQL Editor first:\n');
    console.log('   ALTER TABLE "definitions" ADD COLUMN IF NOT EXISTS "source" TEXT DEFAULT \'unknown\';\n');
    process.exit(1);
  }
  console.log('  ✅ Source column exists.\n');

  // ── Step 1: Fetch data ──
  console.log('🔍 Step 1: Fetching data from Supabase...\n');

  const [mintzEntries, existingRoots, existingDefs] = await Promise.all([
    fetchAll('bikol_dictionary', 'id, headword, definitions, book_page, extracted_with_model'),
    fetchAll('roots', 'id, bikol, pos'),
    fetchAll('definitions', 'id, rootId, english, source, source_url'),
  ]);

  // ── Step 2: Build lookup maps ──
  console.log('🔍 Step 2: Building dedup lookup maps...\n');

  // Normalized bikol → root ID map
  const rootLookup = new Map<string, string>();
  for (const r of existingRoots) {
    const key = normalize(r.bikol);
    if (!rootLookup.has(key)) rootLookup.set(key, r.id);
  }

  // Dedup set: "rootId::normalizedEng" for existing definitions
  const existingDefSet = new Set<string>();
  for (const d of existingDefs) {
    if (d.english) {
      existingDefSet.add(`${d.rootId}::${defKey(d.english)}`);
      if (d.source === 'mintz_book') {
        existingDefSet.add(`${d.rootId}::mintz::${defKey(d.english)}`);
      }
    }
  }

  // ── Step 3: Process entries ──
  console.log('🔍 Step 3: Processing entries...\n');

  // Batch structures
  const rootsToCreate: { id: string; bikol: string; pos: string | null; createdAt: string; updatedAt: string }[] = [];
  const defsToCreate: any[] = [];
  const sentsToCreate: any[] = [];

  // Track which headwords we've already scheduled for root creation
  const scheduledRoots = new Map<string, string>(); // normalized -> id

  let matched = 0;
  let skippedDups = 0;
  let processed = 0;

  for (const entry of mintzEntries) {
    processed++;
    const headword = (entry.headword || '').trim();
    if (!headword) continue;

    const nHead = normalize(headword);
    const defs: MintzDef[] = (Array.isArray(entry.definitions) ? entry.definitions : [entry.definitions].filter(Boolean));

    // ── Resolve root ──
    let rootId = rootLookup.get(nHead) || scheduledRoots.get(nHead);

    if (!rootId) {
      // Create new root
      rootId = uid();
      rootsToCreate.push({
        id: rootId,
        bikol: headword,
        pos: inferPos(entry),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      scheduledRoots.set(nHead, rootId);
    } else {
      matched++;
    }

    // ── Process definitions ──
    for (const md of defs) {
      if (!md.definition) continue;

      const nDef = defKey(md.definition);
      const dedupKey = `${rootId}::mintz::${nDef}`;

      if (existingDefSet.has(dedupKey)) {
        skippedDups++;
        continue;
      }

      // Mintz definition could have the same text as a Wiktionary one, 
      // but we still want to add it with the mintz source badge
      const defId = uid();
      defsToCreate.push({
        id: defId,
        rootId,
        english: md.definition,
        source: 'mintz_book',
        source_url: entry.book_page ? `Mintz Dictionary, p.${entry.book_page}` : 'Mintz Dictionary',
        aiConfidence: 1.0,
        affixPair: 'UNKNOWN',
        focusType: 'UNKNOWN',
        series: 'REGULAR',
        isVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      existingDefSet.add(dedupKey);

      // ── Process examples ──
      const examples = md.examples || [];
      for (const ex of examples) {
        if (ex.bikol && ex.english) {
          sentsToCreate.push({
            id: uid(),
            definitionId: defId,
            bikol: ex.bikol,
            english: ex.english,
            source: 'mintz_book',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    if (processed % 500 === 0) {
      console.log(`  Processed ${processed}/${mintzEntries.length}...`);
    }
  }

  // ── Statistics ──
  console.log(`\n📊 Processing Summary:`);
  console.log(`  Entries processed:     ${processed}`);
  console.log(`  Roots matched:         ${matched}`);
  console.log(`  New roots to create:   ${rootsToCreate.length}`);
  console.log(`  New definitions:       ${defsToCreate.length}`);
  console.log(`  Duplicates skipped:    ${skippedDups}`);
  console.log(`  Example sentences:     ${sentsToCreate.length}\n`);

  if (rootsToCreate.length === 0 && defsToCreate.length === 0) {
    console.log('✅ Nothing to insert. All Mintz data is already merged!\n');
    return;
  }

  // ── Step 4: Insert ──
  console.log('🔍 Step 4: Inserting data...\n');

  if (rootsToCreate.length > 0) {
    console.log(`  Creating ${rootsToCreate.length} roots...`);
    const created = await batchInsert('roots', rootsToCreate);
    console.log(`  ✅ ${created} roots inserted.\n`);
  }

  if (defsToCreate.length > 0) {
    console.log(`  Creating ${defsToCreate.length} definitions...`);
    const created = await batchInsert('definitions', defsToCreate);
    console.log(`  ✅ ${created} definitions inserted.\n`);
  }

  if (sentsToCreate.length > 0) {
    console.log(`  Creating ${sentsToCreate.length} example sentences...`);
    const created = await batchInsert('example_sentences', sentsToCreate);
    console.log(`  ✅ ${created} example sentences inserted.\n`);
  }

  // ── Final Summary ──
  console.log('══════════════════════════════════════════════════════════');
  console.log('📋 FINAL SUMMARY');
  console.log('══════════════════════════════════════════════════════════\n');
  console.log(`  Entries processed:     ${processed}`);
  console.log(`  Roots matched:         ${matched}`);
  console.log(`  New roots:             ${rootsToCreate.length}`);
  console.log(`  New definitions:       ${defsToCreate.length}`);
  console.log(`  Duplicates skipped:    ${skippedDups}`);
  console.log(`  Example sentences:     ${sentsToCreate.length}\n`);
  console.log('🎉 Merge complete!\n');
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
