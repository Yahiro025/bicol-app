import 'dotenv/config';
import { prisma } from '../../lib/prisma';
import { Groq } from 'groq-sdk';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');
const AUDIT_PROGRESS_FILE = path.join(DATA_DIR, 'audit_progress.json');
const PURGE_QUEUE_FILE = path.join(DATA_DIR, 'purge_queue.json');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'qwen/qwen3-32b';
const BATCH_SIZE = 8;
const DELAY_MS = 15000; // Respect rate limits (at least 15s between requests)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

interface WordRecord {
  id: bigint | string;
  bikol: string;
  english: string | null;
  pos: string | null;
  tagalog: string | null;
}

interface AuditResult {
  bikol: string;
  isBikol: boolean;
  reason: string;
}

function loadJsonArray(filePath: string): string[] {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error(`⚠️ Error loading ${filePath}:`, error);
  }
  return [];
}

function saveJsonArray(filePath: string, data: string[]) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`❌ Error saving ${filePath}:`, error);
  }
}

async function purgeWords(wordsToPurge: string[]) {
  if (wordsToPurge.length === 0) return;
  console.log(`⚡ Executing database purge for ${wordsToPurge.length} words...`);
  let wordsDeleted = 0;
  let rootsDeleted = 0;

  for (const wordToPurge of wordsToPurge) {
    // 1. Delete from legacy table
    const deleteWord = await prisma.word.deleteMany({
      where: { bikol: wordToPurge }
    });
    wordsDeleted += deleteWord.count;

    // 2. Delete from normalized table (cascades automatically to definition, conjugation, example)
    const deleteRoot = await prisma.root.deleteMany({
      where: { bikol: wordToPurge }
    });
    rootsDeleted += deleteRoot.count;

    console.log(`- Deleted "${wordToPurge}" from database.`);
  }
  console.log(`\n🎉 Success! Purged ${wordsDeleted} legacy Word records and ${rootsDeleted} Root records.`);
}

async function auditBatch(batch: WordRecord[], maxRetries = 5): Promise<AuditResult[]> {
  const promptWords = batch.map((w, index) => {
    return `${index + 1}. Word: "${w.bikol}" | POS: "${w.pos || 'unknown'}" | English Definition: "${w.english || ''}" | Tagalog translation: "${w.tagalog || ''}"`;
  }).join('\n');

  const systemPrompt = `You are an expert linguist specializing in Philippine languages, specifically Central Bikol and Tagalog.
Your task is to analyze a list of words that are currently in our Bikol dictionary and determine if they are authentic Bikol words for their specified English translation.

A word-definition pair is:
1. "Authentic Bikol" (isBikol = true) if:
   - It is a native Bikol word (e.g., "bakal" with definition "buy").
   - It is a shared cognate that is naturally and commonly used in authentic everyday Bikol with that definition (e.g., "langit" meaning "sky/heaven", or "mata" meaning "eye").
2. "Non-Bikol/Tagalog" (isBikol = false) if:
   - It is purely Tagalog or another language, and is NOT authentic/natural to everyday Bikol with that definition (e.g., "kaakbay"/"kaakboy" with definition "someone whose arm is placed on one's shoulder"). If the native Bikol word for that definition is completely different, or if Bikol never uses that word for that definition, it is NOT authentic Bikol.

Analyze the list of words provided. For each word in the list, you MUST respond with a JSON array containing objects matching this schema:
[
  {
    "bikol": "word",
    "isBikol": true/false,
    "reason": "short explanation of your classification (e.g., 'Shared cognate natural in Bikol' or 'Pure Tagalog, native Bikol is X')"
  }
]
Your response must be ONLY the valid JSON array, with no other text, markdown formatting blocks (like \`\`\`json), or conversational filler.`;

  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: promptWords }
        ],
        model: MODEL,
        temperature: 0.1,
        max_tokens: 2000
      });

      const content = completion.choices[0]?.message?.content?.trim() || '';
      const cleanContent = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      const cleanJson = cleanContent.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      try {
        const results = JSON.parse(cleanJson) as AuditResult[];
        return results;
      } catch (parseError) {
        console.error(`❌ Failed to parse JSON from batch response.\nRaw content:\n${content}\nCleaned JSON:\n${cleanJson}`);
        throw parseError;
      }
    } catch (error: any) {
      const isRateLimit = error?.status === 429 || 
                          (error?.message && error.message.includes('429')) ||
                          (error?.message && error.message.toLowerCase().includes('rate limit')) ||
                          (JSON.stringify(error).toLowerCase().includes('rate_limit_exceeded')) ||
                          (JSON.stringify(error).toLowerCase().includes('rate limit reached'));

      if (isRateLimit) {
        attempt++;
        let delaySec = 20; // safe default
        const errMsg = error?.message || error?.error?.message || '';
        const match = errMsg.match(/try again in ([\d\.]+)s/i);
        if (match && match[1]) {
          delaySec = parseFloat(match[1]);
        } else {
          try {
            const str = JSON.stringify(error);
            const jsonMatch = str.match(/try again in ([\d\.]+)s/i);
            if (jsonMatch && jsonMatch[1]) {
              delaySec = parseFloat(jsonMatch[1]);
            }
          } catch (_) {}
        }
        
        // Add a buffer of 2 seconds
        const sleepMs = Math.ceil(delaySec * 1000) + 2000;
        console.warn(`⚠️ Rate limit (429) hit. Retry attempt ${attempt}/${maxRetries}. Sleeping for ${(sleepMs / 1000).toFixed(2)} seconds before retrying batch...`);
        await new Promise(resolve => setTimeout(resolve, sleepMs));
        continue;
      }

      console.error(`❌ Batch audit failed with non-rate-limit error. Error:`, error);
      break;
    }
  }

  // Fallback: Try one-by-one for this batch to ensure we don't skip
  console.log(`🔄 Falling back to single-word audits for the current batch...`);
  const results: AuditResult[] = [];
  for (const w of batch) {
    let singleAttempt = 0;
    let success = false;
    while (singleAttempt < maxRetries && !success) {
      try {
        // Sleep briefly to respect the RPM/TPM limits on sequential individual calls
        await new Promise(resolve => setTimeout(resolve, 2000));

        const singlePrompt = `Word: "${w.bikol}" | POS: "${w.pos || 'unknown'}" | English Definition: "${w.english || ''}" | Tagalog: "${w.tagalog || ''}"`;
        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: singlePrompt }
          ],
          model: MODEL,
          temperature: 0.1,
          max_tokens: 500
        });
        const content = completion.choices[0]?.message?.content?.trim() || '';
        const cleanContent = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        const cleanJson = cleanContent.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
        try {
          const parsed = JSON.parse(cleanJson);
          const item = Array.isArray(parsed) ? parsed[0] : parsed;
          results.push(item);
          success = true;
        } catch (parseError) {
          console.error(`❌ Failed to parse JSON from single-word response for "${w.bikol}".\nRaw content:\n${content}\nCleaned JSON:\n${cleanJson}`);
          throw parseError;
        }
      } catch (err: any) {
        const isRateLimit = err?.status === 429 || 
                            (err?.message && err.message.includes('429')) ||
                            (err?.message && err.message.toLowerCase().includes('rate limit')) ||
                            (JSON.stringify(err).toLowerCase().includes('rate_limit_exceeded')) ||
                            (JSON.stringify(err).toLowerCase().includes('rate limit reached'));

        if (isRateLimit) {
          singleAttempt++;
          let delaySec = 20; // safe default
          const errMsg = err?.message || err?.error?.message || '';
          const match = errMsg.match(/try again in ([\d\.]+)s/i);
          if (match && match[1]) {
            delaySec = parseFloat(match[1]);
          } else {
            try {
              const str = JSON.stringify(err);
              const jsonMatch = str.match(/try again in ([\d\.]+)s/i);
              if (jsonMatch && jsonMatch[1]) {
                delaySec = parseFloat(jsonMatch[1]);
              }
            } catch (_) {}
          }
          const sleepMs = Math.ceil(delaySec * 1000) + 2000;
          console.warn(`⚠️ Rate limit (429) hit during single-word retry. Attempt ${singleAttempt}/${maxRetries}. Sleeping for ${(sleepMs / 1000).toFixed(2)} seconds...`);
          await new Promise(resolve => setTimeout(resolve, sleepMs));
          continue;
        }

        // Safe default: assume true so we don't delete incorrectly
        console.error(`❌ Single-word audit failed for "${w.bikol}". Assuming true to prevent accidental deletion. Error:`, err);
        results.push({ bikol: w.bikol, isBikol: true, reason: 'Failed to analyze' });
        success = true;
      }
    }
  }
  return results;
}

async function main() {
  console.log('🤖 Starting Interactive Bikol/Tagalog Dictionary Auditor...');
  console.log(`Using model: ${MODEL}`);

  // Load both files
  const auditedWords = loadJsonArray(AUDIT_PROGRESS_FILE);
  const purgeQueue = loadJsonArray(PURGE_QUEUE_FILE);

  console.log(`ℹ️ Loaded ${auditedWords.length} already audited words.`);
  console.log(`ℹ️ Loaded ${purgeQueue.length} pending purge words.`);

  // Before starting the audit, perform a clean purge:
  if (purgeQueue.length > 0) {
    console.log(`\n🧹 Performing clean purge of ${purgeQueue.length} pending words in purge queue...`);
    await purgeWords(purgeQueue);
    saveJsonArray(PURGE_QUEUE_FILE, []);
    purgeQueue.length = 0; // Clear the in-memory array
  }

  // Fetch all legacy words to audit, excluding audited words
  const whereClause = auditedWords.length > 0 ? { bikol: { notIn: auditedWords } } : {};
  const words = await prisma.word.findMany({
    where: whereClause,
    orderBy: { bikol: 'asc' }
  }) as unknown as WordRecord[];

  console.log(`\n📖 Found ${words.length} records remaining to audit in the database.`);

  if (words.length === 0) {
    console.log('🎉 No words remaining to audit! Everything has already been processed.');
    rl.close();
    return;
  }

  for (let i = 0; i < words.length; i += BATCH_SIZE) {
    const batch = words.slice(i, i + BATCH_SIZE);
    console.log(`\n⏳ Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(words.length / BATCH_SIZE)} (Words ${i + 1} to ${Math.min(i + BATCH_SIZE, words.length)})...`);

    const results = await auditBatch(batch);
    
    // Process results
    for (const dbWord of batch) {
      const res = results.find(r => r.bikol.toLowerCase() === dbWord.bikol.toLowerCase());
      
      if (!res) {
        console.warn(`⚠️ No audit result found for word "${dbWord.bikol}". Assuming authentic to be safe.`);
        if (!auditedWords.includes(dbWord.bikol)) {
          auditedWords.push(dbWord.bikol);
          saveJsonArray(AUDIT_PROGRESS_FILE, auditedWords);
        }
        continue;
      }

      if (res.isBikol === true) {
        console.log(`✅ AI: Authentic Bikol -> "${dbWord.bikol}"`);
        if (!auditedWords.includes(dbWord.bikol)) {
          auditedWords.push(dbWord.bikol);
          saveJsonArray(AUDIT_PROGRESS_FILE, auditedWords);
        }
      } else {
        console.log('\n--------------------------------------------------');
        console.log(`⚠️  FLAGGED AS NON-BIKOL/TAGALOG:`);
        console.log(`👉 Word:      "${dbWord.bikol}"`);
        console.log(`👉 POS:       "${dbWord.pos || 'N/A'}"`);
        console.log(`👉 English:   "${dbWord.english || 'N/A'}"`);
        console.log(`👉 Tagalog:   "${dbWord.tagalog || 'N/A'}"`);
        console.log(`👉 AI Reason: ${res.reason}`);
        console.log('--------------------------------------------------');

        const answer = await askQuestion(`❓ Is this a genuine, authentic Bikol word? (y/N): `);
        const cleanAnswer = answer.trim().toLowerCase();
        
        if (cleanAnswer === 'y' || cleanAnswer === 'yes') {
          console.log(`✅ Keeping word: "${dbWord.bikol}"`);
          if (!auditedWords.includes(dbWord.bikol)) {
            auditedWords.push(dbWord.bikol);
            saveJsonArray(AUDIT_PROGRESS_FILE, auditedWords);
          }
        } else {
          console.log(`🗑️  Adding to purge queue: "${dbWord.bikol}"`);
          if (!purgeQueue.includes(dbWord.bikol)) {
            purgeQueue.push(dbWord.bikol);
            saveJsonArray(PURGE_QUEUE_FILE, purgeQueue);
          }
        }
      }
    }

    if (i + BATCH_SIZE < words.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  console.log('\n==================================================');
  console.log(`📋 AUDIT COMPLETED. QUEUED FOR PURGE (${purgeQueue.length} words):`);
  if (purgeQueue.length === 0) {
    console.log('🎉 No words queued for purge. Everything is authentic Bikol!');
    rl.close();
    return;
  }

  purgeQueue.forEach((w, index) => {
    console.log(`${index + 1}. ${w}`);
  });
  console.log('==================================================');

  const finalConfirm = await askQuestion(`⚠️  Are you absolutely sure you want to permanently purge these ${purgeQueue.length} words from BOTH legacy 'Word' and normalized 'Root' tables? (type "PURGE" to execute): `);

  if (finalConfirm.trim() === 'PURGE') {
    await purgeWords(purgeQueue);
    saveJsonArray(PURGE_QUEUE_FILE, []);
  } else {
    console.log('❌ Purge cancelled. Words remain in the purge queue and database.');
  }

  rl.close();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
