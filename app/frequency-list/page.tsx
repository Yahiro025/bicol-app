import { browseWords, type WordSearchEntry } from '@/lib/word-search';

// ISR: frequency data changes rarely, revalidate hourly
export const revalidate = 3600;

export default async function FrequencyListPage() {
  let words: WordSearchEntry[] = [];
  let dbError: string | null = null;
  try {
    words = await browseWords({
      filters: {},
      sort: 'frequency',
      limit: 100,
      offset: 0,
    });
  } catch (e: unknown) {
    console.error(e);
    dbError = e instanceof Error ? e.message : 'Unknown error';
  }

  return (
    <main className="min-h-screen p-8" style={{ backgroundColor: 'var(--editorial-bg)', color: 'var(--editorial-text)' }}>
      <div className="max-w-4xl mx-auto">
        <span className="section-number">Reference</span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-3 mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--editorial-text)' }}>Word Frequency List</h1>
        
        {dbError && (
          <div className="p-4 rounded-xl text-sm mb-6" style={{ backgroundColor: 'rgba(160,82,45,0.1)', color: 'var(--editorial-rust)', border: '1px solid rgba(160,82,45,0.2)' }}>
            Database Error: {dbError}
          </div>
        )}

        {!dbError && words.length === 0 && (
          <p style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>No words found in the database.</p>
        )}

        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}>
          <ul className="divide-y" style={{ borderColor: 'var(--editorial-divider)' }}>
            {words.map((word, idx) => (
              <li key={word.bikol} className="px-6 py-4 flex items-center justify-between transition-colors" style={{ fontFamily: 'var(--font-body)' }}>
                <div className="flex items-center gap-4">
                  <span className="font-mono w-8" style={{ color: 'var(--editorial-muted)' }}>{idx + 1}.</span>
                  <a href={`/word/${encodeURIComponent(word.bikol)}`} className="hover:underline font-medium" style={{ color: 'var(--editorial-accent)' }}>{word.bikol}</a>
                </div>
                <span className="text-sm" style={{ color: 'var(--editorial-muted)' }}>{word.english}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
