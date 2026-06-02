"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { conjugateBikolVerb } from "@/lib/conjugator";
import { TENSE_LABELS } from "@/lib/constants";
import { Springs } from "@/lib/motion";

const DEMO_VERBS: Array<{ root: string; english: string; affix: string }> = [
  { root: "bakal", english: "buy", affix: "MAG- / -ON" },
  { root: "hiling", english: "look", affix: "MAG- / -ON" },
  { root: "tao", english: "give", affix: "I- / -AN" },
  { root: "hugas", english: "wash", affix: "MAG- / -AN" },
  { root: "kakan", english: "eat", affix: "MAG- / -ON" },
];

export default function HomeVerbDemo() {
  const [selectedVerb, setSelectedVerb] = useState(DEMO_VERBS[0]!);

  const conjugations = useMemo(() => {
    const results = conjugateBikolVerb(selectedVerb.root, selectedVerb.affix);
    // Group by focus
    const actorForms: Record<string, string> = {};
    const objectForms: Record<string, string> = {};
    const referentialForms: Record<string, string> = {};

    for (const c of results) {
      const label = TENSE_LABELS[c.tense.toLowerCase()] || c.tense;
      if (c.focus === "Actor") {
        actorForms[label] = c.form;
      } else if (c.focus === "Object") {
        // Distinguish Object vs Referential by affix pattern
        if (selectedVerb.affix.includes("-AN")) {
          referentialForms[label] = c.form;
        } else {
          objectForms[label] = c.form;
        }
      }
    }

    const affixLabel = selectedVerb.affix.includes("MAG-") ? "MAG- (Actor)" : "I- (Object)";
    return { actorForms, objectForms, referentialForms, affixLabel };
  }, [selectedVerb]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-6 md:p-8 backdrop-blur-sm max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-white font-bold text-lg">Try the Verb Conjugator</h3>
          <p className="text-zinc-500 text-sm">See how Bikol verbs transform across tenses</p>
        </div>
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1">
          {DEMO_VERBS.map((verb) => (
            <button
              key={verb.root}
              onClick={() => setSelectedVerb(verb)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedVerb.root === verb.root
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-white/5 text-zinc-400 border border-transparent hover:border-white/10 hover:text-zinc-200"
              }`}
            >
              {verb.root}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedVerb.root}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={Springs.default}
        >
          <div className="text-center mb-4">
            <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">
              {selectedVerb.english} — {conjugations.affixLabel}
            </span>
          </div>

          {/* Actor Focus Table */}
          {Object.keys(conjugations.actorForms).length > 0 && (
            <div className="mb-4">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Actor Focus</span>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {Object.entries(conjugations.actorForms).map(([tense, form]) => (
                  <div key={tense} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider mb-1">
                      {tense}
                    </div>
                    <div className="text-sm font-bold text-white font-mono italic">{form}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Object Focus Table */}
          {Object.keys(conjugations.objectForms).length > 0 && (
            <div className="mb-4">
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Object Focus</span>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {Object.entries(conjugations.objectForms).map(([tense, form]) => (
                  <div key={tense} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider mb-1">
                      {tense}
                    </div>
                    <div className="text-sm font-bold text-white font-mono italic">{form}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Referential Focus */}
          {Object.keys(conjugations.referentialForms).length > 0 && (
            <div className="mb-4">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Referential Focus</span>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {Object.entries(conjugations.referentialForms).map(([tense, form]) => (
                  <div key={tense} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider mb-1">
                      {tense}
                    </div>
                    <div className="text-sm font-bold text-white font-mono italic">{form}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-zinc-600">Root: <span className="text-zinc-400 font-bold">{selectedVerb.root}</span></span>
        <Link
          href={`/word/${selectedVerb.root}`}
          className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs font-bold transition-colors group"
        >
          Full entry
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
