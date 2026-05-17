"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Share2, Info, Book } from 'lucide-react';
import { saveToHistory } from '@/lib/offline';
import AudioPlayer from '@/components/AudioPlayer';
import type { LanguageMode } from '@/components/LanguageToggle';

export default function WordClientPage({ word }: { word: any }) {
  const router = useRouter();
  const [langMode, setLangMode] = useState<LanguageMode>('en');

  useEffect(() => {
    // Load initial preference
    const saved = localStorage.getItem('bikoldict-lang-mode') as LanguageMode;
    if (saved) setLangMode(saved);

    // Listen for changes
    const handleLangChange = (e: any) => {
      setLangMode(e.detail);
    };

    window.addEventListener('lang-mode-change', handleLangChange);
    return () => window.removeEventListener('lang-mode-change', handleLangChange);
  }, []);

  useEffect(() => {
    if (word && word.bikol) {
      saveToHistory(word);
    }
  }, [word]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="max-w-4xl mx-auto space-y-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-primary font-bold transition-colors">
          <ArrowLeft className="h-5 w-5" /> Back to Search
        </button>

        <section className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[40px] p-8 md:p-12 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <span className="px-4 py-1 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full">{word.pos || 'Word'} • {word.dialect || 'General'}</span>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter mt-4">{word.bikol}</h2>
              <div className="flex items-center gap-6 mt-4">
                {word.pronunciation && <p className="text-2xl text-zinc-400 font-medium">/ {word.pronunciation} /</p>}
                {word.audio_url && <AudioPlayer url={word.audio_url} />}
              </div>
            </div>
            <div className="flex gap-3">
              <button className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:scale-105 transition-transform" onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `Bikol Dictionary: ${word.bikol}`,
                    text: `Check out the definition of "${word.bikol}" on Bikol Dictionary.`,
                    url: window.location.href,
                  });
                }
              }}>
                <Share2 className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Info className="h-4 w-4" /> Definitions</h3>
              <div className="space-y-4">
                {(langMode === 'en' || langMode === 'all') && (
                  <div>
                    <p className="text-sm text-zinc-500 font-bold">ENGLISH</p>
                    <p className="text-2xl font-bold leading-tight">{word.english}</p>
                  </div>
                )}
                {(langMode === 'tl' || langMode === 'all') && word.tagalog && (
                  <div>
                    <p className="text-sm text-zinc-500 font-bold">TAGALOG</p>
                    <p className="text-2xl font-bold text-primary leading-tight">{word.tagalog}</p>
                  </div>
                )}
                {langMode === 'tl' && !word.tagalog && (
                  <div>
                    <p className="text-sm text-zinc-500 font-bold">ENGLISH (Fallback)</p>
                    <p className="text-2xl font-bold leading-tight">{word.english}</p>
                  </div>
                )}
              </div>
            </div>

            {word.example_bikol && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Book className="h-4 w-4" /> Usage</h3>
                <div className="p-6 bg-primary/5 dark:bg-primary/10 rounded-3xl border border-primary/10 italic">
                  <p className="text-xl font-bold">"{word.example_bikol}"</p>
                  <p className="text-zinc-500 mt-2">— {word.example_english}</p>
                </div>
              </div>
            )}
          </div>

          {(() => {
            const synonyms = Array.isArray(word.synonyms) 
              ? word.synonyms 
              : typeof word.synonyms === 'string' 
                ? word.synonyms.split(',').map((s: string) => s.trim()).filter(Boolean)
                : [];
            
            return (word.etymology || synonyms.length > 0) && (
              <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-8">
                {word.etymology && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">Etymology</h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{word.etymology}</p>
                  </div>
                )}
                {synonyms.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">Synonyms</h3>
                    <div className="flex flex-wrap gap-2">
                      {synonyms.map((s: string, i: number) => (
                        <Link 
                          key={i} 
                          href={`/word/${encodeURIComponent(s)}`}
                          className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 rounded-lg text-sm font-bold transition-all"
                        >
                          {s}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </section>
      </div>
    </div>
  );
}
