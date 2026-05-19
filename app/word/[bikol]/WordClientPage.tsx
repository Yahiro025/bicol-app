"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2, Info, Book } from 'lucide-react';
import { motion } from 'framer-motion';
import { saveToHistory } from '@/lib/offline';
import AudioPlayer from '@/components/AudioPlayer';
import type { LanguageMode } from '@/components/LanguageToggle';
import { VerbConjugator } from '@/components/dictionary/VerbConjugator';
import { GrammarHighlight } from '@/components/GrammarHighlight';

export default function WordClientPage({ word, isNormalized }: { word: any, isNormalized: boolean }) {
  const [langMode, setLangMode] = useState<LanguageMode>('all');

  // Normalize the data for internal use
  const bikol = word.bikol;
  const pos = word.pos;
  const pronunciation = word.pronunciation;
  const audio_url = word.audio_url;
  const etymology = word.etymology;

  // Definitions normalized to an array
  const definitions = isNormalized 
    ? word.definitions 
    : [{
        english: word.english,
        tagalog: word.tagalog,
        dialect: word.dialect,
        synonyms: word.synonyms,
        exampleSentences: word.example_bikol ? [{ bikol: word.example_bikol, english: word.example_english }] : []
      }];

  // Check if we should show VerbConjugator
  const isVerb = pos?.toUpperCase() === 'VERB';
  const hasAffixPair = isNormalized && word.definitions.some((d: any) => d.affixPair && d.affixPair !== 'UNKNOWN');
  const showConjugator = isVerb || hasAffixPair;

  // Prepare affix groups for VerbConjugator
  const affixGroups = isNormalized 
    ? word.definitions
        .filter((d: any) => d.affixPair && d.affixPair !== 'UNKNOWN')
        .map((d: any) => ({
          affixPair: d.affixPair,
          focusType: d.focusType || 'UNKNOWN',
          conjugations: d.conjugations.map((c: any) => ({
            tense: c.tense,
            form: c.form
          }))
        }))
    : [];

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
              <span className="px-4 py-1 bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-widest rounded-full border border-blue-500/20">
                {pos || 'Word'} • {definitions[0]?.dialect || 'General'}
              </span>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter mt-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">{bikol}</h2>
              <div className="flex items-center gap-6 mt-4">
                {pronunciation && <p className="text-2xl text-zinc-500 font-medium font-mono">/ {pronunciation} /</p>}
                {audio_url && <AudioPlayer url={audio_url} />}
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                className="p-4 bg-zinc-800 border border-white/5 rounded-2xl hover:bg-zinc-700 active:scale-90 transition-all shadow-lg" 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `Bikol Dictionary: ${bikol}`,
                      text: `Check out the definition of "${bikol}" on Bikol Dictionary.`,
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
            {/* Definitions Column */}
            <div className="space-y-8">
              <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Info className="h-4 w-4" /> Definitions</h3>
              <div className="space-y-10">
                {definitions.map((def: any, idx: number) => (
                  <div key={idx} className="space-y-4">
                    {definitions.length > 1 && (
                      <span className="text-blue-500 font-black text-xs">DEFINITION {idx + 1}</span>
                    )}
                    {(langMode === 'en' || langMode === 'all') && def.english && (
                      <div>
                        <p className="text-xs text-zinc-500 font-black uppercase tracking-widest mb-1 opacity-50">ENGLISH</p>
                        <p className="text-2xl font-bold leading-tight text-zinc-100">{def.english}</p>
                      </div>
                    )}
                    {(langMode === 'tl' || langMode === 'all') && def.tagalog && (
                      <div>
                        <p className="text-xs text-zinc-500 font-black uppercase tracking-widest mb-1 opacity-50">TAGALOG</p>
                        <p className="text-2xl font-bold text-blue-400 leading-tight">{def.tagalog}</p>
                      </div>
                    )}
                    {langMode === 'tl' && !def.tagalog && def.english && (
                      <div>
                        <p className="text-xs text-zinc-500 font-black uppercase tracking-widest mb-1 opacity-50">ENGLISH (Fallback)</p>
                        <p className="text-2xl font-bold leading-tight text-zinc-100">{def.english}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Column */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Book className="h-4 w-4" /> Usage</h3>
              <div className="space-y-4">
                {definitions.flatMap((d: any) => d.exampleSentences || []).map((ex: any, i: number) => (
                  <div key={i} className="p-8 bg-blue-500/5 rounded-3xl border border-white/5 italic relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-xl font-bold text-zinc-100 relative z-10">
                      "<GrammarHighlight text={ex.bikol} />"
                    </p>
                    <p className="text-zinc-500 mt-2 relative z-10">— {ex.english}</p>
                  </div>
                ))}
                {definitions.every((d: any) => !d.exampleSentences || d.exampleSentences.length === 0) && (
                  <div className="p-8 bg-zinc-900/50 rounded-3xl border border-dashed border-white/10 text-center">
                    <p className="text-zinc-500 italic">No example sentences available.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verb Conjugator Section */}
          {showConjugator && affixGroups.length > 0 && (
            <div className="pt-12 border-t border-white/5 space-y-6 relative z-10">
              <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">Verb Conjugation</h3>
              <VerbConjugator rootWord={bikol} affixGroups={affixGroups} />
            </div>
          )}

          {(() => {
            const getSynonyms = (syns: any) => {
              if (Array.isArray(syns)) return syns;
              if (typeof syns === 'string') return syns.split(',').map((s: string) => s.trim()).filter(Boolean);
              return [];
            };

            const allSynonyms = definitions.reduce((acc: string[], def: any) => {
              const syns = getSynonyms(def.synonyms);
              return [...acc, ...syns];
            }, []);
            const uniqueSynonyms = Array.from(new Set(allSynonyms));
            
            return (etymology || uniqueSynonyms.length > 0) && (
              <div className="pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                {etymology && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">Etymology</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{etymology}</p>
                  </div>
                )}
                {uniqueSynonyms.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">Synonyms</h3>
                    <div className="flex flex-wrap gap-2">
                      {uniqueSynonyms.map((s: string, i: number) => (
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
