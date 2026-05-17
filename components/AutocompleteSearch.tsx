"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AutocompleteSearch() {
  const [query, setQuery] = useState('');
const [results, setResults] = useState<Array<{ bikol: string; english: string; tagalog?: string | null }>>([]);  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${query}`);
      const data = await res.json();
      setResults(data);
    }, 300);
  }, [query]);

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search Bikol, English, or Tagalog..."
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 h-5 w-5" />
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          {results.map((item, idx) => (
            <li 
              key={idx}
              onMouseEnter={() => router.prefetch(`/word/${encodeURIComponent(item.bikol)}`)}
              onClick={() => {
                router.push(`/word/${encodeURIComponent(item.bikol)}`);
                setIsOpen(false);
              }}
              className="px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer border-b last:border-0 border-zinc-100 dark:border-zinc-800 flex justify-between items-center"
            >
              <div>
                <span className="font-bold text-primary">{item.bikol}</span>
                <span className="ml-2 text-sm text-zinc-500">{item.english || item.tagalog}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
