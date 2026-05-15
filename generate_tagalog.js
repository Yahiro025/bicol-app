/**
 * generate_tagalog.js
 * 
 * This script connects to Supabase, fetches words missing Tagalog translations,
 * and updates them using a combination of Bikol-Tagalog heuristics and 
 * English-to-Tagalog translation.
 */

const { createClient } = require('@supabase/supabase-js');
const translate = require('translate');

// ==========================================
// CONFIGURATION
// ==========================================
const SUPABASE_URL = 'https://ayvxqbxnrbcgbffrzbia.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dnhxYnhucmJjZ2JmZnJ6YmlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIwOTMwMCwiZXhwIjoyMDkyNzg1MzAwfQ.VmOqtJOQ4NnqO4cnMPNPa-ABq_xUZlrbZYl8V6nUUc4'; // Use Service Role Key for write access

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Set translation engine (Google is default but you can specify)
const translateFn = translate.default || translate;
translateFn.engine = 'google'; 
translateFn.from = 'en';
translateFn.to = 'tl'; // Tagalog/Filipino

// Common words that are identical in Bikol and Tagalog
const identicalWords = [
    'ako', 'ikaw', 'siya', 'kami', 'kita', 'salamat', 'kumusta', 
    'ano', 'sino', 'saan', 'kailan', 'bakit', 'paano', 'o', 'at',
    'magayon', 'gwapo', 'tao', 'bahay', 'aso', 'pusa', 'ibon', 'isda'
];

async function updateTagalogTranslations() {
    console.log('--- Starting Tagalog Translation Sync ---');

    // 1. Fetch rows where tagalog is NULL or empty
    const { data: words, error } = await supabase
        .from('words')
        .select('id, bikol, english, tagalog')
        .or('tagalog.is.null,tagalog.eq.""');

    if (error) {
        console.error('Error fetching words:', error);
        return;
    }

    console.log(`Found ${words.length} words needing translation.`);

    for (let i = 0; i < words.length; i++) {
        const row = words[i];
        let tagalogResult = '';

        try {
            // 2. Intelligent Determination Logic
            
            // Heuristic A: Case-insensitive check for identical words
            const bikolLower = row.bikol.toLowerCase().trim();
            if (identicalWords.includes(bikolLower)) {
                tagalogResult = row.bikol;
                console.log(`[Heuristic] Matched Identical: ${row.bikol} -> ${tagalogResult}`);
            } 
            // Heuristic B: Translate from English if Heuristic A fails
            else {
                // We use the English meaning to get an accurate Tagalog word
                // 'translate' is an async operation
                const translated = await translateFn(row.english, 'tl');
                
                // Clean up the result (remove periods, lowercase to match style)
                tagalogResult = translated.replace(/\./g, '').trim();
                
                // If the translation failed or returned English, fallback to Bikol
                if (!tagalogResult || tagalogResult.toLowerCase() === row.english.toLowerCase()) {
                    tagalogResult = row.bikol;
                    console.log(`[Fallback] Translation failed for "${row.english}", using Bikol: ${row.bikol}`);
                } else {
                    console.log(`[API] Translated: "${row.english}" -> "${tagalogResult}"`);
                }
            }

            // 3. Update Supabase
            const { error: updateError } = await supabase
                .from('words')
                .update({ tagalog: tagalogResult })
                .eq('id', row.id);

            if (updateError) {
                console.error(`Error updating ID ${row.id}:`, updateError);
            }

        } catch (err) {
            console.error(`Failed to process "${row.bikol}":`, err.message);
        }

        // 4. Delay to avoid rate limits (100ms)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Progress log
        if ((i + 1) % 10 === 0) {
            console.log(`Progress: ${i + 1}/${words.length} processed...`);
        }
    }

    console.log('--- Translation Sync Complete ---');
}

updateTagalogTranslations();
