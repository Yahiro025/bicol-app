"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SubstitutionDrill } from "@/lib/types/learn";

function normalize(str: string) {
  return str.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ");
}

interface SubstitutionDrillProps {
  drills: SubstitutionDrill[];
  onComplete?: () => void;
}

const WORD_GLOSSES: Record<string, string> = {
  payong: "umbrella",
  irarom: "under / beneath",
  lamisa: "table",
  tukawan: "chair",
  saod: "market",
  sira: "fish",
  kakanon: "food",
  pedro: "Pedro",
  maria: "Maria",
  nagduduman: "is going",
  magbakal: "buy",
  biko: "rice cake",
  tubig: "water",
  harong: "house",
};

function getGloss(word: string): string | null {
  const clean = word.toLowerCase().replace(/[^a-zñ-]/g, "");
  return WORD_GLOSSES[clean] ?? null;
}

export default function SubstitutionDrillComponent({ drills, onComplete }: SubstitutionDrillProps) {
  const [idx, setIdx] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const drill = drills[idx];
  const isLast = idx + 1 >= drills.length;

  const handleCheck = () => {
    if (!drill) return;
    const correct = normalize(userInput) === normalize(drill.expectedAnswer);
    setIsCorrect(correct);
    setIsAnswered(true);
    if (!correct) setRetryCount((c) => c + 1);
  };

  const handleNext = () => {
    if (!isLast) {
      setIdx((i) => i + 1);
      setUserInput("");
      setIsAnswered(false);
      setIsCorrect(false);
      setRetryCount(0);
    } else {
      onComplete?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userInput.trim()) {
      if (isAnswered) handleNext();
      else handleCheck();
    }
  };

  if (!drill) return null;

  const cueGloss = getGloss(drill.cue);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 py-8 px-4">
      {/* Drill Header (No-Kicker Rule obeyed) */}
      <div className="text-center">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-display font-bold tracking-tight" style={{ color: 'var(--editorial-text)' }}
        >
          Mintz Lesson 1
        </motion.h2>
      </div>

      {/* Drill Card */}
      <motion.div
        key={idx}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
        }}
        className={`card-resting p-8 md:p-12 space-y-8 relative overflow-hidden ${
          isAnswered && isCorrect ? "ring-2 ring-emerald-500/20 bg-emerald-500/5 glow-emerald-small" : 
          isAnswered && !isCorrect ? "ring-1 ring-amber-400/20 bg-amber-400/5" : ""
        }`}
      >
        <div className="space-y-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>Base Sentence</p>
          <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--editorial-bg)', border: '1px solid var(--editorial-border)' }}>
            <p
              className="text-2xl md:text-3xl leading-relaxed italic"
              style={{ color: "var(--editorial-text)", fontFamily: "var(--font-display)" }}
            >
              &ldquo;{drill.baseSentence}&rdquo;
            </p>
          </div>

          {/* Beginner Scaffolding: Word Gloss Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {drill.baseSentence.split(/\s+/).map((rawWord, i) => {
              const gloss = getGloss(rawWord);
              if (!gloss) return null;
              return (
                <span
                  key={i}
                  className="text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5"
                  style={{
                    backgroundColor: "var(--editorial-surface)",
                    borderColor: "var(--editorial-border)",
                    color: "var(--editorial-muted)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <span className="font-semibold" style={{ color: "var(--editorial-text)" }}>
                    {rawWord.replace(/[.,!?"]+/g, "")}
                  </span>
                  <span>({gloss})</span>
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>Cue Word</p>
          <motion.div whileHover={{ scale: 1.03 }} className="px-8 py-3.5 rounded-full font-bold text-xl shadow-sm" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)', color: 'var(--editorial-accent)' }}>
            {drill.cue}
          </motion.div>
          {cueGloss && (
            <span className="text-xs font-medium" style={{ color: "var(--editorial-muted)" }}>
              Meaning: &ldquo;{cueGloss}&rdquo;
            </span>
          )}
        </div>

        {/* Input Area */}
        <div className="space-y-4">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAnswered && isCorrect}
            placeholder="Type the new sentence..."
            className={`w-full border-2 p-5 sm:p-6 rounded-2xl text-xl text-center focus:outline-none transition-all duration-300 placeholder:text-[var(--editorial-muted)]/60 ${
              isAnswered && isCorrect ? "border-emerald-500/50" :
              isAnswered && !isCorrect ? "border-amber-400/40" :
              "border-[var(--editorial-border)] focus:border-[var(--editorial-accent)]"
            } text-[var(--editorial-text)]`}
            style={{ backgroundColor: 'var(--editorial-bg)' }}
            autoFocus
          />
          
          <AnimatePresence>
            {isAnswered && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="space-y-4 text-center">
                {!isCorrect && (
                  <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: "var(--editorial-surface)", borderColor: "var(--editorial-border)" }}>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--editorial-rust)" }}>
                      {retryCount === 1 ? "Let's try that again" : "Here's the answer"}
                    </p>
                    {retryCount > 1 && (
                      <p
                        className="text-xl font-bold italic"
                        style={{ color: "var(--editorial-text)", fontFamily: "var(--font-display)" }}
                      >
                        {drill.expectedAnswer}
                      </p>
                    )}
                  </div>
                )}
                {isCorrect && (
                  <motion.p initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-[0.2em] text-sm">
                    Perfectly Accurate
                  </motion.p>
                )}
                {drill.explanation && (
                  <p
                    className="text-sm italic max-w-md mx-auto leading-relaxed"
                    style={{ color: "var(--editorial-text-secondary)" }}
                  >
                    {drill.explanation}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          {isAnswered && !isCorrect && retryCount === 1 ? (
            <button
              onClick={() => {
                setIsAnswered(false);
                setUserInput("");
              }}
              className="w-full py-5 font-bold rounded-2xl transition-all active:scale-[0.98]"
              style={{ backgroundColor: 'var(--editorial-accent-glow)', color: 'var(--editorial-accent)', fontFamily: 'var(--font-body)', border: '1px solid var(--editorial-border)' }}
            >
              Try Again
            </button>
          ) : !isAnswered ? (
            <button
              onClick={handleCheck}
              disabled={userInput.trim() === ""}
              className="w-full py-5 text-white font-bold rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ backgroundColor: 'var(--editorial-accent)', fontFamily: 'var(--font-body)' }}
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-5 font-bold rounded-2xl transition-all active:scale-[0.98]"
              style={{ backgroundColor: 'var(--editorial-surface)', color: 'var(--editorial-text)', fontFamily: 'var(--font-body)', border: '1px solid var(--editorial-border)' }}
            >
              {isLast ? "Finish Lesson" : "Next Drill"}
            </button>
          )}
        </div>
      </motion.div>

      <div className="flex justify-between items-center px-4">
        <div className="flex items-center gap-4">
          <div className="h-1.5 w-32 rounded-full overflow-hidden" style={{ backgroundColor: "var(--editorial-surface-sunken)" }}>
            <motion.div
              className="h-full"
              style={{ backgroundColor: 'var(--editorial-accent)' }}
              initial={{ width: 0 }}
              animate={{ width: `${((idx + 1) / drills.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>
            {idx + 1} of {drills.length}
          </span>
        </div>
        <button onClick={onComplete} className="text-[10px] font-bold uppercase tracking-widest transition-colors hover:text-[var(--editorial-accent)]" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>
          Skip Session
        </button>
      </div>
    </div>
  );
}
