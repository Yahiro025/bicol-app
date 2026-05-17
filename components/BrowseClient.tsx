'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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
} as const; // <--- ADD 'as const' HERE

export default function BrowseClient({
  initialWords,
  initialCategories,
  initialLetter: defaultLetter,
  initialCategory: defaultCategory,
  initialQuery: defaultQuery,
}: {
  initialWords: Word[];
  initialCategories: string[];
  initialLetter: string;
  initialCategory: string;
  initialQuery: string;
}) {
  const router = useRouter();
  
  const [query, setQuery] = useState(defaultQuery);
  const [selectedLetter, setSelectedLetter] = useState(defaultLetter);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [filteredWords, setFilteredWords] = useState(initialWords);
  const [areFiltersVisible, setAreFiltersVisible] = useState(false);

  // Client-side filtering logic
  useEffect(() => {
    const filtered = initialWords.filter((word) => {
      const matchesQuery = !query || 
        word.bikol.toLowerCase().includes(query.toLowerCase()) ||
        word.english.toLowerCase().includes(query.toLowerCase()) ||
        (word.tagalog && word.tagalog.toLowerCase().includes(query.toLowerCase()));
      
      const matchesLetter = !selectedLetter || 
        word.bikol.toLowerCase().startsWith(selectedLetter.toLowerCase());
      
      const matchesCategory = !selectedCategory || 
        word.category === selectedCategory;

      return matchesQuery && matchesLetter && matchesCategory;
    });
    setFilteredWords(filtered);

    // Sync URL params without triggering a full server re-render if possible
    // We use router.replace with { scroll: false } which is the Next.js way, 
    // but to avoid the server component re-running we could also use window.history
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedLetter) params.set('letter', selectedLetter);
    if (selectedCategory) params.set('category', selectedCategory);
    
    const newUrl = `/browse${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
  }, [query, selectedLetter, selectedCategory, initialWords]);

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
      <div className="mb-8 relative max-w-2xl">
        <input
          type="text"
          value={query}
          onChange={handleSearchChange}
          placeholder={`Search dictionary...`}
          className="w-full px-8 py-4 bg-zinc-900 border border-zinc-800 rounded-full text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-950 text-lg transition-all duration-300 focus:bg-zinc-800/50"
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* 2. TOGGLE FILTER BUTTON & ACTIVE FILTER PILLS */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <button 
          onClick={() => setAreFiltersVisible(!areFiltersVisible)}
          className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 active:scale-95 border border-zinc-800 rounded-xl text-sm font-semibold transition-all duration-200"
        >
          <svg className={`w-4 h-4 transition-transform duration-300 ${areFiltersVisible ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          {areFiltersVisible ? 'Hide Filters' : 'Show Filters'}
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {selectedLetter && (
            <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold flex items-center gap-2">
              Letter: {selectedLetter} 
              <button onClick={() => handleFilterClick('letter', selectedLetter)} className="hover:text-white transition-colors">✕</button>
            </span>
          )}
          {selectedCategory && (
            <span className="px-4 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-xs font-bold flex items-center gap-2">
              {selectedCategory} 
              <button onClick={() => handleFilterClick('category', selectedCategory)} className="hover:text-white transition-colors">✕</button>
            </span>
          )}
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-zinc-500 hover:text-white underline font-medium transition-colors ml-2">
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
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl mb-10 shadow-2xl">
              {/* Letter Grid */}
              <h3 className="text-xs font-bold text-zinc-500 mb-4 uppercase tracking-widest">Starts with</h3>
              <div className="flex flex-wrap gap-2 mb-8">
                <button
                  onClick={() => handleFilterClick('letter', '')}
                  className={`px-5 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 active:scale-95 ${
                    !selectedLetter 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 border border-zinc-700'
                  }`}
                >
                  ALL
                </button>
                {ALPHABET.map((l) => (
                  <button
                    key={l}
                    onClick={() => handleFilterClick('letter', l)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 active:scale-95 ${
                      selectedLetter === l 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 border border-zinc-700'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {/* Category Grid */}
              <h3 className="text-xs font-bold text-zinc-500 mb-4 uppercase tracking-widest">Category</h3>
              <div className="flex flex-wrap gap-2">
                {initialCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleFilterClick('category', cat)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${
                      selectedCategory === cat 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 border border-zinc-700'
                    }`}
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
      <div className="text-sm font-medium text-zinc-500 mb-6 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        Found {filteredWords.length} result{filteredWords.length !== 1 ? 's' : ''}
      </div>

      <motion.div 
        variants={listVariants}
        initial="hidden"
        animate="visible"
        key={`${selectedLetter}-${selectedCategory}`}
        className="space-y-4"
      >
        {filteredWords.map((word) => {
          const wordUrl = `/word/${encodeURIComponent(word.bikol)}`;
          return (
            <motion.div key={word.bikol} variants={itemVariants}>
              <Link 
                href={wordUrl}
                prefetch={false}
                onMouseEnter={() => router.prefetch(wordUrl)}
                className="block bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 p-6 rounded-2xl hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-blue-500 group-hover:text-blue-400 transition-colors">
                      {highlightText(word.bikol)}
                    </h2>
                  <p className="text-zinc-100 mt-1 font-medium">{highlightText(word.english)}</p>
                  {word.tagalog && (
                    <p className="text-zinc-500 text-xs mt-2 italic">Tagalog: {highlightText(word.tagalog)}</p>
                  )}
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  {word.pos && (
                    <span className="text-[10px] uppercase tracking-widest font-black bg-zinc-800 text-zinc-400 px-2 py-1 rounded border border-zinc-700">{word.pos}</span>
                  )}
                  {word.category && (
                    <span className="text-[10px] uppercase tracking-widest font-black bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">{word.category}</span>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}

        {filteredWords.length === 0 && (
           <motion.div variants={itemVariants} className="text-center text-zinc-500 py-12">
             {query || hasActiveFilters ? `No matches found. Try adjusting your search or filters.` : `No words found.`}
           </motion.div>
        )}
      </motion.div>
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

