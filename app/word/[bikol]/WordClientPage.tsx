"use client";
import { useEffect, useState } from 'react';
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
import SuggestEditModal from '@/components/SuggestEditModal';


const SOURCE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  mintz_book: {
    label: 'Mintz Dictionary',
    icon: '📖',
    color: 'border-[var(--editorial-border)]',
  },
  wiktionary: {
    label: 'Wiktionary',
    icon: '🌐',
    color: 'border-[var(--editorial-border)]',
  },
  learnbikol: {
    label: 'LearnBikol.com',
    icon: '🎓',
    color: 'border-[var(--editorial-border)]',
  },
};

function SourceBadge({ source, sourceUrl }: { source: string; sourceUrl?: string | null }) {
  const info = SOURCE_LABELS[source];
  if (!info) return null;

  return (
    <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${info.color}`}
      style={{
        fontFamily: 'var(--font-body)',
        backgroundColor: 'var(--editorial-bg)',
        color: 'var(--editorial-muted)',
      }}>
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
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest flex-wrap mb-2" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>
      <Link
        href="/"
        className="inline-flex items-center gap-1 transition-colors hover:text-[var(--editorial-accent)]"
      >
        <Home className="w-3 h-3" />
        Home
      </Link>
      <ChevronRight className="w-3 h-3" />
      <Link
        href="/browse"
        className="transition-colors hover:text-[var(--editorial-accent)]"
      >
        Browse
      </Link>
      <ChevronRight className="w-3 h-3" />
      <span className="truncate max-w-[160px]" style={{ color: 'var(--editorial-text)' }}>
        {bikol}
      </span>
      {normalizedPos && (
        <>
          <ChevronRight className="w-3 h-3" />
          <span className="hidden sm:inline" style={{ color: 'var(--editorial-muted)' }}>
            {normalizedPos}
          </span>
        </>
      )}
    </nav>
  );
}

export default function WordClientPage({ word, isNormalized }: { word: WordDisplayData, isNormalized: boolean }) {
  const langMode = useLanguageMode();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { bikol, pos, pronunciation, audio_url, etymology } = word;

  const definitions: WordDisplayData['definitions'] = isNormalized
    ? (word.definitions ?? [])
    : [{
        english: word.english ?? null,
        tagalog: word.tagalog ?? null,
        dialect: word.dialect ?? null,
        synonyms: word.synonyms ?? null,
        source: word.source_url?.includes('wiktionary') ? 'wiktionary' : word.source_url?.includes('learnbikol') ? 'learnbikol' : 'unknown',
        source_url: word.source_url ?? null,
        exampleSentences: word.example_bikol ? [{ bikol: word.example_bikol, english: word.example_english ?? null }] : []
      }];

  const isVerb = pos?.trim().toUpperCase() === 'VERB';
  const hasAffixPair = isNormalized && (word.definitions ?? []).some((d) => d.affixPair && d.affixPair !== 'UNKNOWN');
  const lowerBikol = bikol.toLowerCase();
  const looksLikeVerb = lowerBikol.endsWith('on') || lowerBikol.endsWith('an') || lowerBikol.startsWith('mag') || isVerb;
  const showConjugator = isVerb || hasAffixPair || looksLikeVerb;

  let affixGroups: AffixGroup[] = isNormalized
    ? (word.definitions ?? [])
        .filter((d) => d.affixPair && d.affixPair !== 'UNKNOWN')
        .map((d) => ({
          affixPair: d.affixPair!,
          focusType: d.focusType || 'UNKNOWN',
          conjugations: (d.conjugations ?? []).filter((c) => !d.focusType || d.focusType === 'UNKNOWN' || c.focus === d.focusType).map((c) => ({ tense: c.tense, form: c.form }))
        }))
    : [];

  if (affixGroups.length === 0 && (looksLikeVerb || isVerb)) {
    let inferredAffix = "UNKNOWN", inferredFocus = "UNKNOWN";
    if (lowerBikol.endsWith('on')) { inferredAffix = "-ON / MAG-"; inferredFocus = "OBJECT"; }
    else if (lowerBikol.endsWith('an')) { inferredAffix = "-AN / MAG-"; inferredFocus = "REFERENTIAL"; }
    else if (lowerBikol.startsWith('mag')) { inferredAffix = "MAG- / -ON"; inferredFocus = "ACTOR"; }

    if (inferredAffix !== "UNKNOWN") {
      affixGroups = [{ affixPair: inferredAffix, focusType: inferredFocus, conjugations: [] }];
    } else if (isVerb) {
      affixGroups = [{ affixPair: "MAG- / -ON", focusType: "ACTOR", conjugations: [] }];
    }
  }

  useEffect(() => { if (word?.bikol) saveToHistory(word); }, [word]);

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-8" style={{ backgroundColor: 'var(--editorial-bg)' }}>
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
        {/* ─── Section Label ──────────────────────────────────────────── */}
        <span className="section-number">Word Entry</span>

        {/* ─── Breadcrumb + Back Navigation ────────────────────────────── */}
        <div className="space-y-2 mt-3">
          <Breadcrumbs bikol={bikol} pos={pos} />

          <div className="flex items-center justify-between flex-wrap gap-4">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold transition-all hover:-translate-x-1 active:scale-95" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>
              <ArrowLeft className="h-5 w-5" /> Back to Search
            </Link>
            <Link
              href="/flashcards"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors active:scale-95"
              style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--editorial-accent)', color: '#fff' }}
            >
              <BookOpen className="w-4 h-4" />
              Study with Flashcards
            </Link>
          </div>
        </div>

        <section className="rounded-[28px] sm:rounded-[40px] p-6 sm:p-8 md:p-12 space-y-8 relative overflow-hidden"
          style={{
            backgroundColor: 'var(--editorial-surface)',
            border: '1px solid var(--editorial-border)',
          }}>
          {/* Subtle accent glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(196,155,76,0.06) 0%, transparent 70%)' }} />
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div className="flex-1">
              <span className="px-4 py-1 text-xs font-bold uppercase tracking-widest rounded-full"
                style={{
                  fontFamily: 'var(--font-body)',
                  backgroundColor: 'rgba(196,155,76,0.1)',
                  color: 'var(--editorial-accent)',
                  border: '1px solid rgba(196,155,76,0.2)',
                }}>
                {normalizePOS(pos) || 'Word'}{formatDialect(definitions[0]?.dialect) ? ` • ${formatDialect(definitions[0]?.dialect)}` : ''}
              </span>
              <h2 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mt-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--editorial-text)' }}>{bikol}</h2>
              <div className="flex items-center gap-6 mt-4">
                {pronunciation && <p className="text-2xl font-medium font-mono" style={{ color: 'var(--editorial-muted)' }}>/ {pronunciation} /</p>}
                {audio_url && <AudioPlayer url={audio_url} />}
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button 
                className="px-5 py-4 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all flex items-center gap-2 font-semibold text-sm"
                style={{
                  fontFamily: 'var(--font-body)',
                  backgroundColor: 'var(--editorial-bg)',
                  border: '1px solid var(--editorial-border)',
                  color: 'var(--editorial-muted)',
                }}
                onClick={() => setIsEditModalOpen(true)}
              >
                <span>📝</span>
                <span>Suggest Edit</span>
              </button>
              <button 
                className="p-4 rounded-2xl active:scale-90 transition-all"
                style={{
                  backgroundColor: 'var(--editorial-bg)',
                  border: '1px solid var(--editorial-border)',
                }}
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
                <Share2 className="h-6 w-6" style={{ color: 'var(--editorial-muted)' }} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
            {/* Definitions Column */}
            <div className="space-y-8">
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}><Info className="h-4 w-4" /> Definitions</h3>
              <div className="space-y-10">
                {definitions.map((def, idx: number) => (
                  <div key={idx} className="space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      {definitions.length > 1 && (
                        <span className="font-bold text-xs" style={{ color: 'var(--editorial-accent)', fontFamily: 'var(--font-display)' }}>{idx + 1}.</span>
                      )}
                      {def.source && def.source !== 'unknown' && (
                        <SourceBadge source={def.source} sourceUrl={def.source_url} />
                      )}
                    </div>
                    {(langMode === 'en' || langMode === 'all') && def.english && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)', opacity: 0.6 }}>ENGLISH</p>
                        <p className="text-2xl font-bold leading-tight" style={{ color: 'var(--editorial-text)', fontFamily: 'var(--font-body)' }}>{normalizeDefinitionText(def.english)}</p>
                      </div>
                    )}
                    {(langMode === 'tl' || langMode === 'all') && def.tagalog && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)', opacity: 0.6 }}>TAGALOG</p>
                        <p className="text-2xl font-bold leading-tight" style={{ color: 'var(--editorial-accent)', fontFamily: 'var(--font-body)' }}>{normalizeDefinitionText(def.tagalog)}</p>
                      </div>
                    )}
                    {langMode === 'tl' && !def.tagalog && def.english && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)', opacity: 0.6 }}>ENGLISH (Fallback)</p>
                        <p className="text-2xl font-bold leading-tight" style={{ color: 'var(--editorial-text)', fontFamily: 'var(--font-body)' }}>{normalizeDefinitionText(def.english)}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Column */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}><Book className="h-4 w-4" /> Usage</h3>
              <div className="space-y-4">
                {definitions.flatMap((d) => d.exampleSentences || []).map((ex, i: number) => (
                  <div key={i} className="p-8 rounded-3xl italic relative overflow-hidden group"
                    style={{
                      backgroundColor: 'var(--editorial-bg)',
                      border: '1px solid var(--editorial-border)',
                    }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(196,155,76,0.03)' }} />
                    <p className="text-xl font-bold relative z-10" style={{ color: 'var(--editorial-text)', fontFamily: 'var(--font-body)' }}>
                      "<GrammarHighlight text={ex.bikol ?? ''} />"
                    </p>
                    <p className="mt-2 relative z-10" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>— {ex.english ?? ''}</p>
                  </div>
                ))}
                {definitions.every((d) => !d.exampleSentences || d.exampleSentences.length === 0) && (
                  <div className="p-8 rounded-3xl border border-dashed text-center" style={{ backgroundColor: 'var(--editorial-bg)', borderColor: 'var(--editorial-border)' }}>
                    <p className="italic" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>No example sentences available.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verb Conjugator Section */}
          {showConjugator && affixGroups.length > 0 && (
            <div className="pt-12 space-y-6 relative z-10" style={{ borderTop: '1px solid var(--editorial-divider)' }}>
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>Verb Conjugation</h3>
              <VerbConjugator rootWord={bikol} affixGroups={affixGroups} />
            </div>
          )}

          {(() => {
            const getSynonyms = (syns: unknown): string[] => {
              if (Array.isArray(syns)) return syns.filter((s): s is string => typeof s === 'string');
              if (typeof syns === 'string') return syns.split(',').map((s) => s.trim()).filter(Boolean);
              return [];
            };
            const allSynonyms = definitions.flatMap((def) => getSynonyms(def.synonyms));
            const uniqueSynonyms = Array.from(new Set(allSynonyms));
            if (!etymology && uniqueSynonyms.length === 0) return null;
            return (
              <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10" style={{ borderTop: '1px solid var(--editorial-divider)' }}>
                {etymology && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>Etymology</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>{etymology}</p>
                  </div>
                )}
                {uniqueSynonyms.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>Synonyms</h3>
                    <div className="flex flex-wrap gap-2">
                      {uniqueSynonyms.map((s, i) => (
                        <Link key={i} href={`/word/${encodeURIComponent(s)}`} className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95" style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--editorial-bg)', color: 'var(--editorial-accent)', border: '1px solid var(--editorial-border)' }}>
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

      <SuggestEditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        isNormalized={isNormalized}
        wordData={word}
      />
    </div>
  );
}
