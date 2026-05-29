'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';
import { useLanguageMode } from '@/hooks/useLanguageMode';
import { fuzzyMatch } from '@/lib/fuzzy';

type SearchResult = {
  bikol: string;
  english: string;
  tagalog?: string | null;
};

interface SearchBarProps {
  initialDictionary?: SearchResult[];
}

const containerVariants = {
  hidden: { opacity: 0, scale: 0.98, y: -10 },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
      staggerChildren: 0.05
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.98,
    y: -10,
    transition: { duration: 0.15, ease: 'easeOut' }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, x: -5 },
  visible: { opacity: 1, x: 0 }
} as const;

export default function SearchBar({ initialDictionary = [] }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const langMode = useLanguageMode();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayTranslation = (item: SearchResult) => {
    if (langMode === 'tl' && item.tagalog) return item.tagalog;
    return item.english;
  };

  // Optimistic & Debounced Search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // 1. Fuzzy Local Filtering & Sorting (typo-tolerant)
    const normalizedQuery = query.toLowerCase().trim();
    const localMatches = fuzzyMatch(normalizedQuery, initialDictionary, [
      (item) => item.bikol,
      (item) => item.english,
      (item) => item.tagalog,
    ], { minScore: 0.5, limit: 6 }).map(m => m.item);

    setResults(localMatches);
    setIsOpen(true);

    // 2. Background exhaustive fetch if local results are insufficient
    if (localMatches.length >= 4) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: abortControllerRef.current?.signal
        });
        const data = await res.json();
        
        if (Array.isArray(data)) {
          // Merge local results with remote results, avoiding duplicates
          setResults(prev => {
            const existingBikol = new Set(prev.map(r => r.bikol.toLowerCase()));
            const newResults = data.filter(r => !existingBikol.has(r.bikol.toLowerCase()));
            return [...prev, ...newResults].slice(0, 10);
          });
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Search error:', error);
        }
      } finally {
        setIsLoading(false);
      }
    }, 400); // Wait a bit longer to see if user keeps typing

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, initialDictionary]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsLoading(true);
      setIsOpen(false);
      router.push(`/browse?q=${encodeURIComponent(query)}`);
    }
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery(''); // Optional: clear search after navigation
  };

  // Highlight matching text
  // Highlight matching text — highlights exact substring matches, but for
  // fuzzy-only matches renders the text normally (no highlight).
  const highlightMatch = useCallback((text: string) => {
    if (!query.trim()) return text;
    const lower = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    if (!lower.includes(lowerQuery)) {
      // Fuzzy match only — show text normally
      return <span>{text}</span>;
    }
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <mark key={i} className="bg-blue-500/30 text-blue-300 rounded px-0.5">{part}</mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  }, [query]);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="relative flex items-center w-full group">
        <div className="absolute left-4 z-10 flex items-center justify-center w-5 h-5 pointer-events-none">
          {isLoading ? (
            <motion.div 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-2 h-2 bg-blue-500 rounded-full"
            />
          ) : (
            <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            (results.length > 0 || query.length > 0) && setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder="Search a Bikol or English word..."
          className={`w-full pl-12 pr-28 sm:pr-32 py-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-base sm:text-lg transition-all duration-300 ${
            isFocused ? 'bg-white dark:bg-zinc-800/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : ''
          }`}
          autoComplete="off"
        />
        <Button 
          type="submit" 
          isLoading={isLoading}
          className="absolute right-1.5 h-[calc(100%-12px)] px-4 sm:px-6 rounded-xl text-xs sm:text-sm"
        >
          Search
        </Button>
      </form>

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute mt-3 w-full bg-white dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {results.length > 0 ? (
              <ul className="py-2">
                {results.map((item) => (
                  <motion.li key={item.bikol} variants={itemVariants}>
                    <Link 
                      href={`/word/${encodeURIComponent(item.bikol)}`}
                      onClick={handleResultClick}
                      className="flex items-center justify-between px-6 py-3 hover:bg-zinc-50 dark:hover:bg-white/5 cursor-pointer transition group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 truncate">
                          {highlightMatch(item.bikol)}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                          {highlightMatch(displayTranslation(item))}
                        </p>
                        {langMode === 'all' && item.tagalog && (
                          <p className="text-xs text-zinc-600 italic truncate mt-0.5">
                            Tagalog: {highlightMatch(item.tagalog)}
                          </p>
                        )}
                      </div>
                      <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 ml-4 flex-shrink-0 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            ) : !isLoading && query.trim().length > 0 ? (
              <div className="px-6 py-8 text-sm text-zinc-400 dark:text-zinc-500 text-center">
                No words found for <span className="text-zinc-600 dark:text-zinc-300">"{query}"</span>
              </div>
            ) : null}

            {/* Footer Link to Browse Page */}
            {results.length > 0 && (
              <motion.div variants={itemVariants} className="border-t border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/5">
                <button 
                  onClick={() => { setIsOpen(false); router.push(`/browse?q=${encodeURIComponent(query)}`); }} 
                  className="w-full text-center py-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium transition"
                >
                  View all results for "{query}"
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
