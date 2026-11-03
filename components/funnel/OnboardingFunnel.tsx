"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ChevronUp, Languages, Sparkles, Volume2 } from "lucide-react";
import { DIALECT_OPTIONS } from "@/lib/form-options";

type QuestionId = "dialect" | "goal" | "level" | "pace";

type DialectItem = {
  name: string;
  description?: string;
  isPrimary?: boolean;
};

const PRIMARY_DIALECT_ITEMS: DialectItem[] = [
  {
    name: "Central Bikol (Naga)",
    description: "Recommended standard · Widely understood across Camarines Sur & regional media",
    isPrimary: true,
  },
  {
    name: "Central Bikol (Albay)",
    description: "Legazpi & Albay Gulf variety · Close to standard Central Bikol",
    isPrimary: true,
  },
  {
    name: "Rinconada Bikol",
    description: "Iriga City & Rinconada district variety",
    isPrimary: true,
  },
];

const OTHER_DIALECT_NAMES = DIALECT_OPTIONS.filter(
  (d) => !PRIMARY_DIALECT_ITEMS.some((p) => p.name === d)
);

type Question = {
  kind: "question";
  id: QuestionId;
  label: string;
  title: string;
  hint: string;
  options: readonly string[];
};

type Screen = { kind: "welcome" } | { kind: "value" } | Question | { kind: "plan" };

// "General Bikol" is a catch-all, not a variety of its own.
const VARIETY_COUNT = DIALECT_OPTIONS.length - 1;

const STORAGE_KEY = "bikoldict-learner-profile";

// Order mirrors the flow seen in Lingvano's web onboarding:
// welcome -> first pick (language/dialect) -> value proof -> goal -> level -> commitment -> plan.
const SCREENS: readonly Screen[] = [
  { kind: "welcome" },
  {
    kind: "question",
    id: "dialect",
    label: "Dialect",
    title: "Which Bikol do you want to start with?",
    hint: "Choose your primary focus. You can explore others any time.",
    options: DIALECT_OPTIONS,
  },
  { kind: "value" },
  {
    kind: "question",
    id: "goal",
    label: "Goal",
    title: "Why do you want to learn Bikol?",
    hint: "This shapes your starting trajectory and focus drills.",
    options: [
      "Connect with family & heritage roots",
      "Converse with a partner, friends, or community",
      "Travel, live, or work in the Bicol Region",
      "Academic research, literature, or linguistics",
    ],
  },
  {
    kind: "question",
    id: "level",
    label: "Level",
    title: "How much Bikol do you know?",
    hint: "Be honest. There is no wrong answer.",
    options: [
      "Nothing yet",
      "A few words and greetings",
      "I follow simple talk",
      "I speak, but want to improve",
    ],
  },
  {
    kind: "question",
    id: "pace",
    label: "Daily time",
    title: "How much time can you give each day?",
    hint: "Small and steady beats long and rare.",
    options: ["5 minutes", "10 minutes", "15 minutes", "20+ minutes"],
  },
  { kind: "plan" },
];

const QUESTIONS = SCREENS.filter((s): s is Question => s.kind === "question");

const VALUE_POINTS = [
  { icon: BookOpen, title: "Verified definitions", text: "Words checked against published sources." },
  { icon: Languages, title: "Verb conjugations", text: "See how Bikol verbs change, form by form." },
  { icon: Volume2, title: "Hear the words", text: "Listen to pronunciation on word pages." },
] as const;

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, x: -24, transition: { duration: 0.2 } },
};

const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--editorial-accent)]";

export default function OnboardingFunnel() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<QuestionId, string>>>({});
  const [showAllDialects, setShowAllDialects] = useState(false);

  // Load existing profile from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            setAnswers({
              dialect: parsed.dialect,
              goal: parsed.goal,
              level: parsed.level,
              pace: parsed.pace,
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to load profile from localStorage:", err);
    }
  }, []);

  const saveProfile = (updated: Partial<Record<QuestionId, string>>) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            dialect: updated.dialect ?? answers.dialect,
            goal: updated.goal ?? answers.goal,
            level: updated.level ?? answers.level,
            pace: updated.pace ?? answers.pace,
            updatedAt: Date.now(),
          })
        );
      }
    } catch (err) {
      console.error("Failed to save profile to localStorage:", err);
    }
  };

  const last = SCREENS.length - 1;
  const screen = SCREENS[index];
  const progress = Math.round((index / last) * 100);
  const next = () => setIndex((i) => Math.min(last, i + 1));

  function choose(q: Question, value: string) {
    const updated = { ...answers, [q.id]: value };
    setAnswers(updated);
    saveProfile(updated);
    next();
  }

  const recommendedPhase =
    answers.level === "I speak, but want to improve"
      ? {
          phase: 3,
          name: "Phase 3: Applied Dialogue",
          desc: "Jump straight into communicative flow and conversational response.",
        }
      : answers.level === "I follow simple talk"
      ? {
          phase: 2,
          name: "Phase 2: Transformation Challenge",
          desc: "Build instinctual grammar recall with dynamic tense and focus shifts.",
        }
      : {
          phase: 1,
          name: "Phase 1: Substitution Warm-up",
          desc: "Master sentence structures by swapping key sentence components.",
        };

  if (!screen) return null;

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex flex-col"
      style={{ background: "var(--editorial-bg)", color: "var(--editorial-text)" }}
    >
      {index > 0 && (
        <div className="w-full max-w-xl mx-auto px-6 pt-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              aria-label="Back"
              className="p-2 -ml-2 rounded-full hover:bg-[var(--editorial-surface)] focus-visible:outline-2 focus-visible:outline-[var(--editorial-accent)]"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden />
            </button>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              className="h-1.5 flex-1 rounded-full overflow-hidden"
              style={{ background: "var(--editorial-surface-sunken)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: "var(--editorial-accent)" }}
              />
            </div>
            <span className="text-xs tabular-nums" style={{ color: "var(--editorial-muted)" }}>
              {index}/{last}
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <AnimatePresence mode="wait">
          {screen.kind === "welcome" && (
            <motion.section
              key="welcome"
              {...slide}
              className="relative w-full max-w-xl overflow-hidden rounded-3xl px-8 py-14 text-center text-white border shadow-2xl"
              style={{
                backgroundColor: "#0E0D0B",
                borderColor: "var(--editorial-border)",
                backgroundImage:
                  "radial-gradient(ellipse at 50% 0%, rgba(221, 160, 75, 0.14) 0%, transparent 75%)",
              }}
            >
              <h1
                className="text-5xl sm:text-6xl font-black tracking-tighter leading-[0.95]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Learn Bikol.{" "}
                <span className="italic font-light" style={{ color: "var(--editorial-accent)" }}>
                  Out loud.
                </span>
              </h1>
              <p className="mt-5 text-stone-300" style={{ fontFamily: "var(--font-body)" }}>
                Words from {VARIETY_COUNT} Bikol varieties, with verb conjugations and short
                drills. Answer four quick questions to get your starting plan.
              </p>
              <button
                type="button"
                onClick={next}
                className={`${primaryBtn} mt-9 font-bold shadow-lg transition-all active:scale-[0.98]`}
                style={{ backgroundColor: "var(--editorial-accent)", color: "#0E0D0B" }}
              >
                Get started <ArrowRight className="w-4 h-4" aria-hidden />
              </button>
              <p className="mt-5 text-xs text-stone-400">
                Free. No account needed.{" "}
                <Link href="/" className="underline underline-offset-2 hover:text-stone-200">
                  Just search words
                </Link>
              </p>
            </motion.section>
          )}

          {screen.kind === "question" && (
            <motion.section key={screen.id} {...slide} className="w-full max-w-xl">
              <h1
                className="text-3xl sm:text-4xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {screen.title}
              </h1>
              <p className="mt-2 mb-7" style={{ color: "var(--editorial-muted)" }}>
                {screen.hint}
              </p>
              {screen.id === "dialect" ? (
                <div className="grid gap-3">
                  {PRIMARY_DIALECT_ITEMS.map((item) => {
                    const selected = answers.dialect === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => choose(screen, item.name)}
                        className="flex items-start justify-between rounded-2xl border p-4 sm:p-5 text-left transition-colors hover:border-[var(--editorial-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--editorial-accent)]"
                        style={{
                          background: selected
                            ? "var(--editorial-accent-glow)"
                            : "var(--editorial-surface-raised)",
                          borderColor: selected
                            ? "var(--editorial-accent)"
                            : "var(--editorial-border)",
                        }}
                      >
                        <div className="space-y-1 pr-4">
                          <span className="font-semibold block text-base" style={{ color: "var(--editorial-text)" }}>
                            {item.name}
                          </span>
                          <span className="text-xs block leading-relaxed" style={{ color: "var(--editorial-muted)" }}>
                            {item.description}
                          </span>
                        </div>
                        {selected && <Check className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--editorial-accent)" }} aria-hidden />}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setShowAllDialects((prev) => !prev)}
                    className="flex items-center justify-between rounded-2xl border px-5 py-3.5 text-xs font-semibold transition-all hover:bg-[var(--editorial-surface)]"
                    style={{
                      borderColor: "var(--editorial-border)",
                      color: "var(--editorial-muted)",
                      background: "var(--editorial-surface-sunken)",
                    }}
                  >
                    <span>
                      {showAllDialects
                        ? "Hide additional regional varieties"
                        : "Explore 5 more regional varieties (Masbateño, Buhi-non, Catanduanes, Virac)"}
                    </span>
                    {showAllDialects ? (
                      <ChevronUp className="w-4 h-4 shrink-0" aria-hidden />
                    ) : (
                      <ChevronDown className="w-4 h-4 shrink-0" aria-hidden />
                    )}
                  </button>

                  {showAllDialects && (
                    <div className="grid gap-2 pt-1 animate-in fade-in duration-200">
                      {OTHER_DIALECT_NAMES.map((name) => {
                        const selected = answers.dialect === name;
                        return (
                          <button
                            key={name}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => choose(screen, name)}
                            className="flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors hover:border-[var(--editorial-accent)]"
                            style={{
                              background: selected
                                ? "var(--editorial-accent-glow)"
                                : "var(--editorial-surface-raised)",
                              borderColor: selected
                                ? "var(--editorial-accent)"
                                : "var(--editorial-border)",
                            }}
                          >
                            <span>{name}</span>
                            {selected && <Check className="w-4 h-4 shrink-0" style={{ color: "var(--editorial-accent)" }} aria-hidden />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid gap-3">
                  {screen.options.map((opt) => {
                    const selected = answers[screen.id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => choose(screen, opt)}
                        className="flex items-center justify-between rounded-2xl border px-5 py-4 text-left font-medium transition-colors hover:border-[var(--editorial-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--editorial-accent)]"
                        style={{
                          background: selected
                            ? "var(--editorial-accent-glow)"
                            : "var(--editorial-surface-raised)",
                          borderColor: selected
                            ? "var(--editorial-accent)"
                            : "var(--editorial-border)",
                        }}
                      >
                        {opt}
                        {selected && <Check className="w-4 h-4" aria-hidden />}
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.section>
          )}

          {screen.kind === "value" && (
            <motion.section key="value" {...slide} className="w-full max-w-xl">
              <h1
                className="text-3xl sm:text-4xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Learn Bikol the careful way
              </h1>
              <ul className="mt-8 grid gap-4">
                {VALUE_POINTS.map(({ icon: Icon, title, text }) => (
                  <li
                    key={title}
                    className="flex items-start gap-4 rounded-2xl border px-5 py-4"
                    style={{
                      background: "var(--editorial-surface-raised)",
                      borderColor: "var(--editorial-border)",
                    }}
                  >
                    <Icon
                      className="w-6 h-6 mt-0.5 shrink-0"
                      style={{ color: "var(--editorial-accent)" }}
                      aria-hidden
                    />
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="text-sm" style={{ color: "var(--editorial-muted)" }}>
                        {text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={next}
                className={`${primaryBtn} mt-8 w-full text-white hover:opacity-90`}
                style={{ background: "var(--editorial-accent-dim)" }}
              >
                Next <ArrowRight className="w-4 h-4" aria-hidden />
              </button>
            </motion.section>
          )}

          {screen.kind === "plan" && (
            <motion.section key="plan" {...slide} className="w-full max-w-xl">
              <h1
                className="text-3xl sm:text-4xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Ready when you are.
              </h1>
              <p className="mt-2 text-sm" style={{ color: "var(--editorial-muted)" }}>
                Here is your customized learning trajectory for the Mayon Field Archive.
              </p>

              <div
                className="mt-6 p-5 rounded-2xl border text-left space-y-1.5"
                style={{
                  backgroundColor: "var(--editorial-accent-glow)",
                  borderColor: "var(--editorial-accent)",
                }}
              >
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--editorial-accent)", fontFamily: "var(--font-body)" }}
                >
                  Recommended Starting Phase
                </span>
                <h3
                  className="text-lg font-bold"
                  style={{ color: "var(--editorial-text)", fontFamily: "var(--font-display)" }}
                >
                  {recommendedPhase.name}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--editorial-muted)" }}>
                  {recommendedPhase.desc}
                </p>
              </div>

              <ul
                className="mt-6 divide-y rounded-2xl border"
                style={{
                  background: "var(--editorial-surface-raised)",
                  borderColor: "var(--editorial-border)",
                }}
              >
                {QUESTIONS.map((q) => (
                  <li
                    key={q.id}
                    className="flex justify-between gap-4 px-5 py-3.5 text-sm"
                    style={{ borderColor: "var(--editorial-border)" }}
                  >
                    <span style={{ color: "var(--editorial-muted)" }}>{q.label}</span>
                    <span className="font-medium text-right">{answers[q.id] ?? "—"}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm" style={{ color: "var(--editorial-text-secondary)" }}>
                Start with a short drill, then look up any word you meet along the way.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/learn?phase=${recommendedPhase.phase}`}
                  className={`${primaryBtn} text-white shadow-md hover:opacity-90`}
                  style={{ background: "var(--editorial-accent)" }}
                >
                  Start my first drill <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
                <Link
                  href="/"
                  className={`${primaryBtn} border hover:bg-[var(--editorial-surface)]`}
                  style={{ borderColor: "var(--editorial-border)" }}
                >
                  Search the dictionary
                </Link>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
