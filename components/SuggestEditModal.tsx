"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, AlertCircle, CheckCircle2, Edit3 } from "lucide-react";
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

  const fieldRefs = useMemo(() => ({
    word: wordRef,
    definition: definitionRef,
    tagalog: tagalogRef,
    pronunciation: pronunciationRef,
    exampleBikol: exampleBikolRef,
    exampleEnglish: exampleEnglishRef,
  }), []);

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
    [activeField, word, definition, tagalog, pronunciation, exampleBikol, exampleEnglish, fieldRefs],
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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="suggest-edit-title"
            style={{
              backgroundColor: "var(--editorial-surface-raised)",
              borderColor: "var(--editorial-border)",
              boxShadow: "var(--editorial-shadow)",
            }}
            className="relative w-full max-w-lg border rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div
              className="px-6 py-5 border-b flex items-center justify-between sticky top-0 z-10"
              style={{
                backgroundColor: "var(--editorial-surface-raised)",
                borderColor: "var(--editorial-border)",
              }}
            >
              <div>
                <h3
                  id="suggest-edit-title"
                  className="text-xl font-display font-black flex items-center gap-2"
                  style={{ color: "var(--editorial-text)" }}
                >
                  <Edit3 className="w-5 h-5" style={{ color: "var(--editorial-accent)" }} />
                  Suggest an Edit
                </h3>
                <p className="text-xs mt-1" style={{ color: "var(--editorial-muted)" }}>
                  Propose corrections for{" "}
                  <span className="font-bold" style={{ color: "var(--editorial-accent)" }}>
                    {wordData.bikol}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                style={{
                  backgroundColor: "var(--editorial-surface)",
                  borderColor: "var(--editorial-border)",
                  color: "var(--editorial-muted)",
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full border transition-all cursor-pointer hover:border-[var(--editorial-accent)] hover:text-[var(--editorial-text)] active:scale-95"
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
                  <div
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center border"
                    style={{
                      backgroundColor: "var(--editorial-surface)",
                      borderColor: "var(--editorial-border)",
                    }}
                  >
                    <CheckCircle2 className="w-8 h-8" style={{ color: "var(--editorial-accent)" }} />
                  </div>
                  <h4 className="text-2xl font-display font-black" style={{ color: "var(--editorial-text)" }}>
                    Thank You!
                  </h4>
                  <p className="text-sm max-w-sm mx-auto leading-relaxed" style={{ color: "var(--editorial-muted)" }}>
                    Your edit recommendation has been received. Our moderators will review and apply the changes if they are correct.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      backgroundColor: "var(--editorial-surface)",
                      borderColor: "var(--editorial-border)",
                      color: "var(--editorial-text)",
                    }}
                    className="px-6 py-3 font-bold rounded-xl border transition-all cursor-pointer active:scale-95 hover:bg-[var(--editorial-surface-sunken)]"
                  >
                    Close Window
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Word */}
                  <div>
                    <label
                      htmlFor="suggest-word"
                      className="block text-xs font-bold uppercase tracking-wider mb-2"
                      style={{ color: "var(--editorial-text-secondary)" }}
                    >
                      Bikol Word
                    </label>
                    <input
                      id="suggest-word"
                      ref={wordRef}
                      required
                      value={word}
                      onFocus={() => setActiveField("word")}
                      onChange={(e) => setWord(e.target.value)}
                      style={{
                        backgroundColor: "var(--editorial-bg)",
                        borderColor: "var(--editorial-border)",
                        color: "var(--editorial-text)",
                      }}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--editorial-accent)]/40 focus:border-[var(--editorial-accent)] placeholder:text-[var(--editorial-muted)]/60 text-sm transition-all"
                    />
                  </div>

                  {/* Part of Speech */}
                  <div>
                    <label
                      htmlFor="suggest-pos"
                      className="block text-xs font-bold uppercase tracking-wider mb-2"
                      style={{ color: "var(--editorial-text-secondary)" }}
                    >
                      Part of Speech
                    </label>
                    <select
                      id="suggest-pos"
                      value={pos}
                      onChange={(e) => setPos(e.target.value)}
                      style={{
                        backgroundColor: "var(--editorial-bg)",
                        borderColor: "var(--editorial-border)",
                        color: "var(--editorial-text)",
                      }}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--editorial-accent)]/40 focus:border-[var(--editorial-accent)] text-sm transition-all appearance-none cursor-pointer"
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
                    <label
                      htmlFor="suggest-definition"
                      className="block text-xs font-bold uppercase tracking-wider mb-2"
                      style={{ color: "var(--editorial-text-secondary)" }}
                    >
                      Definition (English)
                    </label>
                    <textarea
                      id="suggest-definition"
                      ref={definitionRef}
                      required
                      rows={3}
                      value={definition}
                      onFocus={() => setActiveField("definition")}
                      onChange={(e) => setDefinition(e.target.value)}
                      style={{
                        backgroundColor: "var(--editorial-bg)",
                        borderColor: "var(--editorial-border)",
                        color: "var(--editorial-text)",
                      }}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--editorial-accent)]/40 focus:border-[var(--editorial-accent)] placeholder:text-[var(--editorial-muted)]/60 resize-y text-sm transition-all"
                    />
                  </div>

                  {/* Tagalog Definition */}
                  <div>
                    <label
                      htmlFor="suggest-tagalog"
                      className="block text-xs font-bold uppercase tracking-wider mb-2"
                      style={{ color: "var(--editorial-text-secondary)" }}
                    >
                      Definition (Tagalog)
                    </label>
                    <textarea
                      id="suggest-tagalog"
                      ref={tagalogRef}
                      rows={3}
                      value={tagalog}
                      onFocus={() => setActiveField("tagalog")}
                      onChange={(e) => setTagalog(e.target.value)}
                      style={{
                        backgroundColor: "var(--editorial-bg)",
                        borderColor: "var(--editorial-border)",
                        color: "var(--editorial-text)",
                      }}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--editorial-accent)]/40 focus:border-[var(--editorial-accent)] placeholder:text-[var(--editorial-muted)]/60 resize-y text-sm transition-all"
                      placeholder="Ano ang kahulugan ng salita sa Tagalog?"
                    />
                  </div>

                  {/* Dialect */}
                  <div>
                    <label
                      htmlFor="suggest-dialect"
                      className="block text-xs font-bold uppercase tracking-wider mb-2"
                      style={{ color: "var(--editorial-text-secondary)" }}
                    >
                      Dialect
                    </label>
                    <select
                      id="suggest-dialect"
                      value={dialect}
                      onChange={(e) => setDialect(e.target.value)}
                      style={{
                        backgroundColor: "var(--editorial-bg)",
                        borderColor: "var(--editorial-border)",
                        color: "var(--editorial-text)",
                      }}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--editorial-accent)]/40 focus:border-[var(--editorial-accent)] text-sm transition-all appearance-none cursor-pointer"
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
                    <label
                      htmlFor="suggest-pronunciation"
                      className="block text-xs font-bold uppercase tracking-wider mb-2"
                      style={{ color: "var(--editorial-text-secondary)" }}
                    >
                      Pronunciation
                    </label>
                    <input
                      id="suggest-pronunciation"
                      ref={pronunciationRef}
                      value={pronunciation}
                      onFocus={() => setActiveField("pronunciation")}
                      onChange={(e) => setPronunciation(e.target.value)}
                      style={{
                        backgroundColor: "var(--editorial-bg)",
                        borderColor: "var(--editorial-border)",
                        color: "var(--editorial-text)",
                      }}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--editorial-accent)]/40 focus:border-[var(--editorial-accent)] placeholder:text-[var(--editorial-muted)]/60 text-sm transition-all"
                    />
                  </div>

                  {/* Example Sentence (Bikol) */}
                  <div>
                    <label
                      htmlFor="suggest-example-bikol"
                      className="block text-xs font-bold uppercase tracking-wider mb-2"
                      style={{ color: "var(--editorial-text-secondary)" }}
                    >
                      Example Sentence (Bikol)
                    </label>
                    <input
                      id="suggest-example-bikol"
                      ref={exampleBikolRef}
                      value={exampleBikol}
                      onFocus={() => setActiveField("exampleBikol")}
                      onChange={(e) => setExampleBikol(e.target.value)}
                      style={{
                        backgroundColor: "var(--editorial-bg)",
                        borderColor: "var(--editorial-border)",
                        color: "var(--editorial-text)",
                      }}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--editorial-accent)]/40 focus:border-[var(--editorial-accent)] placeholder:text-[var(--editorial-muted)]/60 text-sm transition-all"
                    />
                  </div>

                  {/* Example Sentence (English) */}
                  <div>
                    <label
                      htmlFor="suggest-example-english"
                      className="block text-xs font-bold uppercase tracking-wider mb-2"
                      style={{ color: "var(--editorial-text-secondary)" }}
                    >
                      Example Sentence (English)
                    </label>
                    <input
                      id="suggest-example-english"
                      ref={exampleEnglishRef}
                      value={exampleEnglish}
                      onFocus={() => setActiveField("exampleEnglish")}
                      onChange={(e) => setExampleEnglish(e.target.value)}
                      style={{
                        backgroundColor: "var(--editorial-bg)",
                        borderColor: "var(--editorial-border)",
                        color: "var(--editorial-text)",
                      }}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--editorial-accent)]/40 focus:border-[var(--editorial-accent)] placeholder:text-[var(--editorial-muted)]/60 text-sm transition-all"
                    />
                  </div>

                  {/* Source */}
                  <div>
                    <label
                      htmlFor="suggest-source"
                      className="block text-xs font-bold uppercase tracking-wider mb-2"
                      style={{ color: "var(--editorial-text-secondary)" }}
                    >
                      Source / Reference
                    </label>
                    <input
                      id="suggest-source"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      style={{
                        backgroundColor: "var(--editorial-bg)",
                        borderColor: "var(--editorial-border)",
                        color: "var(--editorial-text)",
                      }}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--editorial-accent)]/40 focus:border-[var(--editorial-accent)] placeholder:text-[var(--editorial-muted)]/60 text-sm transition-all"
                      placeholder="e.g. Wiktionary, Native speaker in Albay"
                    />
                  </div>

                  {/* Reason for Edit */}
                  <div className="border-t pt-4" style={{ borderColor: "var(--editorial-border)" }}>
                    <label
                      htmlFor="suggest-reason"
                      className="block text-xs font-bold uppercase tracking-wider mb-2"
                      style={{ color: "var(--editorial-accent)" }}
                    >
                      Reason for correction (Required)
                    </label>
                    <textarea
                      id="suggest-reason"
                      required
                      rows={2}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      style={{
                        backgroundColor: "var(--editorial-bg)",
                        borderColor: "var(--editorial-border)",
                        color: "var(--editorial-text)",
                      }}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--editorial-accent)]/40 focus:border-[var(--editorial-accent)] placeholder:text-[var(--editorial-muted)]/60 resize-y text-sm transition-all"
                      placeholder="e.g. Corrected part of speech; fixed typo in example sentence translation."
                    />
                  </div>

                  {/* Special Char Toolbar */}
                  <div className="pt-4 border-t" style={{ borderColor: "var(--editorial-border)" }}>
                    <SpecialCharToolbar onInsert={handleInsertChar} />
                  </div>

                  {/* Error Notification */}
                  {status === "error" && errorMessage && (
                    <div
                      className="flex items-start gap-2.5 p-4 rounded-xl border"
                      style={{
                        backgroundColor: "rgba(185, 28, 28, 0.08)",
                        borderColor: "rgba(185, 28, 28, 0.25)",
                      }}
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700 dark:text-red-300 font-medium">{errorMessage}</p>
                    </div>
                  )}

                  {/* Footer CTA */}
                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={status === "loading"}
                      style={{
                        backgroundColor: "var(--editorial-surface)",
                        borderColor: "var(--editorial-border)",
                        color: "var(--editorial-text)",
                      }}
                      className="flex-1 py-3.5 font-bold rounded-xl border active:scale-95 transition-all text-sm cursor-pointer hover:bg-[var(--editorial-surface-sunken)] disabled:opacity-55"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      style={{
                        backgroundColor: "var(--editorial-accent)",
                        color: "#FFFDF9",
                      }}
                      className="flex-1 py-3.5 font-bold rounded-xl active:scale-95 transition-all text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:bg-[var(--editorial-accent-dim)] disabled:opacity-55"
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
