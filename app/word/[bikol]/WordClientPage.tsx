"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2, Info, Book, BookOpen, ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { saveToHistory } from '@/lib/offline';
import AudioPlayer from '@/components/AudioPlayer';
import { useLanguageMode } from '@/hooks/useLanguageMode';
import { VerbConjugator } from '@/components/dictionary/VerbConjugator';
import { GrammarHighlight } from '@/components/GrammarHighlight';
import WordJsonLd from '@/components/WordJsonLd';
import { normalizePOS, normalizeDefinitionText, formatDialect } from '@/lib/lexicography';
import type { WordDisplayData, AffixGroup } from '@/lib/types/word';


const SOURCE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  mintz_book: {
    label: 'Mintz Dictionary',
    icon: '📖',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  wiktionary: {
    label: 'Wiktionary',
    icon: '🌐',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  learnbikol: {
    label: 'LearnBikol.com',
    icon: '🎓',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
};

function SourceBadge({ source, sourceUrl }: { source: string; sourceUrl?: string | null }) {
  const info = SOURCE_LABELS[source];
  if (!info) return null;

  return (
    <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all hover:-translate-y-0.5 hover:shadow-md ${info.color}`}>
      <span>{info.icon}</span>
      <span>{info.label}</span>
      {sourceUrl && (
        <span className="opacity-60 hidden sm:inline">• {sourceUrl}</span>
      )}
    </span>
  );
}

/** Breadcrumb trail showing Home > Browse > [word] */
function Breadcrumbs({ bikol, pos }: { bikol: string; pos: string | null }) {
  const normalizedPos = normalizePOS(pos);
  const browseHref = `/browse?q=${encodeURIComponent(bikol.charAt(0).toLowerCase())}`;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex-wrap mb-2">
      <Link
        href="/"
        className="inline-flex items-center gap-1 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
      >
        <Home className="w-3 h-3" />
        Home
      </Link>
      <ChevronRight className="w-3 h-3" />
      <Link
        href="/browse"
        className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
      >
        Browse
      </Link>
      <ChevronRight className="w-3 h-3" />
      <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[160px]">
        {bikol}
      </span>
      {normalizedPos && (
        <>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-500 dark:text-zinc-600 hidden sm:inline">
            {normalizedPos}
          </span>
        </>
      )}
    </nav>
  );
}

export default function WordClientPage({ word, isNormalized }: { word: WordDisplayData, isNormalized: boolean }) {
  const langMode = useLanguageMode();

  // Normalize the data for internal use
  const bikol = word.bikol;
  const pos = word.pos;
  const pronunciation = word.pronunciation;
  const audio_url = word.audio_url;
  const etymology = word.etymology;

  // Definitions normalized to an array
  const definitions: WordDisplayData['definitions'] = isNormalized 
    ? (word.definitions ?? []) 
    : [{
        english: word.english ?? null,
        tagalog: word.tagalog ?? null,
        dialect: word.dialect ?? null,
        synonyms: word.synonyms ?? null,
        source: (word.source_url?.includes('wiktionary') ? 'wiktionary' 
               : word.source_url?.includes('learnbikol') ? 'learnbikol' 
               : 'unknown'),
        source_url: word.source_url ?? null,
        exampleSentences: word.example_bikol ? [{ bikol: word.example_bikol, english: word.example_english ?? null }] : []
      }];

  // Check if we should show VerbConjugator
  const isVerb = pos?.trim().toUpperCase() === 'VERB';
  const hasAffixPair = isNormalized && (word.definitions ?? []).some((d) => d.affixPair && d.affixPair !== 'UNKNOWN');
  
  // Defensive check for legacy words: if it ends in -on, -an, or starts with mag- and has no POS, treat as potential verb
  const looksLikeVerb = (
    bikol.toLowerCase().endsWith('on') || 
    bikol.toLowerCase().endsWith('an') || 
    bikol.toLowerCase().startsWith('mag') ||
    isVerb
  );

  const showConjugator = isVerb || hasAffixPair || looksLikeVerb;

  // Prepare affix groups for VerbConjugator
  let affixGroups: AffixGroup[] = isNormalized 
    ? (word.definitions ?? [])
        .filter((d) => d.affixPair && d.affixPair !== 'UNKNOWN')
        .map((d) => ({
          affixPair: d.affixPair!,
          focusType: d.focusType || 'UNKNOWN',
          conjugations: (d.conjugations ?? [])
            .filter((c) => {
              if (d.focusType && d.focusType !== 'UNKNOWN') {
                return c.focus === d.focusType;
              }
              return true;
            })
            .map((c) => ({
              tense: c.tense,
              form: c.form
            }))
        }))
    : [];

  // Unified fallback for any verb (normalized or legacy) that lacks affix metadata
  if (affixGroups.length === 0 && (looksLikeVerb || isVerb)) {
    let inferredAffix = "UNKNOWN";
    let inferredFocus = "UNKNOWN";

    if (bikol.toLowerCase().endsWith('on')) {
      inferredAffix = "-ON / MAG-";
      inferredFocus = "OBJECT";
    } else if (bikol.toLowerCase().endsWith('an')) {
      inferredAffix = "-AN / MAG-";
      inferredFocus = "REFERENTIAL";
    } else if (bikol.toLowerCase().startsWith('mag')) {
      inferredAffix = "MAG- / -ON";
      inferredFocus = "ACTOR";
    }

    if (inferredAffix !== "UNKNOWN") {
      affixGroups = [{
        affixPair: inferredAffix,
        focusType: inferredFocus,
        conjugations: [] // VerbConjugator will handle generation if empty
      }];
    } else if (isVerb) {
      // Default to MAG- if it's explicitly tagged but the form is ambiguous (e.g. root)
      affixGroups = [{
        affixPair: "MAG- / -ON",
        focusType: "ACTOR",
        conjugations: []
      }];
    }
  }

  useEffect(() => {
    if (word && word.bikol) {
      saveToHistory(word);
    }
  }, [word]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 p-3 sm:p-4 md:p-8">
      <WordJsonLd
        bikol={bikol}
        english={definitions[0]?.english || ''}
        tagalog={definitions[0]?.tagalog}
        pos={pos}
        pronunciation={pronunciation}
        definitions={definitions}
      />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* ─── Breadcrumb + Back Navigation ────────────────────────────── */}
        <div className="space-y-2">
          <Breadcrumbs bikol={bikol} pos={pos} />

          <div className="flex items-center justify-between flex-wrap gap-4">
            <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-bold transition-all hover:-translate-x-1 active:scale-95">
              <ArrowLeft className="h-5 w-5" /> Back to Search
            </Link>
            <Link
              href="/flashcards"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition-colors active:scale-95 shadow-lg shadow-blue-500/20"
            >
              <BookOpen className="w-4 h-4" />
              Study with Flashcards
            </Link>
          </div>
        </div>

        <section className="bg-zinc-50 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-white/5 rounded-[28px] sm:rounded-[40px] p-6 sm:p-8 md:p-12 shadow-2xl space-y-8 relative overflow-hidden">
          {/* Background Decorative Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div className="flex-1">
              <span className="px-4 py-1 bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-widest rounded-full border border-blue-500/20">
                {normalizePOS(pos) || 'Word'}{formatDialect(definitions[0]?.dialect) ? ` • ${formatDialect(definitions[0]?.dialect)}` : ''}
              </span>
              <h2 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mt-4 bg-clip-text text-transparent bg-gradient-to-b from-zinc-900 dark:from-white to-zinc-400">{bikol}</h2>
              <div className="flex items-center gap-6 mt-4">
                {pronunciation && <p className="text-2xl text-zinc-400 dark:text-zinc-500 font-medium font-mono">/ {pronunciation} /</p>}
                {audio_url && <AudioPlayer url={audio_url} />}
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                className="p-4 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-90 transition-all shadow-lg" 
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
                <Share2 className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
            {/* Definitions Column */}
            <div className="space-y-8">
              <h3 className="text-sm font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Info className="h-4 w-4" /> Definitions</h3>
              <div className="space-y-10">
                {definitions.map((def, idx: number) => (
                  <div key={idx} className="space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      {definitions.length > 1 && (
                        <span className="text-blue-500 font-black text-xs">{idx + 1}.</span>
                      )}
                      {def.source && def.source !== 'unknown' && (
                        <SourceBadge source={def.source} sourceUrl={def.source_url} />
                      )}
                    </div>
                    {(langMode === 'en' || langMode === 'all') && def.english && (
                      <div>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest mb-1 opacity-50">ENGLISH</p>
                        <p className="text-2xl font-bold leading-tight text-zinc-800 dark:text-zinc-100">{normalizeDefinitionText(def.english)}</p>
                      </div>
                    )}
                    {(langMode === 'tl' || langMode === 'all') && def.tagalog && (
                      <div>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest mb-1 opacity-50">TAGALOG</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 leading-tight">{normalizeDefinitionText(def.tagalog)}</p>
                      </div>
                    )}
                    {langMode === 'tl' && !def.tagalog && def.english && (
                      <div>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest mb-1 opacity-50">ENGLISH (Fallback)</p>
                        <p className="text-2xl font-bold leading-tight text-zinc-800 dark:text-zinc-100">{normalizeDefinitionText(def.english)}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Column */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Book className="h-4 w-4" /> Usage</h3>
              <div className="space-y-4">
                {definitions.flatMap((d) => d.exampleSentences || []).map((ex, i: number) => (
                  <div key={i} className="p-8 bg-blue-50 dark:bg-blue-500/5 rounded-3xl border border-blue-100 dark:border-white/5 italic relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-xl font-bold text-zinc-800 dark:text-zinc-100 relative z-10">
                      "<GrammarHighlight text={ex.bikol ?? ''} />"
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-500 mt-2 relative z-10">— {ex.english ?? ''}</p>
                  </div>
                ))}
                {definitions.every((d) => !d.exampleSentences || d.exampleSentences.length === 0) && (
                  <div className="p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-white/10 text-center">
                    <p className="text-zinc-400 dark:text-zinc-500 italic">No example sentences available.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verb Conjugator Section */}
          {showConjugator && affixGroups.length > 0 && (
            <div className="pt-12 border-t border-zinc-200 dark:border-white/5 space-y-6 relative z-10">
              <h3 className="text-sm font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">Verb Conjugation</h3>
              <VerbConjugator rootWord={bikol} affixGroups={affixGroups} />
            </div>
          )}

          {(() => {
            const getSynonyms = (syns: unknown): string[] => {
              if (Array.isArray(syns)) return syns.filter((s): s is string => typeof s === 'string');
              if (typeof syns === 'string') return syns.split(',').map((s) => s.trim()).filter(Boolean);
              return [];
            };

            const allSynonyms = definitions.reduce((acc: string[], def) => {
              const syns = getSynonyms(def.synonyms);
              return [...acc, ...syns];
            }, []);
            const uniqueSynonyms = Array.from(new Set(allSynonyms));
            
            return (etymology || uniqueSynonyms.length > 0) && (
              <div className="pt-8 border-t border-zinc-200 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                {etymology && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">Etymology</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{etymology}</p>
                  </div>
                )}
                {uniqueSynonyms.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">Synonyms</h3>
                    <div className="flex flex-wrap gap-2">
                      {uniqueSynonyms.map((s: string, i: number) => (
                        <Link 
                          key={i} 
                          href={`/word/${encodeURIComponent(s)}`}
                          className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-300 border border-zinc-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
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
