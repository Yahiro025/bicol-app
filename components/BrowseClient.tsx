'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef, useTransition } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';
import { useLanguageMode } from '@/hooks/useLanguageMode';
import { normalizePOS } from '@/lib/lexicography';

type Word = {
  bikol: string;
  english: string;
  tagalog?: string | null;
  category?: string | null;
  pos?: string | null;
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const listVariants = {
  visible: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
} as const;

export default function BrowseClient({
  initialWords,
  initialCategories,
  totalWords: initialTotalWords,
  initialLetter: defaultLetter,
  initialCategory: defaultCategory,
  initialQuery: defaultQuery,
  initialSort: defaultSort,
}: {
  initialWords: Word[];
  initialCategories: string[];
  totalWords: number;
  initialLetter: string;
  initialCategory: string;
  initialQuery: string;
  initialSort?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [query, setQuery] = useState(defaultQuery);
  const [selectedLetter, setSelectedLetter] = useState(defaultLetter);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [sortMode, setSortMode] = useState<'alphabetical' | 'frequency' | 'relevance'>(defaultSort === 'frequency' ? 'frequency' : defaultSort === 'relevance' ? 'relevance' : query ? 'relevance' : 'alphabetical');

  // Reset sort to alphabetical when search query is cleared (relevance mode needs a query)
  useEffect(() => {
    if (!query && sortMode === 'relevance') {
      setSortMode('alphabetical');
    }
  }, [query, sortMode]);
  const [words, setWords] = useState<Word[]>(initialWords);
  const [totalWords, setTotalWords] = useState(initialTotalWords);
  const pageRef = useRef(1);
  const [hasMore, setHasMore] = useState(initialWords.length === 50);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [areFiltersVisible, setAreFiltersVisible] = useState(false);
  const langMode = useLanguageMode();

  const displayTranslation = (word: Word) => {
    if (langMode === 'tl' && word.tagalog) return word.tagalog;
    return word.english;
  };

  const fetchMoreWords = useCallback(async (isReset = false) => {
    const limit = 50;
    
    if (!isReset && isLoadingMoreRef.current) return; // Prevent duplicate requests
    
    setIsLoadingMore(true);
    try {
      const params = new URLSearchParams({
        page: (isReset ? 0 : pageRef.current).toString(),
        limit: limit.toString(),
      });
      if (query) params.set('q', query);
      if (selectedLetter) params.set('letter', selectedLetter);
      if (selectedCategory) params.set('category', selectedCategory);
      if (sortMode === 'frequency') params.set('sort', 'frequency');
      if (sortMode === 'relevance') params.set('sort', 'relevance');

      const response = await fetch(`/api/browse?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      // Support both legacy array format and new { words, total } format
      const newWords = Array.isArray(data) ? data : data.words;
      if (data.total !== undefined) {
        setTotalWords(data.total);
      }

      if (!Array.isArray(newWords)) {
        throw new Error('Invalid response format');
      }

      if (isReset) {
        setWords(newWords);
        pageRef.current = 1;
      } else {
        setWords(prev => [...prev, ...newWords]);
        pageRef.current += 1;
      }
      
      setHasMore(newWords.length === limit);
    } catch (error) {
      console.error('Error fetching more words:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [query, selectedLetter, selectedCategory, sortMode]);

  // Intersection Observer for infinite scroll
  // Uses refs to avoid stale closure bugs — the observer callback always reads
  // the latest values of isLoadingMore and hasMore without recreating the observer.
  const isLoadingMoreRef = useRef(isLoadingMore);
  const hasMoreRef = useRef(hasMore);
  const fetchMoreWordsRef = useRef(fetchMoreWords);
  
  isLoadingMoreRef.current = isLoadingMore;
  hasMoreRef.current = hasMore;
  fetchMoreWordsRef.current = fetchMoreWords;

  const observerTarget = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMoreRef.current && !isLoadingMoreRef.current) {
          fetchMoreWordsRef.current();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Reset and fetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        fetchMoreWords(true);
      });
    }, 300); // Debounce search

    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedLetter) params.set('letter', selectedLetter);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortMode === 'frequency') params.set('sort', 'frequency');
    if (sortMode === 'relevance') params.set('sort', 'relevance');
    
    const newUrl = `/browse${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);

    return () => clearTimeout(timer);
  }, [query, selectedLetter, selectedCategory, sortMode, fetchMoreWords]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleFilterClick = (type: 'letter' | 'category', value: string) => {
    if (type === 'letter') {
      setSelectedLetter(prev => prev === value ? '' : value);
    } else {
      setSelectedCategory(prev => prev === value ? '' : value);
    }
  };

  const clearFilters = () => {
    setSelectedLetter('');
    setSelectedCategory('');
    setQuery('');
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

  const hasActiveFilters = !!(selectedLetter || selectedCategory);

  return (
    <div>
      <div className="mb-8 relative max-w-2xl group">
        <input
          type="text"
          value={query}
          onChange={handleSearchChange}
          placeholder={`Search dictionary...`}
          className="w-full px-8 py-4 rounded-xl text-lg transition-all duration-300 focus:outline-none placeholder:opacity-50"
          style={{
            fontFamily: 'var(--font-body)',
            backgroundColor: 'var(--editorial-surface)',
            border: '1px solid var(--editorial-border)',
            color: 'var(--editorial-text)',
          }}
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
          {isPending && (
            <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--editorial-border)', borderTopColor: 'var(--editorial-accent)' }} />
          )}
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="transition-colors p-1"
              style={{ color: 'var(--editorial-muted)' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. TOGGLE FILTER BUTTON & ACTIVE FILTER PILLS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Button 
            variant="secondary"
            onClick={() => setAreFiltersVisible(!areFiltersVisible)}
            className="flex items-center gap-2"
            style={{
              fontFamily: 'var(--font-body)',
              border: '1px solid var(--editorial-border)',
              color: 'var(--editorial-text)',
              backgroundColor: 'var(--editorial-surface)',
            }}
          >
            <svg className={`w-4 h-4 transition-transform duration-300 ${areFiltersVisible ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            {areFiltersVisible ? 'Hide Filters' : 'Show Filters'}
          </Button>

          {/* Sort Toggle */}
          <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid var(--editorial-border)' }}>
            {query && (
              <button
                onClick={() => setSortMode('relevance')}
                className="px-4 py-2 text-xs font-semibold transition-all"
                style={{
                  fontFamily: 'var(--font-body)',
                  backgroundColor: sortMode === 'relevance' ? 'var(--editorial-accent)' : 'var(--editorial-surface)',
                  color: sortMode === 'relevance' ? '#fff' : 'var(--editorial-muted)',
                }}
              >
                Relevance
              </button>
            )}
            <button
              onClick={() => setSortMode('alphabetical')}
              className="px-4 py-2 text-xs font-semibold transition-all"
              style={{
                fontFamily: 'var(--font-body)',
                backgroundColor: sortMode === 'alphabetical' ? 'var(--editorial-accent)' : 'var(--editorial-surface)',
                color: sortMode === 'alphabetical' ? '#fff' : 'var(--editorial-muted)',
              }}
            >
              A–Z
            </button>
            <button
              onClick={() => setSortMode('frequency')}
              className="px-4 py-2 text-xs font-semibold transition-all"
              style={{
                fontFamily: 'var(--font-body)',
                backgroundColor: sortMode === 'frequency' ? 'var(--editorial-accent)' : 'var(--editorial-surface)',
                color: sortMode === 'frequency' ? '#fff' : 'var(--editorial-muted)',
              }}
            >
              Common
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {selectedLetter && (
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-body)',
                backgroundColor: 'rgba(196, 155, 76, 0.12)',
                color: 'var(--editorial-accent)',
                border: '1px solid rgba(196, 155, 76, 0.25)',
              }}
            >
              Letter: {selectedLetter}
              <button onClick={() => handleFilterClick('letter', selectedLetter)} style={{ color: 'var(--editorial-accent)' }}>✕</button>
            </span>
          )}
          {selectedCategory && (
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-body)',
                backgroundColor: 'rgba(196, 155, 76, 0.12)',
                color: 'var(--editorial-accent)',
                border: '1px solid rgba(196, 155, 76, 0.25)',
              }}
            >
              {selectedCategory}
              <button onClick={() => handleFilterClick('category', selectedCategory)} style={{ color: 'var(--editorial-accent)' }}>✕</button>
            </span>
          )}
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs font-medium underline transition-colors ml-2" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* 3. COLLAPSIBLE FILTERS SECTION */}
      <AnimatePresence>
        {areFiltersVisible && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-8 rounded-2xl mb-10"
              style={{
                backgroundColor: 'var(--editorial-surface)',
                border: '1px solid var(--editorial-border)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              }}>
              {/* Letter Grid */}
              <h3 className="text-xs font-bold mb-4 uppercase tracking-widest" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>Starts with</h3>
              <div className="flex flex-wrap gap-2 mb-8">
                <button
                  onClick={() => handleFilterClick('letter', '')}
                  className="px-5 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-200 active:scale-95"
                  style={{
                    fontFamily: 'var(--font-body)',
                    backgroundColor: !selectedLetter ? 'var(--editorial-accent)' : 'var(--editorial-bg)',
                    color: !selectedLetter ? '#fff' : 'var(--editorial-muted)',
                    border: !selectedLetter ? 'none' : '1px solid var(--editorial-border)',
                  }}
                >
                  ALL
                </button>
                {ALPHABET.map((l) => (
                  <button
                    key={l}
                    onClick={() => handleFilterClick('letter', l)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-200 active:scale-95"
                    style={{
                      fontFamily: 'var(--font-body)',
                      backgroundColor: selectedLetter === l ? 'var(--editorial-accent)' : 'var(--editorial-bg)',
                      color: selectedLetter === l ? '#fff' : 'var(--editorial-muted)',
                      border: selectedLetter === l ? 'none' : '1px solid var(--editorial-border)',
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {/* Category Grid */}
              <h3 className="text-xs font-bold mb-4 uppercase tracking-widest" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>Category</h3>
              <div className="flex flex-wrap gap-2">
                {initialCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleFilterClick('category', cat)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95"
                    style={{
                      fontFamily: 'var(--font-body)',
                      backgroundColor: selectedCategory === cat ? 'var(--editorial-rust)' : 'var(--editorial-bg)',
                      color: selectedCategory === cat ? '#fff' : 'var(--editorial-muted)',
                      border: selectedCategory === cat ? 'none' : '1px solid var(--editorial-border)',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. RESULTS COUNT & LIST */}
      <div className="relative min-h-[400px]">
        <AnimatePresence>
          {isPending && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center pt-20"
              style={{ backgroundColor: 'var(--editorial-bg)', opacity: 0.7 }}
            >
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-500/20 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-12 h-12 border-t-4 border-blue-500 rounded-full animate-spin" />
              </div>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>
                Filtering Archive...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-sm font-medium mb-6 flex items-center gap-2" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--editorial-accent)' }}></span>
          Found {words.length} result{words.length !== 1 ? 's' : ''}{totalWords > 0 ? ` out of ${totalWords.toLocaleString()} total words` : ''}
        </div>

        <motion.div 
          variants={listVariants}
          initial="hidden"
          animate="visible"
          key={`${selectedLetter}-${selectedCategory}-${sortMode}`}
          className="space-y-4"
        >
        {words.map((word) => (
          <motion.div key={word.bikol} variants={itemVariants}>
            <Link
              href={`/word/${encodeURIComponent(word.bikol)}`}
              prefetch={false}
              onMouseEnter={() => router.prefetch(`/word/${encodeURIComponent(word.bikol)}`)}
              className="block p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 group"
              style={{
                backgroundColor: 'var(--editorial-surface)',
                border: '1px solid var(--editorial-border)',
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold transition-colors group-hover:text-[var(--editorial-accent)]"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--editorial-text)' }}
                  >
                    {highlightText(word.bikol)}
                  </h2>
                  <p className="mt-1 font-medium" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>{highlightText(displayTranslation(word))}</p>
                  {langMode === 'all' && word.tagalog && (
                    <p className="text-xs mt-2 italic" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>Tagalog: {highlightText(word.tagalog)}</p>
                  )}
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  {word.pos && (
                    <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded"
                      style={{
                        fontFamily: 'var(--font-body)',
                        backgroundColor: 'var(--editorial-bg)',
                        color: 'var(--editorial-muted)',
                        border: '1px solid var(--editorial-border)',
                      }}>{normalizePOS(word.pos)}</span>
                  )}
                  {word.category && (
                    <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded"
                      style={{
                        fontFamily: 'var(--font-body)',
                        backgroundColor: 'var(--editorial-bg)',
                        color: 'var(--editorial-accent)',
                        border: '1px solid var(--editorial-border)',
                      }}>{word.category}</span>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
        
        {/* Infinite Scroll Trigger */}
        <div ref={observerTarget} className="h-20 flex items-center justify-center">
          {isLoadingMore && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--editorial-border)', borderTopColor: 'var(--editorial-accent)' }} />
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>Loading more...</p>
            </div>
          )}
          {!hasMore && words.length > 0 && (
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>End of Archive</p>
          )}
        </div>

        {words.length === 0 && !isLoadingMore && (
           <motion.div variants={itemVariants} className="text-center py-12" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>
             {query || hasActiveFilters ? `No matches found. Try adjusting your search or filters.` : `No words found.`}
           </motion.div>
        )}
      </motion.div>
      </div>
    </div>
  );
}

