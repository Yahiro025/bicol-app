'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';
import { useLanguageMode } from '@/hooks/useLanguageMode';
import { fuzzyMatch } from '@/lib/fuzzy';
import { normalizePOS, displayTranslation } from '@/lib/lexicography';

type SearchResult = {
  bikol: string;
  english: string;
  tagalog?: string | null;
  pos?: string | null;
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
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const langMode = useLanguageMode();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => setSelectedIndex(-1), [results]);

  const getTranslation = (item: SearchResult) => displayTranslation(item, langMode);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const normalizedQuery = query.toLowerCase().trim();
    const localMatches = fuzzyMatch(normalizedQuery, initialDictionary, [
      (item) => item.bikol,
      (item) => item.english,
      (item) => item.tagalog,
    ], { minScore: 0.5, limit: 6 }).map(m => m.item);

    setResults(localMatches);
    setIsOpen(true);

    if (localMatches.length >= 4) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: abortControllerRef.current?.signal
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setResults(prev => {
            const existing = new Set(prev.map(r => r.bikol.toLowerCase()));
            return [...prev, ...data.filter((r: SearchResult) => !existing.has(r.bikol.toLowerCase()))].slice(0, 10);
          });
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Search error:', error);
        }
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timeoutId);
      abortControllerRef.current?.abort();
    };
  }, [query, initialDictionary]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        if (selectedIndex >= 0 && results[selectedIndex]) {
          e.preventDefault();
          router.push(`/word/${encodeURIComponent(results[selectedIndex].bikol)}`);
          setIsOpen(false);
          setQuery('');
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  }, [isOpen, results, selectedIndex, router]);

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      listRef.current.querySelectorAll('li')[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsLoading(true);
      setIsOpen(false);
      setSelectedIndex(-1);
      router.push(`/browse?q=${encodeURIComponent(query)}`);
    }
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setSelectedIndex(-1);
    setQuery('');
  };

  const highlightMatch = useCallback((text: string) => {
    if (!query.trim()) return text;
    const lowerQuery = query.toLowerCase();
    if (!text.toLowerCase().includes(lowerQuery)) return <span>{text}</span>;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="rounded px-0.5" style={{ backgroundColor: 'rgba(212,168,69,0.22)', color: 'var(--editorial-accent)' }}>{part}</mark>
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
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--editorial-accent)' }}
            />
          ) : (
            <svg className="w-5 h-5 transition-colors" style={{ color: 'var(--editorial-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            if (results.length > 0 || query.length > 0) setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-listbox"
          aria-activedescendant={selectedIndex >= 0 ? `search-option-${selectedIndex}` : undefined}
          className={`w-full pl-12 pr-28 sm:pr-32 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-base sm:text-lg transition-all duration-300 ${
            isFocused ? 'shadow-[0_0_30px_rgba(59,130,246,0.15)]' : ''
          }`}
          style={{
            backgroundColor: isFocused ? 'var(--editorial-surface-raised)' : 'var(--editorial-surface)',
            borderColor: 'var(--editorial-border)',
            borderWidth: '1px',
            borderStyle: 'solid',
            color: 'var(--editorial-text)',
          }}
          placeholder="Search a Bikol or English word..."
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
            className="absolute mt-3 w-full backdrop-blur-xl rounded-2xl shadow-2xl z-50 overflow-hidden"
            style={{
              backgroundColor: 'var(--editorial-surface-raised)',
              borderColor: 'var(--editorial-border)',
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
          >
            {results.length > 0 ? (
              <ul ref={listRef} id="search-listbox" role="listbox" className="py-2">
                {results.map((item, index) => (
                  <motion.li 
                    key={item.bikol} 
                    variants={itemVariants} 
                    whileHover={{ scale: 1.01 }}
                    id={`search-option-${index}`}
                    role="option"
                    aria-selected={index === selectedIndex}
                  >
                    <Link 
                      href={`/word/${encodeURIComponent(item.bikol)}`}
                      onClick={handleResultClick}
                      className={`flex items-center justify-between px-6 py-3 cursor-pointer transition group hover:brightness-95 dark:hover:brightness-110 ${
                        index === selectedIndex ? 'brightness-95 dark:brightness-110' : ''
                      }`}
                      style={index === selectedIndex ? { backgroundColor: 'var(--editorial-surface)' } : undefined}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate" style={{ color: 'var(--editorial-accent)' }}>
                            {highlightMatch(item.bikol)}
                          </p>
                          {item.pos && (
                            <span className="text-[10px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                              style={{
                                backgroundColor: 'var(--editorial-bg)',
                                color: 'var(--editorial-muted)',
                                border: '1px solid var(--editorial-border)',
                              }}>
                              {normalizePOS(item.pos)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm truncate" style={{ color: 'var(--editorial-muted)' }}>
                          {highlightMatch(getTranslation(item))}
                        </p>
                        {langMode === 'all' && item.tagalog && (
                          <p className="text-xs italic truncate mt-0.5" style={{ color: 'var(--editorial-muted)' }}>
                            Tagalog: {highlightMatch(item.tagalog)}
                          </p>
                        )}
                      </div>
                      <svg className="w-4 h-4 ml-4 flex-shrink-0 transition-transform group-hover:translate-x-1" style={{ color: 'var(--editorial-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            ) : !isLoading && query.trim().length > 0 ? (
              <div className="px-6 py-8 text-sm text-center" style={{ color: 'var(--editorial-muted)' }}>
                No words found for <span style={{ color: 'var(--editorial-text)' }}>"{query}"</span>
              </div>
            ) : null}

            {/* Footer Link to Browse Page */}
            {results.length > 0 && (
              <motion.div variants={itemVariants} style={{ borderTop: '1px solid var(--editorial-divider)', backgroundColor: 'var(--editorial-surface)' }}>
                <button 
                  onClick={() => { setIsOpen(false); router.push(`/browse?q=${encodeURIComponent(query)}`); }} 
                  className="w-full text-center py-4 text-sm font-medium transition"
                  style={{ color: 'var(--editorial-accent)' }}
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
