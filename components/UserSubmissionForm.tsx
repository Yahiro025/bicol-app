"use client";
import React, { useState, useRef, useCallback, useMemo } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import SpecialCharToolbar from "./SpecialCharToolbar";
import { POS_OPTIONS, DIALECT_OPTIONS } from "@/lib/form-options";

type FormField = "word" | "definition" | "tagalog" | "pronunciation" | "example_bikol" | "example_english";

type FormData = {
  word: string;
  definition: string;
  tagalog: string;
  pos: string;
  dialect: string;
  pronunciation: string;
  exampleBikol: string;
  exampleEnglish: string;
  source: string;
};

const INITIAL_FORM: FormData = {
  word: "",
  definition: "",
  tagalog: "",
  pos: "",
  dialect: "General Bikol",
  pronunciation: "",
  exampleBikol: "",
  exampleEnglish: "",
  source: "",
};



type Status = "idle" | "loading" | "success" | "error";

export default function UserSubmissionForm() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedWord, setSubmittedWord] = useState("");
  const [activeField, setActiveField] = useState<FormField>("word");
  const wordRef = useRef<HTMLInputElement>(null);
  const definitionRef = useRef<HTMLTextAreaElement>(null);
  const pronunciationRef = useRef<HTMLInputElement>(null);
  const exampleBikolRef = useRef<HTMLInputElement>(null);
  const exampleEnglishRef = useRef<HTMLInputElement>(null);

  const tagalogRef = useRef<HTMLTextAreaElement>(null);

  const fieldRefs: Record<FormField, React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>> = useMemo(() => ({
    word: wordRef,
    definition: definitionRef,
    tagalog: tagalogRef,
    pronunciation: pronunciationRef,
    example_bikol: exampleBikolRef,
    example_english: exampleEnglishRef,
  }), []);

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (status === "error") {
      setStatus("idle");
      setErrorMessage("");
    }
  }, [status]);

  const handleInsertChar = useCallback(
    (char: string) => {
      const ref = fieldRefs[activeField];
      const el = ref.current;
      if (!el) return;

      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      const fieldKey =
        activeField === "example_bikol"
          ? "exampleBikol"
          : activeField === "example_english"
            ? "exampleEnglish"
            : activeField === "tagalog"
              ? "tagalog"
              : activeField;

      const current = formData[fieldKey as keyof FormData];
      const newValue = current.slice(0, start) + char + current.slice(end);
      updateField(fieldKey as keyof FormData, newValue);

      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        const refreshedEl = fieldRefs[activeField].current;
        if (refreshedEl) {
          refreshedEl.selectionStart = refreshedEl.selectionEnd = start + char.length;
          refreshedEl.focus();
        }
      });
    },
    [activeField, formData, updateField, fieldRefs],
  );

  const validateForm = (): string | null => {
    if (!formData.word.trim()) return "Bikol word is required.";
    if (formData.word.trim().length < 2) return "Bikol word must be at least 2 characters.";
    if (!formData.definition.trim()) return "Definition is required.";
    if (formData.definition.trim().length < 3) return "Definition must be at least 3 characters.";
    if (formData.pos && !POS_OPTIONS.slice(1).some((p) => p.value === formData.pos)) {
      return "Invalid part of speech selected.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setStatus("error");
      setErrorMessage(validationError);
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: formData.word.trim(),
          definition: formData.definition.trim(),
          tagalog: formData.tagalog.trim() || null,
          pos: formData.pos || null,
          dialect: formData.dialect === "General Bikol" ? null : formData.dialect,
          pronunciation: formData.pronunciation.trim() || null,
          example_bikol: formData.exampleBikol.trim() || null,
          example_english: formData.exampleEnglish.trim() || null,
          source: formData.source.trim() || null,
        }),
      });

      if (res.ok) {
        const submitted = formData.word.trim();
        setSubmittedWord(submitted);
        setStatus("success");
        setFormData(INITIAL_FORM);
        setActiveField("word");
      } else {
        const data = await res.json().catch(() => null);
        setStatus("error");
        setErrorMessage(data?.error || "Failed to submit. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please check your connection and try again.");
    }
  };

  const resetForm = () => {
    setStatus("idle");
    setErrorMessage("");
    setFormData(INITIAL_FORM);
    setActiveField("word");
  };

  const charCount = (text: string) => text.length;

  // ─── Success state ─────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="w-full max-w-lg mx-auto bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/30 rounded-3xl p-8 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-2xl font-black text-zinc-900 dark:text-white">Thank You!</h3>
        <p className="text-zinc-500 leading-relaxed">
          Your word <strong className="text-blue-500">{submittedWord || "submission"}</strong> has
          been sent for review. Our moderators will verify it and add it to the dictionary.
        </p>
        <button
          onClick={resetForm}
          className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          Submit Another Word
        </button>
      </div>
    );
  }

  // ─── Form state ────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm"
    >
      <p className="text-sm text-zinc-500 mb-6">
        Help grow the dictionary. Fields marked with{" "}
        <span className="text-red-400 font-bold">*</span> are required.
      </p>

      <div className="space-y-5">
        {/* ── Bikol Word ── */}
        <div>
          <label className="block text-sm font-bold text-zinc-500 mb-2 uppercase tracking-wide">
            Bikol Word <span className="text-red-400">*</span>
            <span className="ml-2 text-[10px] font-normal normal-case tracking-normal text-zinc-400">
              {charCount(formData.word)} chars
            </span>
          </label>
          <input
            ref={wordRef}
            required
            maxLength={100}
            value={formData.word}
            onFocus={() => setActiveField("word")}
            onChange={(e) => updateField("word", e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900 dark:text-white placeholder-zinc-400 transition-all"
            placeholder="e.g. Oragón"
          />
        </div>

        {/* ── English Definition ── */}
        <div>
          <label className="block text-sm font-bold text-zinc-500 mb-2 uppercase tracking-wide">
            Definition (English) <span className="text-red-400">*</span>
            <span className="ml-2 text-[10px] font-normal normal-case tracking-normal text-zinc-400">
              {charCount(formData.definition)} chars
            </span>
          </label>
          <textarea
            ref={definitionRef as React.RefObject<HTMLTextAreaElement>}
            required
            maxLength={500}
            value={formData.definition}
            onFocus={() => setActiveField("definition")}
            onChange={(e) => updateField("definition", e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900 dark:text-white placeholder-zinc-400 transition-all min-h-[80px] resize-y"
            placeholder="What does the word mean in English?"
          />
        </div>

        {/* ── Tagalog Definition ── */}
        <div>
          <label className="block text-sm font-bold text-zinc-500 mb-2 uppercase tracking-wide">
            Definition (Tagalog)
            <span className="ml-2 text-[10px] font-normal normal-case tracking-normal text-zinc-400">
              {charCount(formData.tagalog)} chars
            </span>
          </label>
          <textarea
            maxLength={500}
            value={formData.tagalog}
            onFocus={() => setActiveField("tagalog")}
            onChange={(e) => updateField("tagalog", e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900 dark:text-white placeholder-zinc-400 transition-all min-h-[80px] resize-y"
            placeholder="Ano ang kahulugan ng salita sa Tagalog? (e.g. Oragón = magaling, mahusay)"
          />
        </div>

        {/* ── Part of Speech ── */}
        <div>
          <label className="block text-sm font-bold text-zinc-500 mb-2 uppercase tracking-wide">
            Part of Speech
          </label>
          <select
            value={formData.pos}
            onChange={(e) => updateField("pos", e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900 dark:text-white transition-all appearance-none cursor-pointer"
          >
            {POS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* ── Dialect ── */}
        <div>
          <label className="block text-sm font-bold text-zinc-500 mb-2 uppercase tracking-wide">
            Dialect
          </label>
          <select
            value={formData.dialect}
            onChange={(e) => updateField("dialect", e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900 dark:text-white transition-all appearance-none cursor-pointer"
          >
            {DIALECT_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* ── Pronunciation ── */}
        <div>
          <label className="block text-sm font-bold text-zinc-500 mb-2 uppercase tracking-wide">
            Pronunciation
            <span className="ml-2 text-[10px] font-normal normal-case tracking-normal text-zinc-400">
              {charCount(formData.pronunciation)} chars
            </span>
          </label>
          <input
            ref={pronunciationRef}
            maxLength={200}
            value={formData.pronunciation}
            onFocus={() => setActiveField("pronunciation")}
            onChange={(e) => updateField("pronunciation", e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900 dark:text-white placeholder-zinc-400 transition-all"
            placeholder="e.g. o-ra-GON"
          />
        </div>

        {/* ── Example Sentence (Bikol) ── */}
        <div>
          <label className="block text-sm font-bold text-zinc-500 mb-2 uppercase tracking-wide">
            Example Sentence (Bikol)
            <span className="ml-2 text-[10px] font-normal normal-case tracking-normal text-zinc-400">
              {charCount(formData.exampleBikol)} chars
            </span>
          </label>
          <input
            ref={exampleBikolRef}
            maxLength={500}
            value={formData.exampleBikol}
            onFocus={() => setActiveField("example_bikol")}
            onChange={(e) => updateField("exampleBikol", e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900 dark:text-white placeholder-zinc-400 transition-all"
            placeholder="e.g. Oragón an lalaking iyan."
          />
        </div>

        {/* ── Example Sentence (English) ── */}
        <div>
          <label className="block text-sm font-bold text-zinc-500 mb-2 uppercase tracking-wide">
            Example Sentence (English)
            <span className="ml-2 text-[10px] font-normal normal-case tracking-normal text-zinc-400">
              {charCount(formData.exampleEnglish)} chars
            </span>
          </label>
          <input
            ref={exampleEnglishRef}
            maxLength={500}
            value={formData.exampleEnglish}
            onFocus={() => setActiveField("example_english")}
            onChange={(e) => updateField("exampleEnglish", e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900 dark:text-white placeholder-zinc-400 transition-all"
            placeholder="e.g. That man is excellent."
          />
        </div>

        {/* ── Source ── */}
        <div>
          <label className="block text-sm font-bold text-zinc-500 mb-2 uppercase tracking-wide">
            Source / Reference
          </label>
          <input
            maxLength={500}
            value={formData.source}
            onChange={(e) => updateField("source", e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900 dark:text-white placeholder-zinc-400 transition-all"
            placeholder="e.g. Heard in Naga City, or from a book/article"
          />
        </div>

        {/* ── Error message ── */}
        {status === "error" && errorMessage && (
          <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              {errorMessage}
            </p>
          </div>
        )}
      </div>

      {/* ── Special Character Toolbar ── */}
      <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <SpecialCharToolbar onInsert={handleInsertChar} />
      </div>

      {/* ── Submit Button ── */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {status === "loading" ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Send Contribution
          </>
        )}
      </button>

      <p className="mt-4 text-center text-xs text-zinc-400 leading-relaxed">
        All submissions are reviewed by moderators before being added to the dictionary.
        Please ensure your entry is accurate and follows Bikol spelling conventions.
      </p>
    </form>
  );
}
