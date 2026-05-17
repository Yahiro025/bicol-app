'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type SearchResult = {
  bikol: string;
  english: string;
  tagalog?: string | null;
};

const containerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -5 },
  visible: { opacity: 1, x: 0 }
};

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
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

  // Debounced fetch effect
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setResults(data);
          setIsOpen(true);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error(error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 150); // Fast debounce for instant feel

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/browse?q=${encodeURIComponent(query)}`);
    }
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery(''); // Optional: clear search after navigation
  };

  // Highlight matching text
  const highlightMatch = (text: string) => {
    if (!query.trim()) return text;
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
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            results.length > 0 && setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder="Search a Bikol or English word..."
          className={`w-full px-6 py-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-lg shadow-2xl transition-all duration-300 ${
            isFocused ? 'scale-[1.02] shadow-blue-500/10' : ''
          }`}
          autoComplete="off"
        />
        <button 
          type="submit" 
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg font-medium transition-all duration-100"
        >
          Search
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute mt-2 w-full bg-zinc-900/80 backdrop-blur-xl border border-white/5 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {isLoading && (
              <div className="px-6 py-4 text-sm text-zinc-400 text-center">Searching...</div>
            )}

            {!isLoading && results.length > 0 && (
              <ul className="py-2">
                {results.map((item) => (
                  <motion.li key={item.bikol} variants={itemVariants}>
                    <Link 
                      href={`/word/${encodeURIComponent(item.bikol)}`}
                      onClick={handleResultClick}
                      className="flex items-center justify-between px-6 py-3 hover:bg-white/5 cursor-pointer transition group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-blue-400 group-hover:text-blue-300 truncate">
                          {highlightMatch(item.bikol)}
                        </p>
                        <p className="text-sm text-zinc-400 truncate">
                          {highlightMatch(item.english)}
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 ml-4 flex-shrink-0 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            )}

            {!isLoading && results.length === 0 && query.trim().length > 0 && (
              <div className="px-6 py-4 text-sm text-zinc-500 text-center">
                No words found starting with "{query}"
              </div>
            )}

            {/* Footer Link to Browse Page */}
            {results.length > 0 && (
              <motion.div variants={itemVariants} className="border-t border-white/5 bg-white/5">
                <button 
                  onClick={() => { setIsOpen(false); router.push(`/browse?q=${encodeURIComponent(query)}`); }} 
                  className="w-full text-center py-3 text-sm text-blue-400 hover:text-blue-300 font-medium transition"
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
