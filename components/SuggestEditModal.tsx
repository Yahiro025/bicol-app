"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import SpecialCharToolbar from "./SpecialCharToolbar";
import { POS_OPTIONS, DIALECT_OPTIONS } from "@/lib/form-options";

type SuggestEditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isNormalized: boolean;
  wordData: {
    id: string | number | bigint;
    bikol: string;
    pos: string | null;
    pronunciation: string | null;
    english?: string | null;
    dialect?: string | null;
    example_bikol?: string | null;
    example_english?: string | null;
    source_url?: string | null;
    definitions?: Array<{
      english: string | null;
      dialect: string | null;
      source_url?: string | null;
      exampleSentences?: Array<{
        bikol: string | null;
        english: string | null;
      }>;
    }>;
  };
};

export default function SuggestEditModal({ isOpen, onClose, isNormalized, wordData }: SuggestEditModalProps) {
  // Pre-fill initial form fields based on type
  const firstDef = isNormalized ? wordData.definitions?.[0] : null;
  const firstEx = firstDef?.exampleSentences?.[0] || null;

  const initialWord = wordData.bikol;
  const initialPos = wordData.pos || "";
  const initialPronunciation = wordData.pronunciation || "";
  const initialDefinition = isNormalized ? firstDef?.english || "" : wordData.english || "";
  const initialDialect = isNormalized ? firstDef?.dialect || "General Bikol" : wordData.dialect || "General Bikol";
  const initialExampleBikol = isNormalized ? firstEx?.bikol || "" : wordData.example_bikol || "";
  const initialExampleEnglish = isNormalized ? firstEx?.english || "" : wordData.example_english || "";
  const initialSource = isNormalized ? firstDef?.source_url || "" : wordData.source_url || "";

  const [word, setWord] = useState(initialWord);
  const [definition, setDefinition] = useState(initialDefinition);
  const [tagalog, setTagalog] = useState("");
  const [pos, setPos] = useState(initialPos);
  const [dialect, setDialect] = useState(initialDialect);
  const [pronunciation, setPronunciation] = useState(initialPronunciation);
  const [exampleBikol, setExampleBikol] = useState(initialExampleBikol);
  const [exampleEnglish, setExampleEnglish] = useState(initialExampleEnglish);
  const [source, setSource] = useState(initialSource);
  const [reason, setReason] = useState(""); // User explanation for edit

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeField, setActiveField] = useState<"word" | "definition" | "tagalog" | "pronunciation" | "exampleBikol" | "exampleEnglish">("word");

  const wordRef = useRef<HTMLInputElement>(null);
  const definitionRef = useRef<HTMLTextAreaElement>(null);
  const tagalogRef = useRef<HTMLTextAreaElement>(null);
  const pronunciationRef = useRef<HTMLInputElement>(null);
  const exampleBikolRef = useRef<HTMLInputElement>(null);
  const exampleEnglishRef = useRef<HTMLInputElement>(null);

  const fieldRefs = {
    word: wordRef,
    definition: definitionRef,
    tagalog: tagalogRef,
    pronunciation: pronunciationRef,
    exampleBikol: exampleBikolRef,
    exampleEnglish: exampleEnglishRef,
  };

  const handleInsertChar = useCallback(
    (char: string) => {
      const ref = fieldRefs[activeField];
      const el = ref.current;
      if (!el) return;

      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;

      const fieldValues: Record<typeof activeField, { current: string; set: (v: string) => void }> = {
        word: { current: word, set: setWord },
        definition: { current: definition, set: setDefinition },
        tagalog: { current: tagalog, set: setTagalog },
        pronunciation: { current: pronunciation, set: setPronunciation },
        exampleBikol: { current: exampleBikol, set: setExampleBikol },
        exampleEnglish: { current: exampleEnglish, set: setExampleEnglish },
      };
      const { current: val, set: setVal } = fieldValues[activeField];
      setVal(val.slice(0, start) + char + val.slice(end));

      requestAnimationFrame(() => {
        const refreshedEl = fieldRefs[activeField].current;
        if (refreshedEl) {
          refreshedEl.selectionStart = refreshedEl.selectionEnd = start + char.length;
          refreshedEl.focus();
        }
      });
    },
    [activeField, word, definition, tagalog, pronunciation, exampleBikol, exampleEnglish],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !definition.trim()) {
      setStatus("error");
      setErrorMessage("Bikol word and English definition are required.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: word.trim(),
          definition: definition.trim(),
          tagalog: tagalog.trim() || null,
          pos: pos || null,
          dialect: dialect === "General Bikol" ? null : dialect,
          pronunciation: pronunciation.trim() || null,
          example_bikol: exampleBikol.trim() || null,
          example_english: exampleEnglish.trim() || null,
          source: source.trim() || null,
          original_id: String(wordData.id),
          original_type: isNormalized ? "normalized" : "legacy",
          admin_notes: reason.trim() ? `User suggestion reason: ${reason.trim()}` : null,
        }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json().catch(() => null);
        setStatus("error");
        setErrorMessage(data?.error || "Failed to submit suggestion. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please check your connection.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900 z-10">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <span>📝</span> Suggest an Edit
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Propose corrections for <span className="text-blue-400 font-bold">{wordData.bikol}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="w-16 h-16 mx-auto bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h4 className="text-2xl font-black text-white">Thank You!</h4>
                  <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    Your edit recommendation has been received. Our moderators will review and apply the changes if they are correct.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-all active:scale-95"
                  >
                    Close Window
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Word */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Bikol Word</label>
                    <input
                      ref={wordRef}
                      required
                      value={word}
                      onFocus={() => setActiveField("word")}
                      onChange={(e) => setWord(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>

                  {/* Part of Speech */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Part of Speech</label>
                    <select
                      value={pos}
                      onChange={(e) => setPos(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none cursor-pointer"
                    >
                      {POS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Definition */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Definition (English)</label>
                    <textarea
                      ref={definitionRef}
                      required
                      rows={3}
                      value={definition}
                      onFocus={() => setActiveField("definition")}
                      onChange={(e) => setDefinition(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white resize-y"
                    />
                  </div>

                  {/* Tagalog Definition */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Definition (Tagalog)</label>
                    <textarea
                      ref={tagalogRef}
                      rows={3}
                      value={tagalog}
                      onFocus={() => setActiveField("tagalog")}
                      onChange={(e) => setTagalog(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white resize-y"
                      placeholder="Ano ang kahulugan ng salita sa Tagalog?"
                    />
                  </div>

                  {/* Dialect */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Dialect</label>
                    <select
                      value={dialect}
                      onChange={(e) => setDialect(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none cursor-pointer"
                    >
                      {DIALECT_OPTIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pronunciation */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Pronunciation</label>
                    <input
                      ref={pronunciationRef}
                      value={pronunciation}
                      onFocus={() => setActiveField("pronunciation")}
                      onChange={(e) => setPronunciation(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>

                  {/* Example Sentence (Bikol) */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Example Sentence (Bikol)</label>
                    <input
                      ref={exampleBikolRef}
                      value={exampleBikol}
                      onFocus={() => setActiveField("exampleBikol")}
                      onChange={(e) => setExampleBikol(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>

                  {/* Example Sentence (English) */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Example Sentence (English)</label>
                    <input
                      ref={exampleEnglishRef}
                      value={exampleEnglish}
                      onFocus={() => setActiveField("exampleEnglish")}
                      onChange={(e) => setExampleEnglish(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>

                  {/* Source */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Source / Reference</label>
                    <input
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      placeholder="e.g. Wiktionary, Native speaker in Albay"
                    />
                  </div>

                  {/* Reason for Edit */}
                  <div className="border-t border-zinc-800 pt-4">
                    <label className="block text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2">
                      Reason for correction (Required)
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-yellow-500/20 focus:border-yellow-500/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-white resize-y text-sm"
                      placeholder="e.g. Corrected part of speech; fixed typo in example sentence translation."
                    />
                  </div>

                  {/* Special Char Toolbar */}
                  <div className="pt-4 border-t border-zinc-800">
                    <SpecialCharToolbar onInsert={handleInsertChar} />
                  </div>

                  {/* Error Notification */}
                  {status === "error" && errorMessage && (
                    <div className="flex items-start gap-2.5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-400 font-medium">{errorMessage}</p>
                    </div>
                  )}

                  {/* Footer CTA */}
                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={status === "loading"}
                      className="flex-1 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl active:scale-95 transition-all text-sm disabled:opacity-55"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl active:scale-95 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10 disabled:opacity-55"
                    >
                      {status === "loading" ? "Submitting..." : (
                        <>
                          <Send className="w-4 h-4" /> Propose Edit
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
