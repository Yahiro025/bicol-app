"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2, Info, Book } from 'lucide-react';
import { motion } from 'framer-motion';
import { saveToHistory } from '@/lib/offline';
import AudioPlayer from '@/components/AudioPlayer';
import type { LanguageMode } from '@/components/LanguageToggle';

export default function WordClientPage({ word }: { word: any }) {
  const [langMode, setLangMode] = useState<LanguageMode>('all');

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
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white font-bold transition-all hover:-translate-x-1 active:scale-95">
          <ArrowLeft className="h-5 w-5" /> Back to Search
        </Link>

        <section className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl space-y-8 relative overflow-hidden">
          {/* Background Decorative Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div className="flex-1">
              <span className="px-4 py-1 bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-widest rounded-full border border-blue-500/20">{word.pos || 'Word'} • {word.dialect || 'General'}</span>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter mt-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">{word.bikol}</h2>
              <div className="flex items-center gap-6 mt-4">
                {word.pronunciation && <p className="text-2xl text-zinc-500 font-medium font-mono">/ {word.pronunciation} /</p>}
                {word.audio_url && <AudioPlayer url={word.audio_url} />}
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                className="p-4 bg-zinc-800 border border-white/5 rounded-2xl hover:bg-zinc-700 active:scale-90 transition-all shadow-lg" 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `Bikol Dictionary: ${word.bikol}`,
                      text: `Check out the definition of "${word.bikol}" on Bikol Dictionary.`,
                      url: window.location.href,
                    });
                  }
                }}
              >
                <Share2 className="h-6 w-6 text-zinc-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
            <div className="space-y-6">
              <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Info className="h-4 w-4" /> Definitions</h3>
              <div className="space-y-6">
                {(langMode === 'en' || langMode === 'all') && (
                  <div>
                    <p className="text-xs text-zinc-500 font-black uppercase tracking-widest mb-1 opacity-50">ENGLISH</p>
                    <p className="text-2xl font-bold leading-tight text-zinc-100">{word.english}</p>
                  </div>
                )}
                {(langMode === 'tl' || langMode === 'all') && word.tagalog && (
                  <div>
                    <p className="text-xs text-zinc-500 font-black uppercase tracking-widest mb-1 opacity-50">TAGALOG</p>
                    <p className="text-2xl font-bold text-blue-400 leading-tight">{word.tagalog}</p>
                  </div>
                )}
                {langMode === 'tl' && !word.tagalog && (
                  <div>
                    <p className="text-xs text-zinc-500 font-black uppercase tracking-widest mb-1 opacity-50">ENGLISH (Fallback)</p>
                    <p className="text-2xl font-bold leading-tight text-zinc-100">{word.english}</p>
                  </div>
                )}
              </div>
            </div>

            {word.example_bikol && (
              <div className="space-y-6">
                <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Book className="h-4 w-4" /> Usage</h3>
                <div className="p-8 bg-blue-500/5 rounded-3xl border border-white/5 italic relative overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-xl font-bold text-zinc-100 relative z-10">"{word.example_bikol}"</p>
                  <p className="text-zinc-500 mt-2 relative z-10">— {word.example_english}</p>
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
              <div className="pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                {word.etymology && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">Etymology</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{word.etymology}</p>
                  </div>
                )}
                {synonyms.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">Synonyms</h3>
                    <div className="flex flex-wrap gap-2">
                      {synonyms.map((s: string, i: number) => (
                        <Link 
                          key={i} 
                          href={`/word/${encodeURIComponent(s)}`}
                          className="px-4 py-2 bg-zinc-800 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 border border-white/5 hover:border-blue-500/30 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
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
      </motion.div>
    </div>
  );
}
