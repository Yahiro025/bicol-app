'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type Word = {
  bikol: string;
  english: string;
  tagalog?: string | null;
  category?: string | null;
  pos?: string | null;
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function BrowseClient({
  initialWords,
  initialCategories,
  initialLetter,
  initialCategory,
  initialQuery,
}: {
  initialWords: Word[];
  initialCategories: string[];
  initialLetter: string;
  initialCategory: string;
  initialQuery: string;
}) {
  const router = useRouter();
  
  const [query, setQuery] = useState(initialQuery);
  const [words, setWords] = useState(initialWords);
  const [areFiltersVisible, setAreFiltersVisible] = useState(false);

  // Debounced search function
  const updateSearch = useCallback(
    debounce((q: string, letter: string, category: string) => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (letter) params.set('letter', letter);
      if (category) params.set('category', category);
      router.push(`/browse?${params.toString()}`);
    }, 300),
    [router]
  );

  useEffect(() => {
    setWords(initialWords);
  }, [initialWords]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setQuery(newVal);
    updateSearch(newVal, initialLetter, initialCategory);
  };

  const handleFilterClick = (type: 'letter' | 'category', value: string) => {
    const newLetter = type === 'letter' ? (initialLetter === value && value !== '' ? '' : value) : initialLetter;
    const newCategory = type === 'category' ? (initialCategory === value ? '' : value) : initialCategory;
    updateSearch(query, newLetter, newCategory);
  };

  const clearFilters = () => {
    updateSearch(query, '', '');
  };

  const highlightText = (text: string) => {
    if (!query || !text.toLowerCase().includes(query.toLowerCase())) return text;
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

  const hasActiveFilters = !!(initialLetter || initialCategory);

  return (
    <div>
      {/* 1. SEARCH ENGINE AT THE TOP */}
      <div className="mb-6 relative max-w-2xl">
        <input
          type="text"
          value={query}
          onChange={handleSearchChange}
          placeholder={`Search dictionary...`}
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

      {/* 2. TOGGLE FILTER BUTTON & ACTIVE FILTER PILLS */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <button 
          onClick={() => setAreFiltersVisible(!areFiltersVisible)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition"
        >
          <svg className={`w-4 h-4 transition-transform ${areFiltersVisible ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          {areFiltersVisible ? 'Hide Filters' : 'Show Filters'}
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {initialLetter && (
            <span className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-xs font-semibold flex items-center gap-1">
              Letter: {initialLetter} 
              <button onClick={() => handleFilterClick('letter', initialLetter)} className="ml-1 hover:text-white">✕</button>
            </span>
          )}
          {initialCategory && (
            <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-xs font-semibold flex items-center gap-1">
              {initialCategory} 
              <button onClick={() => handleFilterClick('category', initialCategory)} className="ml-1 hover:text-white">✕</button>
            </span>
          )}
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-zinc-400 hover:text-white underline">
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* 3. COLLAPSIBLE FILTERS SECTION */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${areFiltersVisible ? 'max-h-[1000px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          {/* Letter Grid */}
          <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Starts with</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => handleFilterClick('letter', '')}
              className={`px-4 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition ${
                !initialLetter 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
              }`}
            >
              ALL
            </button>
            {ALPHABET.map((l) => (
              <button
                key={l}
                onClick={() => handleFilterClick('letter', l)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition ${
                  initialLetter === l 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Category Grid */}
          <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Category</h3>
          <div className="flex flex-wrap gap-2">
            {initialCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleFilterClick('category', cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  initialCategory === cat 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. RESULTS COUNT & LIST */}
      <div className="text-sm text-zinc-400 mb-4">
        Found {words.length} result{words.length !== 1 ? 's' : ''}
      </div>

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
              <div className="text-right flex flex-col items-end gap-1">
                {word.pos && (
                  <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">{word.pos}</span>
                )}
                {word.category && (
                  <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded">{word.category}</span>
                )}
              </div>
            </div>
          </Link>
        ))}

        {words.length === 0 && (
           <div className="text-center text-zinc-500 py-12">
             {query || hasActiveFilters ? `No matches found. Try adjusting your search or filters.` : `No words found.`}
           </div>
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
