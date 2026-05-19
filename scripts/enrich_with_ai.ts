import { prisma } from '../lib/prisma';
import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Mandatory Constraints & Usage Limits
const MODEL = 'qwen-3-32b'; // User-specified Groq ID for Qwen 3 32B
const BATCH_SIZE = 5;
const DELAY_MS = 15000; // 15 seconds between batches to stay under 6K TPM / 60 RPM
const DAILY_LIMIT = 900; // Hard exit at 900 to stay under 1K daily limit

let totalProcessed = 0;

async function enrichBatch(definitions: any[]) {
  const promises = definitions.map(async (def) => {
    if (totalProcessed >= DAILY_LIMIT) return { success: false, limitReached: true };
    
    try {
      const prompt = `Translate the following Bikol word to Tagalog. 
Bikol Root: ${def.root.bikol}
English Definition: ${def.english}
Affix Pair: ${def.affixPair}
Part of Speech: ${def.root.pos}

Provide ONLY the Tagalog translation as a single string. Do not include explanations.`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: MODEL,
        temperature: 0.1, 
      });

      const tagalogTranslation = completion.choices[0]?.message?.content?.trim();

      if (tagalogTranslation) {
        await prisma.definition.update({
          where: { id: def.id },
          data: { 
            tagalog: tagalogTranslation,
            aiConfidence: 0.85 
          },
        });
        totalProcessed++;
        return { success: true, word: def.root.bikol };
      }
    } catch (error) {
      console.error(`❌ AI enrichment failed for ${def.root.bikol}:`, error);
    }
    return { success: false };
  });

  return Promise.all(promises);
}

async function main() {
  console.log('🤖 Starting AI Enrichment Pipeline (Qwen/Groq)...');
  console.log(`📊 Limits: ${BATCH_SIZE} recs/batch | ${DELAY_MS}ms delay | ${DAILY_LIMIT} daily cap`);

  const pendingDefinitions = await prisma.definition.findMany({
    where: {
      tagalog: null,
      isVerified: false,
    },
    include: {
      root: true,
    },
  });

  console.log(`📝 Found ${pendingDefinitions.length} records needing Tagalog enrichment.`);

  for (let i = 0; i < pendingDefinitions.length; i += BATCH_SIZE) {
    if (totalProcessed >= DAILY_LIMIT) {
      console.log(`🛑 Daily limit reached (${totalProcessed}/${DAILY_LIMIT}). Gracefully exiting.`);
      break;
    }

    const batch = pendingDefinitions.slice(i, i + BATCH_SIZE);
    console.log(`🚀 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}... Total processed: ${totalProcessed}`);
    
    await enrichBatch(batch);

    if (i + BATCH_SIZE < pendingDefinitions.length && totalProcessed < DAILY_LIMIT) {
      console.log(`💤 Pausing for ${DELAY_MS}ms to respect rate limits...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  console.log(`🏁 AI Enrichment complete. Total records processed this run: ${totalProcessed}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
