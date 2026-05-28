/**
 * Comprehensive Supabase Database Analysis
 * Queries all tables and analyzes structure + data
 */

const SUPABASE_URL = 'https://ayvxqbxnrbcgbffrzbia.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dnhxYnhucmJjZ2JmZnJ6YmlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIwOTMwMCwiZXhwIjoyMDkyNzg1MzAwfQ.VmOqtJOQ4NnqO4cnMPNPa-ABq_xUZlrbZYl8V6nUUc4';

const tablesToCheck = [
  { name: 'bikol_dictionary', priority: 'HIGH - User specifically asked about this' },
  { name: 'words' },
  { name: 'roots' },
  { name: 'definitions' },
  { name: 'conjugations' },
  { name: 'example_sentences' },
  { name: 'user_submissions' },
  { name: 'user_flashcards' },
  { name: 'dialogue_scenarios' },
  { name: 'profiles' },
  { name: 'users' },
  { name: 'word_of_the_day' },
  { name: 'favorites' },
  { name: 'quiz_results' },
  { name: 'learning_progress' },
  { name: 'categories' },
  { name: 'tags' },
];

async function query(table: string, params = ''): Promise<any> {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=*${params ? '&' + params : ''}`;
  const res = await fetch(url, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text.substring(0, 200)}`);
  }
  return res.json();
}

async function countRows(table: string): Promise<number> {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=count`;
  const res = await fetch(url, {
    method: 'HEAD',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': 'count=exact',
    },
  });
  const range = res.headers.get('content-range') || '';
  const count = parseInt(range.split('/')[1] || '0', 10);
  return isNaN(count) ? 0 : count;
}

function analyzeDefinitions(defs: any): any[] {
  if (Array.isArray(defs)) return defs;
  if (typeof defs === 'object' && defs !== null) return [defs];
  return [];
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║     SUPABASE DATABASE - COMPREHENSIVE ANALYSIS      ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  const foundTables: { name: string; count: number; columns: string[] }[] = [];

  // Step 1: Discover tables
  console.log('📋 STEP 1: Discovering all tables...\n');
  
  for (const t of tablesToCheck) {
    try {
      const count = await countRows(t.name);
      if (count > 0 || (await query(t.name, 'limit=1')).length >= 0) {
        const sample = await query(t.name, 'limit=1');
        const columns = sample.length > 0 ? Object.keys(sample[0]) : [];
        foundTables.push({ name: t.name, count, columns });
        const flag = t.priority ? ` ⭐ ${t.priority}` : '';
        console.log(`  ✅ ${t.name}: ${count.toLocaleString()} rows (${columns.length} cols)${flag}`);
      }
    } catch (e: any) {
      // Table doesn't exist
    }
  }

  console.log(`\n  📊 Found ${foundTables.length} tables\n`);

  // Step 2: Detailed analysis of each table
  for (const table of foundTables) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 TABLE: ${table.name}`);
    console.log(`   Rows: ${table.count.toLocaleString()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
      // Get all rows for small tables, or a sample for large ones
      const limit = table.count > 200 ? 200 : table.count || 1;
      const rows = await query(table.name, `limit=${limit}`);

      if (rows.length === 0) {
        console.log('  (empty table)\n');
        continue;
      }

      const columns = Object.keys(rows[0]);
      console.log(`  Columns: ${columns.join(', ')}\n`);

      // Analyze each column
      console.log('  Column Analysis:');
      for (const col of columns) {
        const vals = rows.map((r: any) => r[col]);
        const nullCount = vals.filter((v: any) => v === null || v === undefined).length;
        const uniqueVals = new Set(vals.filter((v: any) => v !== null && v !== undefined).map((v: any) => {
          return typeof v === 'object' ? JSON.stringify(v) : String(v);
        }));
        
        const pctFilled = Math.round(((rows.length - nullCount) / rows.length) * 100);
        
        // Determine type
        const nonNullVals = vals.filter((v: any) => v !== null && v !== undefined);
        let type = 'unknown';
        if (nonNullVals.length > 0) {
          const firstVal = nonNullVals[0];
          if (typeof firstVal === 'number') type = Number.isInteger(firstVal) ? 'integer' : 'float';
          else if (typeof firstVal === 'boolean') type = 'boolean';
          else if (typeof firstVal === 'object') type = 'JSON/object';
          else if (typeof firstVal === 'string') {
            const maxLen = Math.max(...nonNullVals.map((v: any) => String(v).length));
            type = maxLen > 100 ? `text (max ${maxLen} chars)` : `string (max ${maxLen} chars)`;
          }
        }

        // Sample values
        const sampleVals = [...uniqueVals].slice(0, 5);
        
        console.log(`  ${col}:`);
        console.log(`    Type: ${type}`);
        console.log(`    Filled: ${pctFilled}% (${rows.length - nullCount}/${rows.length})`);
        console.log(`    Unique: ${uniqueVals.size} values`);
        if (sampleVals.length > 0 && sampleVals.length < 20) {
          const displayVals = sampleVals.map((v: any) => {
            if (typeof v === 'object') return JSON.stringify(v).substring(0, 100);
            return String(v).substring(0, 100);
          });
          console.log(`    Sample: ${displayVals.join(', ')}`);
        }
        console.log('');
      }

    } catch (err: any) {
      console.log(`  ❌ Error analyzing: ${err.message}\n`);
    }
  }

  // Step 3: Deep dive into bikol_dictionary
  const bd = foundTables.find(t => t.name === 'bikol_dictionary');
  if (bd) {
    console.log('══════════════════════════════════════════════════════');
    console.log('🔍 DEEP DIVE: bikol_dictionary');
    console.log('══════════════════════════════════════════════════════\n');

    try {
      const allRows = await query('bikol_dictionary', 'limit=5000');
      const total = allRows.length;
      console.log(`  Total rows fetched: ${total}\n`);

      // Extract all unique models used
      const models = new Set(allRows.map((r: any) => r.extracted_with_model).filter(Boolean));
      console.log(`  AI Models used: ${[...models].join(', ')}\n`);

      // Page range
      const pages = allRows.map((r: any) => r.book_page).filter((p: any) => p !== null);
      console.log(`  Page range: ${Math.min(...pages)} - ${Math.max(...pages)} (from Mintz PDF)\n`);

      // Headword stats
      const headwords = allRows.map((r: any) => r.headword).filter(Boolean);
      const uniqueHeadwords = new Set(headwords.map((h: string) => h.toLowerCase().trim()));
      console.log(`  Headwords: ${headwords.length} total, ${uniqueHeadwords.size} unique\n`);

      // Alphabetical distribution
      const letterCounts: Record<string, number> = {};
      for (const hw of headwords) {
        const first = hw.trim().charAt(0).toUpperCase();
        if (first) letterCounts[first] = (letterCounts[first] || 0) + 1;
      }
      // Also check 'NG' specifically
      let ngCount = 0;
      for (const hw of headwords) {
        if (hw.trim().toLowerCase().startsWith('ng')) ngCount++;
      }
      
      console.log('  Alphabetical distribution:');
      const sorted = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÑ'.split('');
      for (const letter of sorted) {
        if (letterCounts[letter]) {
          const bar = '█'.repeat(Math.round(letterCounts[letter] / 10));
          console.log(`    ${letter}: ${letterCounts[letter]} ${bar}`);
        }
      }
      if (ngCount > 0) {
        console.log(`    NG (as letter): ${ngCount} entries (subset of N)\n`);
      }

      // Definition stats
      let totalDefs = 0;
      let defsWithExamples = 0;
      let defsWithMultiple = 0;
      let totalExamples = 0;

      for (const row of allRows) {
        const defs = analyzeDefinitions(row.definitions);
        totalDefs += defs.length;
        if (defs.length > 1) defsWithMultiple++;
        for (const d of defs) {
          if (d.examples && Array.isArray(d.examples) && d.examples.length > 0) {
            defsWithExamples++;
            totalExamples += d.examples.length;
          }
        }
      }

      console.log(`  Definitions: ${totalDefs} total`);
      console.log(`  Entries with multiple definitions: ${defsWithMultiple}`);
      console.log(`  Definitions with examples: ${defsWithExamples}`);
      console.log(`  Total example sentences: ${totalExamples}\n`);

      // Top examples
      console.log('  Sample entries:');
      for (let i = 0; i < Math.min(5, allRows.length); i++) {
        const row = allRows[i];
        const defs = analyzeDefinitions(row.definitions);
        console.log(`  --- "${row.headword}" (p.${row.book_page}) ---`);
        for (const d of defs) {
          const defText = d.definition || '';
          const truncated = defText.length > 100 ? defText.substring(0, 100) + '...' : defText;
          console.log(`    Def: ${truncated}`);
          if (d.examples && Array.isArray(d.examples)) {
            for (const ex of d.examples.slice(0, 2)) {
              console.log(`    Ex: ${ex.bikol || ''} = ${ex.english || ''}`);
            }
          }
        }
        console.log('');
      }

    } catch (err: any) {
      console.log(`  ❌ Error: ${err.message}\n`);
    }
  }

  // Summary
  console.log('══════════════════════════════════════════════════════');
  console.log('📋 SUMMARY');
  console.log('══════════════════════════════════════════════════════\n');
  console.log(`  Total tables: ${foundTables.length}`);
  console.log(`  Total data tables: ${foundTables.filter(t => t.count > 0).length}`);
  
  const grandTotal = foundTables.reduce((sum, t) => sum + t.count, 0);
  console.log(`  Grand total records: ${grandTotal.toLocaleString()}\n`);

  console.log('  Table overview:');
  for (const t of foundTables) {
    const colCount = t.columns.length;
    console.log(`    ${t.name.padEnd(25)} ${String(t.count.toLocaleString()).padStart(10)} rows  (${colCount} cols)`);
  }
  console.log('\n══════════════════════════════════════════════════════');
}

main().catch(console.error);
