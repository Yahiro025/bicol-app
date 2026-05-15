"use client";
import React, { useState, useEffect } from 'react';
import AutocompleteSearch from '@/components/AutocompleteSearch';
import { Search, GraduationCap, PlusCircle, LayoutGrid } from 'lucide-react';
import Flashcards from '@/components/Flashcards';
import UserSubmissionForm from '@/components/UserSubmissionForm';
import { getHistory } from '@/lib/offline';

export const dynamic = 'force-dynamic';

export default function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'learn' | 'contribute'>('search');
  const [history, setHistory] = useState<any[]>([]);
  const [learnWords, setLearnWords] = useState<any[]>([]);

  useEffect(() => {
    getHistory().then(setHistory);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'learn' && learnWords.length === 0) {
      fetch('/api/learn')
        .then(res => res.json())
        .then(setLearnWords);
    }
  }, [activeTab, learnWords.length]);

  return (
    <div className="selection:bg-primary/30">
      <main className="max-w-7xl mx-auto px-4 py-8 pb-24">
        {activeTab === 'search' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <section className="text-center space-y-4">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
                Master the <span className="text-primary italic">Bikol</span> language.
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium">
                Search thousands of words across 5+ dialects with AI-enriched translations and offline support.
              </p>
            </section>

            <AutocompleteSearch />

            {history.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-zinc-400">
                  <LayoutGrid className="h-4 w-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">Recently Viewed</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {history.slice(0, 6).map((item, idx) => (
                    <div key={idx} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl hover:border-primary/50 transition-all group">
                      <h3 className="text-xl font-black group-hover:text-primary transition-colors">{item.bikol}</h3>
                      <p className="text-zinc-500 mt-2 text-sm line-clamp-2">{item.english}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === 'learn' && (
          <div className="animate-in zoom-in-95 duration-500">
            <Flashcards words={learnWords} />
          </div>
        )}

        {activeTab === 'contribute' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <UserSubmissionForm />
          </div>
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 px-2 py-2 rounded-3xl shadow-2xl flex items-center gap-1 z-50">
        <button 
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'search' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
        >
          <Search className="h-5 w-5" />
          <span className="hidden md:inline">Search</span>
        </button>
        <button 
          onClick={() => setActiveTab('learn')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'learn' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
        >
          <GraduationCap className="h-5 w-5" />
          <span className="hidden md:inline">Learn</span>
        </button>
        <button 
          onClick={() => setActiveTab('contribute')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'contribute' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
        >
          <PlusCircle className="h-5 w-5" />
          <span className="hidden md:inline">Contribute</span>
        </button>
      </nav>
    </div>
  );
}

