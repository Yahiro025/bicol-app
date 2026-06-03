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
    <div className="rounded-3xl p-4 sm:p-6 md:p-8 backdrop-blur-sm max-w-2xl mx-auto" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="font-bold text-lg" style={{ color: 'var(--editorial-text)' }}>Try the Verb Conjugator</h3>
          <p className="text-sm" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>See how Bikol verbs transform across tenses</p>
        </div>
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1">
          {DEMO_VERBS.map((verb) => (
            <button
              key={verb.root}
              onClick={() => setSelectedVerb(verb)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedVerb.root === verb.root
                  ? "border"
                  : "border border-transparent"
              }`}
              style={selectedVerb.root === verb.root ? {
                backgroundColor: 'rgba(196,155,76,0.1)',
                color: 'var(--editorial-accent)',
                borderColor: 'rgba(196,155,76,0.3)',
              } : {
                backgroundColor: 'var(--editorial-bg)',
                color: 'var(--editorial-muted)',
              }}
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
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>
              {selectedVerb.english} — {conjugations.affixLabel}
            </span>
          </div>

          {/* Actor Focus Table */}
          {Object.keys(conjugations.actorForms).length > 0 && (
            <div className="mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--editorial-accent)', fontFamily: 'var(--font-body)' }}>Actor Focus</span>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {Object.entries(conjugations.actorForms).map(([tense, form]) => (
                  <div key={tense} className="border rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--editorial-bg)', borderColor: 'var(--editorial-border)' }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>
                      {tense}
                    </div>
                    <div className="text-sm font-bold font-mono italic" style={{ color: 'var(--editorial-text)' }}>{form}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Object Focus Table */}
          {Object.keys(conjugations.objectForms).length > 0 && (
            <div className="mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--editorial-accent-dim)', fontFamily: 'var(--font-body)' }}>Object Focus</span>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {Object.entries(conjugations.objectForms).map(([tense, form]) => (
                  <div key={tense} className="border rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--editorial-bg)', borderColor: 'var(--editorial-border)' }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>
                      {tense}
                    </div>
                    <div className="text-sm font-bold font-mono italic" style={{ color: 'var(--editorial-text)' }}>{form}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Referential Focus */}
          {Object.keys(conjugations.referentialForms).length > 0 && (
            <div className="mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--editorial-rust)', fontFamily: 'var(--font-body)' }}>Referential Focus</span>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {Object.entries(conjugations.referentialForms).map(([tense, form]) => (
                  <div key={tense} className="border rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--editorial-bg)', borderColor: 'var(--editorial-border)' }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>
                      {tense}
                    </div>
                    <div className="text-sm font-bold font-mono italic" style={{ color: 'var(--editorial-text)' }}>{form}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--editorial-divider)' }}>
        <span className="text-xs" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>Root: <span className="font-bold" style={{ color: 'var(--editorial-text)' }}>{selectedVerb.root}</span></span>
        <Link
          href={`/word/${selectedVerb.root}`}
          className="flex items-center gap-1.5 text-xs font-bold transition-colors group"
          style={{ color: 'var(--editorial-accent-dim)', fontFamily: 'var(--font-body)' }}
        >
          Full entry
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
