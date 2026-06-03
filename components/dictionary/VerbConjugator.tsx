'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { conjugateBikolVerb } from '@/lib/conjugator';
import { cn } from '@/lib/utils';
import { TENSE_LABELS, TENSE_ORDER } from '@/lib/constants';

export interface ConjugationForm {
  tense: string | null;
  form: string | null;
}

export interface AffixGroup {
  affixPair: string;
  focusType: string;
  conjugations: ConjugationForm[];
}

interface VerbConjugatorProps {
  rootWord: string;
  affixGroups: AffixGroup[];
}

const springTransition = {
  type: "spring",
  stiffness: 100,
  damping: 15,
  mass: 1
} as const;

/**
 * VerbConjugator Component
 * 
 * Displays verb conjugations for Bikol roots based on affix pairs and focus types.
 * Follows "The Living Archive" design system:
 * - Resting Rigor: Flat UI with 1px zinc borders.
 * - Responsive Bloom: Interactive lift and blue-tinted shadows on hover.
 */
export function VerbConjugator({ rootWord, affixGroups }: VerbConjugatorProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (!affixGroups || affixGroups.length === 0) {
    return null;
  }

  const currentGroup = affixGroups[activeTab];

  if (!currentGroup) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 py-4">
      {/* Affix Pair Selection (Tabs/Pills) */}
      <div className="flex flex-wrap gap-2 px-2 md:px-0" role="tablist" aria-label="Affix pairs">
        {affixGroups.map((group, index) => (
          <button
            key={group.affixPair}
            role="tab"
            aria-selected={activeTab === index}
            onClick={() => setActiveTab(index)}
            className={cn(
              "relative px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 outline-none min-h-[44px] flex items-center justify-center border",
              activeTab === index
                ? "border-[var(--editorial-accent)] bg-[rgba(196,155,76,0.1)] shadow-sm"
                : "border-[var(--editorial-border)] hover:border-[var(--editorial-muted)] hover:text-[var(--editorial-text)] bg-transparent"
            )}
          >
            <span className="relative z-10">{group.affixPair}</span>
            {activeTab === index && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute inset-0 rounded-xl"
                style={{ background: 'rgba(196,155,76,0.1)' }}
                initial={false}
                transition={springTransition}
              />
            )}
          </button>
        ))}
      </div>

      {/* Focus Type Information */}
      <motion.div 
        key={`focus-${activeTab}`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="px-2 md:px-0"
      >
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--editorial-muted)] font-bold mb-1">
          Focus Category
        </p>
        <div className="flex items-center gap-3">
           <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: 'var(--editorial-accent)' }} />
           <h3 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--editorial-text)' }}>
             {currentGroup.focusType}
           </h3>
        </div>
      </motion.div>

      {/* Conjugation Grid (Semantic Definition List) */}
      <dl className="grid grid-cols-1 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--editorial-border)', backgroundColor: 'var(--editorial-surface)' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentGroup.affixPair}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="divide-y relative" style={{ borderColor: 'var(--editorial-divider)' }}
          >
            {TENSE_ORDER.map((tenseKey) => {
              // 1. Try to find pre-stored conjugation
              let conj = currentGroup.conjugations.find(
                c => c.tense?.toLowerCase().includes(tenseKey)
              );

              // 2. Fallback: Generate dynamically if missing
              if (!conj) {
                const generated = conjugateBikolVerb(rootWord, currentGroup.affixPair, currentGroup.focusType);
                const match = generated.find(g => g.tense.toLowerCase().includes(tenseKey));
                if (match) {
                  conj = { tense: match.tense, form: match.form };
                }
              }
              
              return (
                <motion.div
                  key={tenseKey}
                  whileHover={{ backgroundColor: "var(--editorial-surface)" }}
                  className={cn(
                    "group flex flex-col md:flex-row md:items-center justify-between p-5 transition-all duration-300",
                    "z-10 relative cursor-default"
                  )}
                >
                  <dt className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-[var(--editorial-accent)] transition-colors" style={{ color: 'var(--editorial-muted)' }}>
                      {TENSE_LABELS[tenseKey]}
                    </span>
                  </dt>
                  <dd className="mt-1.5 md:mt-0">
                    <span className="text-2xl font-medium font-display italic tracking-tight group-hover:text-[var(--editorial-text)] transition-colors" style={{ color: 'var(--editorial-text)' }}>
                      {conj?.form || '—'}
                    </span>
                  </dd>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </dl>
      
      {/* Footer / Root Word Reference */}
      <div className="flex items-center justify-between px-2 pt-2" style={{ borderTop: '1px solid var(--editorial-divider)' }}>
        <p className="text-[11px] font-medium" style={{ color: 'var(--editorial-muted)' }}>
          ROOT WORD: <span className="tracking-wider font-bold ml-1" style={{ color: 'var(--editorial-accent)' }}>{rootWord.toUpperCase()}</span>
        </p>
        <span className="text-[10px] font-mono" style={{ color: 'var(--editorial-muted)' }}>LEXICON ARCHIVE V1</span>
      </div>
    </div>
  );
}
