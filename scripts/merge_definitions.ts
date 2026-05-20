import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

interface AIResponse {
  shouldMerge: boolean;
  explanation: string;
  mergedEnglish?: string;
}

const matchLower = (str1: string | null, str2: string | null): boolean => {
  return (str1 || '').trim().toLowerCase() === (str2 || '').trim().toLowerCase();
};

const mergeStringsSideBySide = (str1: string | null, str2: string | null): string | null => {
  if (!str1 && !str2) return null;
  if (!str1) return str2;
  if (!str2) return str1;

  const parts1 = str1.split(/[\/;,\.]+/).map(p => p.trim()).filter(Boolean);
  const parts2 = str2.split(/[\/;,\.]+/).map(p => p.trim()).filter(Boolean);
  
  // Deduplicate while preserving order as much as possible
  const seen = new Set<string>();
  const result: string[] = [];
  
  [...parts1, ...parts2].forEach(p => {
    const lower = p.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(p);
    }
  });

  return result.join('; ');
};

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function classifyDefinitions(bikol: string, def1: string, def2: string): Promise<AIResponse> {
  const prompt = `Root word: "${bikol}"
Definitions to analyze:
1. "${def1}"
2. "${def2}"

Do these definitions represent the exact same semantic concept/meaning of this word, just phrased differently (e.g., 'Buy' vs 'to purchase; to buy', or 'Dad' vs 'father', or 'Shoes' vs 'shoe')?
Or do they represent completely different, unrelated meanings of the word (e.g., homonyms like 'read' vs 'wet', or 'ant' vs 'between')?

Return your response in standard JSON format:
{
  "shouldMerge": true or false,
  "explanation": "Brief explanation of your decision"
}`;

  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    let content = '';
    try {
      attempts++;
      const completion = await groq.chat.completions.create({
        model: 'qwen/qwen3-32b',
        messages: [
          {
            role: 'system',
            content: 'You are an expert lexicographer and linguist specializing in Austronesian languages, specifically Bikol. Respond ONLY with valid JSON. Keep your thinking/reasoning process extremely brief (under 50 tokens) to be token-efficient.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      });

      content = completion.choices[0]?.message?.content?.trim() || '';
      
      // Strip reasoning <think>...</think> block if present (handles incomplete/cut-off tags)
      let cleanContent = content;
      if (cleanContent.includes('<think>')) {
        const thinkEnd = cleanContent.indexOf('</think>');
        if (thinkEnd !== -1) {
          cleanContent = cleanContent.substring(thinkEnd + 8).trim();
        } else {
          const thinkStart = cleanContent.indexOf('<think>');
          cleanContent = cleanContent.substring(0, thinkStart).trim();
        }
      }
      
      const cleanJson = cleanContent.replace(/^```json\s*/i, '').replace(/```$/, '').trim();

      const result = JSON.parse(cleanJson) as AIResponse;
      return result;

    } catch (error: any) {
      console.warn(`⚠️ Attempt ${attempts} failed. Error: ${error.message}`);
      if (content) {
        console.warn(`📄 Raw API response (first 200 chars):\n${content.substring(0, 200)}\n---`);
      }
      
      // Handle rate limit 429
      if (error.status === 429 || error.message.includes('rate_limit') || error.message.includes('429')) {
        let waitTime = 15000; // default 15s
        const match = error.message.match(/try again in ([\d\.]+)s/i);
        if (match && match[1]) {
          waitTime = Math.ceil(parseFloat(match[1]) * 1000) + 1000;
        }
        console.log(`⏳ Rate limited! Sleeping for ${waitTime / 1000}s before retry...`);
        await sleep(waitTime);
      } else {
        // Simple sleep for non-rate limit errors
        await sleep(2000);
      }
    }
  }

  throw new Error(`❌ Failed to classify definitions for "${bikol}" after ${maxAttempts} attempts.`);
}

async function main() {
  console.log('🤖 Starting AI-Assisted Sibling Definition Merge...');

  // Load all roots with multiple definitions
  const roots = await prisma.root.findMany({
    include: {
      definitions: {
        include: {
          exampleSentences: true,
          conjugations: true
        }
      }
    }
  });

  const multiDefRoots = roots.filter(r => r.definitions.length > 1);
  console.log(`📖 Loaded ${multiDefRoots.length} roots having multiple definitions.`);

  let mergedCount = 0;
  let skippedCount = 0;

  let i = 0;
  for (const r of multiDefRoots) {
    i++;
    console.log(`\n--------------------------------------------------`);
    console.log(`🔄 Processing root ${i}/${multiDefRoots.length}: "${r.bikol}" (ID: ${r.id})`);

    // We merge pairs iteratively. If there are more than 2, we process them in a loop.
    let definitions = [...r.definitions];

    while (definitions.length > 1) {
      const defKeep = definitions[0];
      const defMerge = definitions[1];
      
      if (!defKeep || !defMerge) break;

      console.log(`  🔍 Analyzing:`);
      console.log(`    1. "${defKeep.english}" [Dialect: ${defKeep.dialect}]`);
      console.log(`    2. "${defMerge.english}" [Dialect: ${defMerge.dialect}]`);

      try {
        // Sleep to respect Groq RPM limits
        await sleep(1000);
        
        const decision = await classifyDefinitions(
          r.bikol,
          defKeep.english || '',
          defMerge.english || ''
        );

        console.log(`    💡 AI Decision: shouldMerge = ${decision.shouldMerge} (${decision.explanation})`);

        if (decision.shouldMerge) {
          const mergedEnglish = mergeStringsSideBySide(defKeep.english, defMerge.english) || '';
          console.log(`    ⚡ Merging side-by-side: "${mergedEnglish}"`);

          // 1. Combine dialects
          const mergedDialect = mergeStringsSideBySide(defKeep.dialect, defMerge.dialect);

          // Merge synonyms
          const mergedSynonyms = mergeStringsSideBySide(defKeep.synonyms, defMerge.synonyms);

          // Merge tagalog
          const mergedTagalog = mergeStringsSideBySide(defKeep.tagalog, defMerge.tagalog);

          // Merge notes
          const mergedNotes = mergeStringsSideBySide(defKeep.notes, defMerge.notes);

          // 2. Relink example sentences
          for (const ex of defMerge.exampleSentences) {
            const isDuplicate = defKeep.exampleSentences.some(existingEx => 
              matchLower(existingEx.bikol, ex.bikol)
            );
            if (!isDuplicate) {
              await prisma.exampleSentence.update({
                where: { id: ex.id },
                data: { definitionId: defKeep.id }
              });
              console.log(`      * Relinked unique example: "${ex.bikol}"`);
            } else {
              // Delete duplicate example
              await prisma.exampleSentence.delete({
                where: { id: ex.id }
              });
              console.log(`      * Removed redundant duplicate example.`);
            }
          }

          // 3. Relink/merge conjugations
          for (const conj of defMerge.conjugations) {
            const matchingConj = defKeep.conjugations.find(c => 
              matchLower(c.tense, conj.tense) && matchLower(c.focus, conj.focus)
            );

            if (!matchingConj) {
              await prisma.conjugation.update({
                where: { id: conj.id },
                data: { definitionId: defKeep.id }
              });
              // Update local array for subsequent iteration checks
              defKeep.conjugations.push(conj);
              console.log(`      * Relinked unique conjugation: tense="${conj.tense}", focus="${conj.focus}" (form: "${conj.form}")`);
            } else {
              const mergedForm = mergeStringsSideBySide(matchingConj.form, conj.form);

              if (mergedForm !== matchingConj.form) {
                await prisma.conjugation.update({
                  where: { id: matchingConj.id },
                  data: { form: mergedForm }
                });
                matchingConj.form = mergedForm;
                console.log(`      * Merged conjugation forms side-by-side: "${mergedForm}"`);
              } else {
                console.log(`      * Removed redundant duplicate conjugation with identical form: "${matchingConj.form}"`);
              }

              // Always delete the redundant conjugation to satisfy unique constraint before definition delete
              await prisma.conjugation.delete({
                where: { id: conj.id }
              });
            }
          }

          // 4. Update the defKeep English translation and other fields
          await prisma.definition.update({
            where: { id: defKeep.id },
            data: {
              english: mergedEnglish,
              dialect: mergedDialect,
              synonyms: mergedSynonyms,
              tagalog: mergedTagalog,
              notes: mergedNotes
            }
          });

          // 5. Delete defMerge
          await prisma.definition.delete({
            where: { id: defMerge.id }
          });

          console.log(`    ✅ Successfully merged definition "${defMerge.english}" into "${defKeep.english}".`);
          mergedCount++;

          // Update our local array to reflect the merge and continue if there are more sibling defs
          defKeep.english = mergedEnglish;
          defKeep.dialect = mergedDialect;
          // defMerge is removed from the definitions array
          definitions.splice(1, 1);

        } else {
          console.log(`    ⏭️ Keeping definitions separate (distinct meanings/homonyms).`);
          skippedCount++;
          // Move to next pair if we cannot merge these two
          definitions.shift();
        }

      } catch (err: any) {
        console.error(`  ❌ Error processing definitions for "${r.bikol}":`, err.message);
        break;
      }
    }
  }

  console.log('\n==================================================');
  console.log('🏁 DEFINITION CONSOLIDATION COMPLETED!');
  console.log(`🎉 Merged ${mergedCount} redundant definitions side-by-side.`);
  console.log(`🎉 Skipped ${skippedCount} distinct homonym definitions.`);
  console.log('==================================================');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
