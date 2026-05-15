const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ayvxqbxnrbcgbffrzbia.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dnhxYnhucmJjZ2JmZnJ6YmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDkzMDAsImV4cCI6MjA5Mjc4NTMwMH0.pAHi-yBxb1GCEXT78xHQXiYcg7yJfoSpNCXi1Dvugdg';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    console.log('Checking access with ANON key...');
    const { data, error } = await supabase
        .from('words')
        .select('bikol, english, tagalog')
        .limit(5);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Data returned:');
    data.forEach((row, i) => {
        console.log(`${i+1}. Bikol: [${row.bikol}] | English: [${row.english}] | Tagalog: [${row.tagalog}]`);
    });
}

check();
