const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ayvxqbxnrbcgbffrzbia.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dnhxYnhucmJjZ2JmZnJ6YmlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIwOTMwMCwiZXhwIjoyMDkyNzg1MzAwfQ.VmOqtJOQ4NnqO4cnMPNPa-ABq_xUZlrbZYl8V6nUUc4';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    const { data, error } = await supabase
        .from('words')
        .select('bikol, english, tagalog')
        .limit(20);

    if (error) {
        console.error(error);
        return;
    }

    console.log('Sample Data (First 20 rows):');
    data.forEach((row, i) => {
        console.log(`${i+1}. Bikol: [${row.bikol}] | English: [${row.english}] | Tagalog: [${row.tagalog}]`);
    });
}

check();
