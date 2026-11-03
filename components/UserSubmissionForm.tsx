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
      <div
        className="w-full max-w-lg mx-auto border rounded-3xl p-8 sm:p-10 text-center space-y-4"
        style={{
          backgroundColor: "var(--editorial-surface-raised)",
          borderColor: "var(--editorial-border)",
          boxShadow: "var(--editorial-shadow)",
        }}
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
        <h3 className="text-2xl font-display font-black" style={{ color: "var(--editorial-text)" }}>
          Thank You!
        </h3>
        <p className="leading-relaxed" style={{ color: "var(--editorial-muted)", fontFamily: "var(--font-body)" }}>
          Your word{" "}
          <strong className="font-bold" style={{ color: "var(--editorial-accent)" }}>
            {submittedWord || "submission"}
          </strong>{" "}
          has been sent for review. Our moderators will verify it and add it to the dictionary.
        </p>
        <button
          onClick={resetForm}
          className="px-6 py-3 font-bold rounded-xl border transition-all cursor-pointer active:scale-95 hover:bg-[var(--editorial-surface-sunken)]"
          style={{
            backgroundColor: "var(--editorial-surface)",
            borderColor: "var(--editorial-border)",
            color: "var(--editorial-text)",
          }}
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
      className="w-full max-w-xl mx-auto border rounded-3xl p-6 sm:p-10"
      style={{
        backgroundColor: "var(--editorial-surface-raised)",
        borderColor: "var(--editorial-border)",
        boxShadow: "var(--editorial-shadow)",
      }}
    >
      <p className="text-sm mb-6" style={{ color: "var(--editorial-muted)" }}>
        Help grow the dictionary. Fields marked with{" "}
        <span className="font-bold" style={{ color: "var(--editorial-rust)" }}>*</span> are required.
      </p>

      <div className="space-y-5">
        {/* ── Bikol Word ── */}
        <div>
          <label
            htmlFor="submission-word"
            className="block text-sm font-bold mb-2 uppercase tracking-wide"
            style={{ color: "var(--editorial-text-secondary)" }}
          >
            Bikol Word <span style={{ color: "var(--editorial-rust)" }}>*</span>
            <span
              className="ml-2 text-[10px] font-normal normal-case tracking-normal"
              style={{ color: "var(--editorial-muted)" }}
            >
              {charCount(formData.word)} chars
            </span>
          </label>
          <input
            id="submission-word"
            ref={wordRef}
            required
            maxLength={100}
            value={formData.word}
            onFocus={() => setActiveField("word")}
            onChange={(e) => updateField("word", e.target.value)}
            style={{
              backgroundColor: "var(--editorial-bg)",
              borderColor: "var(--editorial-border)",
              color: "var(--editorial-text)",
            }}
            className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--editorial-accent)]/40 focus:border-[var(--editorial-accent)] placeholder:text-[var(--editorial-muted)]/60 transition-all"
            placeholder="e.g. Oragón"
          />
        </div>

        {/* ── English Definition ── */}
        <div>
          <label
            htmlFor="submission-definition"
            className="block text-sm font-bold mb-2 uppercase tracking-wide"
            style={{ color: "var(--editorial-text-secondary)" }}
          >
            Definition (English) <span style={{ color: "var(--editorial-rust)" }}>*</span>
            <span
              className="ml-2 text-[10px] font-normal normal-case tracking-normal"
              style={{ color: "var(--editorial-muted)" }}
            >
              {charCount(formData.definition)} chars
            </span>
          </label>
          <textarea
            id="submission-definition"
            ref={definitionRef as React.RefObject<HTMLTextAreaElement>}
            required
            maxLength={500}
            value={formData.definition}
            onFocus={() => setActiveField("definition")}
            onChange={(e) => updateField("definition", e.target.value)}
            style={{
              backgroundColor: "var(--editorial-bg)",
              borderColor: "var(--editorial-border)",
              color: "var(--editorial-text)",
            }}
            className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--editorial-accent)]/40 focus:border-[var(--editorial-accent)] placeholder:text-[var(--editorial-muted)]/60 transition-all min-h-[80px] resize-y"
            placeholder="What does the word mean in English?"
          />
        </div>

        {/* ── Tagalog Definition ── */}
        <div>
          <label
            htmlFor="submission-tagalog"
            className="block text-sm font-bold mb-2 uppercase tracking-wide"
            style={{ color: "var(--editorial-text-secondary)" }}
          >
            Definition (Tagalog)
            <span
              className="ml-2 text-[10px] font-normal normal-case tracking-normal"
              style={{ color: "var(--editorial-muted)" }}
            >
              {charCount(formData.tagalog)} chars
            </span>
          </label>
          <textarea
            id="submission-tagalog"
            ref={tagalogRef}
            maxLength={500}
            value={formData.tagalog}
            onFocus={() => setActiveField("tagalog")}
            onChange={(e) => updateField("tagalog", e.target.value)}
            style={{
              backgroundColor: "var(--editorial-bg)",
              borderColor: "var(--editorial-border)",
              color: "var(--editorial-text)",
            }}
            className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--editorial-accent)]/40 focus:border-[var(--editorial-accent)] placeholder:text-[var(--editorial-muted)]/60 transition-all min-h-[80px] resize-y"
            placeholder="Ano ang kahulugan ng salita sa Tagalog? (e.g. Oragón = magaling, mahusay)"
          />
        </div>

        {/* ── Part of Speech ── */}
        <div>
          <label
            htmlFor="submission-pos"
            className="block text-sm font-bold mb-2 uppercase tracking-wide"
            style={{ color: "var(--editorial-text-secondary)" }}
          >
            Part of Speech
          </label>
          <select
            id="submission-pos"
            value={formData.pos}
            onChange={(e) => updateField("pos", e.target.value)}
            style={{
              backgroundColor: "var(--editorial-bg)",
              borderColor: "var(--editorial-border)",
              color: "var(--editorial-text)",
            }}
            className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--editorial-accent)]/40 focus:border-[var(--editorial-accent)] transition-all appearance-none cursor-pointer"
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
          <label
            htmlFor="submission-dialect"
            className="block text-sm font-bold mb-2 uppercase tracking-wide"
            style={{ color: "var(--editorial-text-secondary)" }}
          >
            Dialect
          </label>
          <select
            id="submission-dialect"
            value={formData.dialect}
            onChange={(e) => updateField("dialect", e.target.value)}
            style={{
              backgroundColor: "var(--editorial-bg)",
              borderColor: "var(--editorial-border)",
              color: "var(--editorial-text)",
            }}
            className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--editorial-accent)]/40 focus:border-[var(--editorial-accent)] transition-all appearance-none cursor-pointer"
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
          <label
            htmlFor="submission-pronunciation"
            className="block text-sm font-bold mb-2 uppercase tracking-wide"
            style={{ color: "var(--editorial-text-secondary)" }}
          >
            Pronunciation
            <span
              className="ml-2 text-[10px] font-normal normal-case tracking-normal"
              style={{ color: "var(--editorial-muted)" }}
            >
              {charCount(formData.pronunciation)} chars
            </span>
          </label>
          <input
            id="submission-pronunciation"
            ref={pronunciationRef}
            maxLength={200}
            value={formData.pronunciation}
            onFocus={() => setActiveField("pronunciation")}
            onChange={(e) => updateField("pronunciation", e.target.value)}
            style={{
              backgroundColor: "var(--editorial-bg)",
              borderColor: "var(--editorial-border)",
              color: "var(--editorial-text)",
            }}
            className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--editorial-accent)]/40 focus:border-[var(--editorial-accent)] placeholder:text-[var(--editorial-muted)]/60 transition-all"
            placeholder="e.g. o-ra-GON"
          />
        </div>

        {/* ── Example Sentence (Bikol) ── */}
        <div>
          <label
            htmlFor="submission-example-bikol"
            className="block text-sm font-bold mb-2 uppercase tracking-wide"
            style={{ color: "var(--editorial-text-secondary)" }}
          >
            Example Sentence (Bikol)
            <span
              className="ml-2 text-[10px] font-normal normal-case tracking-normal"
              style={{ color: "var(--editorial-muted)" }}
            >
              {charCount(formData.exampleBikol)} chars
            </span>
          </label>
          <input
            id="submission-example-bikol"
            ref={exampleBikolRef}
            maxLength={500}
            value={formData.exampleBikol}
            onFocus={() => setActiveField("example_bikol")}
            onChange={(e) => updateField("exampleBikol", e.target.value)}
            style={{
              backgroundColor: "var(--editorial-bg)",
              borderColor: "var(--editorial-border)",
              color: "var(--editorial-text)",
            }}
            className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--editorial-accent)]/40 focus:border-[var(--editorial-accent)] placeholder:text-[var(--editorial-muted)]/60 transition-all"
            placeholder="e.g. Oragón an lalaking iyan."
          />
        </div>

        {/* ── Example Sentence (English) ── */}
        <div>
          <label
            htmlFor="submission-example-english"
            className="block text-sm font-bold mb-2 uppercase tracking-wide"
            style={{ color: "var(--editorial-text-secondary)" }}
          >
            Example Sentence (English)
            <span
              className="ml-2 text-[10px] font-normal normal-case tracking-normal"
              style={{ color: "var(--editorial-muted)" }}
            >
              {charCount(formData.exampleEnglish)} chars
            </span>
          </label>
          <input
            id="submission-example-english"
            ref={exampleEnglishRef}
            maxLength={500}
            value={formData.exampleEnglish}
            onFocus={() => setActiveField("example_english")}
            onChange={(e) => updateField("exampleEnglish", e.target.value)}
            style={{
              backgroundColor: "var(--editorial-bg)",
              borderColor: "var(--editorial-border)",
              color: "var(--editorial-text)",
            }}
            className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--editorial-accent)]/40 focus:border-[var(--editorial-accent)] placeholder:text-[var(--editorial-muted)]/60 transition-all"
            placeholder="e.g. That man is excellent."
          />
        </div>

        {/* ── Source ── */}
        <div>
          <label
            htmlFor="submission-source"
            className="block text-sm font-bold mb-2 uppercase tracking-wide"
            style={{ color: "var(--editorial-text-secondary)" }}
          >
            Source / Reference
          </label>
          <input
            id="submission-source"
            maxLength={500}
            value={formData.source}
            onChange={(e) => updateField("source", e.target.value)}
            style={{
              backgroundColor: "var(--editorial-bg)",
              borderColor: "var(--editorial-border)",
              color: "var(--editorial-text)",
            }}
            className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--editorial-accent)]/40 focus:border-[var(--editorial-accent)] placeholder:text-[var(--editorial-muted)]/60 transition-all"
            placeholder="e.g. Heard in Naga City, or from a book/article"
          />
        </div>

        {/* ── Error message ── */}
        {status === "error" && errorMessage && (
          <div
            className="flex items-start gap-2.5 p-4 rounded-2xl border"
            style={{
              backgroundColor: "rgba(185, 28, 28, 0.08)",
              borderColor: "rgba(185, 28, 28, 0.25)",
            }}
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">
              {errorMessage}
            </p>
          </div>
        )}
      </div>

      {/* ── Special Character Toolbar ── */}
      <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--editorial-border)" }}>
        <SpecialCharToolbar onInsert={handleInsertChar} />
      </div>

      {/* ── Submit Button ── */}
      <button
        type="submit"
        disabled={status === "loading"}
        style={{
          backgroundColor: "var(--editorial-accent)",
          color: "#FFFDF9",
        }}
        className="w-full mt-6 py-4 font-bold rounded-2xl transition-all duration-200 active:scale-[0.98] shadow-lg flex justify-center items-center gap-2 cursor-pointer hover:bg-[var(--editorial-accent-dim)] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
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

      <p className="mt-4 text-center text-xs leading-relaxed" style={{ color: "var(--editorial-muted)" }}>
        All submissions are reviewed by moderators before being added to the dictionary.
        Please ensure your entry is accurate and follows Bikol spelling conventions.
      </p>
    </form>
  );
}
