"use client";

import { useState } from 'react';
import Link from 'next/link';

type SearchResult = {
  bikol: string;
  english: string;
  tagalog?: string | null;
};

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data);
    setIsOpen(true);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a Bikol or English word..."
          className="w-full px-6 py-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
          Search
        </button>
      </form>

      {isOpen && results.length > 0 && (
        <div className="absolute mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden text-left">
          {results.map((item, idx) => (
            <Link key={idx} href={`/word/${encodeURIComponent(item.bikol)}`}>
              <div className="px-6 py-3 hover:bg-zinc-800 cursor-pointer border-b border-zinc-800 last:border-b-0" onClick={() => setIsOpen(false)}>
                <span className="font-semibold text-blue-500">{item.bikol}</span>
                <span className="text-sm text-zinc-400 ml-2">- {item.english} {item.tagalog ? `(${item.tagalog})` : ''}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isOpen && results.length === 0 && query.trim() && (
        <div className="absolute mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 p-4 text-center text-zinc-400">
          No words found.
        </div>
      )}
    </div>
  );
}
