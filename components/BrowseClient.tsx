'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type Word = {
  bikol: string;
  english: string;
  tagalog?: string | null;
  category?: string | null;
  pos?: string | null;
};

export default function BrowseClient({
  initialWords,
  initialLetter,
  initialCategory,
  initialQuery,
}: {
  initialWords: Word[];
  initialLetter: string;
  initialCategory: string;
  initialQuery: string;
}) {
  const router = useRouter();
  
  const [query, setQuery] = useState(initialQuery);
  const [words, setWords] = useState(initialWords);

  // Debounced search function
  const updateSearch = useCallback(
    debounce((q: string, letter: string, category: string) => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (letter) params.set('letter', letter);
      if (category) params.set('category', category);
      
      // Push new URL to trigger Server Component fetch
      router.push(`/browse?${params.toString()}`);
    }, 300),
    [router]
  );

  useEffect(() => {
    // When initial data changes (from server), update local state
    setWords(initialWords);
  }, [initialWords]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setQuery(newVal);
    updateSearch(newVal, initialLetter, initialCategory);
  };

  // Helper to highlight search matches
  const highlightText = (text: string) => {
    if (!query || !text.toLowerCase().includes(query.toLowerCase())) {
      return text;
    }
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <mark key={i} className="bg-yellow-500/30 text-yellow-200 rounded px-1">{part}</mark> 
            : part
        )}
      </>
    );
  };

  return (
    <div>
      {/* Search Input */}
      <div className="mb-8 relative max-w-2xl">
        <input
          type="text"
          value={query}
          onChange={handleSearchChange}
          placeholder={`Search ${initialCategory || 'words'} ${initialLetter ? `starting with ${initialLetter}` : ''}...`}
          className="w-full px-6 py-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); updateSearch('', initialLetter, initialCategory); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-zinc-400 mb-4">
        Found {words.length} result{words.length !== 1 ? 's' : ''}
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {words.map((word) => (
          <Link 
            key={word.bikol} 
            href={`/word/${encodeURIComponent(word.bikol)}`}
            className="block bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-zinc-600 transition group"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-blue-500 group-hover:text-blue-400">
                  {highlightText(word.bikol)}
                </h2>
                <p className="text-zinc-300 mt-1">{highlightText(word.english)}</p>
                {word.tagalog && (
                  <p className="text-zinc-500 text-sm mt-1">Tagalog: {highlightText(word.tagalog)}</p>
                )}
              </div>
              <div className="text-right flex flex-col gap-2 items-end">
                {word.pos && (
                  <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded w-fit">{word.pos}</span>
                )}
                {word.category && (
                  <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded w-fit">{word.category}</span>
                )}
              </div>
            </div>
          </Link>
        ))}

        {words.length === 0 && !query && (
           <div className="text-center text-zinc-500 py-12">No words found for this filter.</div>
        )}
        {words.length === 0 && query && (
           <div className="text-center text-zinc-500 py-12">No matches for "{query}".</div>
        )}
      </div>
    </div>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
