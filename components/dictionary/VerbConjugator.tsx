'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge tailwind classes
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ConjugationForm {
  tense: string;
  form: string;
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

const TENSE_LABELS: Record<string, string> = {
  infinitive: 'Infinitive',
  past: 'Past (Completed)',
  progressive: 'Progressive (Incomplete)',
  future: 'Future (Contemplated)',
};

const TENSE_ORDER = ['infinitive', 'past', 'progressive', 'future'];

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
                ? "text-white border-blue-500/50 bg-blue-500/10 shadow-sm"
                : "text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200 bg-transparent"
            )}
          >
            <span className="relative z-10">{group.affixPair}</span>
            {activeTab === index && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute inset-0 rounded-xl bg-blue-500/10"
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
        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold mb-1">
          Focus Category
        </p>
        <div className="flex items-center gap-3">
           <div className="w-1.5 h-6 rounded-full bg-blue-500" />
           <h3 className="text-xl font-semibold text-zinc-100 tracking-tight">
             {currentGroup.focusType}
           </h3>
        </div>
      </motion.div>

      {/* Conjugation Grid (Semantic Definition List) */}
      <dl className="grid grid-cols-1 border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950/30 backdrop-blur-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentGroup.affixPair}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="divide-y divide-zinc-800/50"
          >
            {TENSE_ORDER.map((tenseKey) => {
              const conj = currentGroup.conjugations.find(
                c => c.tense.toLowerCase().includes(tenseKey)
              );
              
              return (
                <motion.div
                  key={tenseKey}
                  whileHover={{ backgroundColor: "rgba(39, 39, 42, 0.3)" }}
                  className={cn(
                    "group flex flex-col md:flex-row md:items-center justify-between p-5 transition-all duration-300",
                    "border-zinc-800/50 z-10 relative cursor-default"
                  )}
                >
                  <dt className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-blue-400/60 transition-colors">
                      {TENSE_LABELS[tenseKey]}
                    </span>
                  </dt>
                  <dd className="mt-1.5 md:mt-0">
                    <span className="text-2xl font-medium text-zinc-100 font-display italic tracking-tight group-hover:text-white transition-colors">
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
      <div className="flex items-center justify-between px-2 pt-2 border-t border-zinc-900">
        <p className="text-[11px] text-zinc-600 font-medium">
          ROOT WORD: <span className="text-zinc-300 tracking-wider font-bold ml-1">{rootWord.toUpperCase()}</span>
        </p>
        <span className="text-[10px] text-zinc-700 font-mono">LEXICON ARCHIVE V1</span>
      </div>
    </div>
  );
}
