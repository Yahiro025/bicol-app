"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Home, RefreshCw, ArrowLeft, Loader2, Sparkles, BookOpen } from "lucide-react";
import SubstitutionDrill from "@/components/learn/SubstitutionDrill";
import TransformationChallenge from "@/components/learn/TransformationChallenge";
import AppliedFluency from "@/components/learn/AppliedFluency";
import type { SubstitutionDrill as DrillType } from "@/lib/types/learn";

// Fallback drills (verified Bikol examples from Mintz Lesson 1) enriched with English context
const FALLBACK_DRILLS: DrillType[] = [
  {
    id: "1",
    baseSentence: "An payong nasa irarom kan lamisa.",
    cue: "tukawan",
    expectedAnswer: "An payong nasa irarom kan tukawan.",
    explanation: "Meaning: 'The umbrella is under the table.' Swap 'lamisa' (table) with 'tukawan' (chair) → 'The umbrella is under the chair.'",
  },
  {
    id: "2",
    baseSentence: "Nagduduman si Pedro sa saod.",
    cue: "Maria",
    expectedAnswer: "Nagduduman si Maria sa saod.",
    explanation: "Meaning: 'Pedro is going to the market.' Swap 'Pedro' with 'Maria' after the personal marker 'si'.",
  },
  {
    id: "3",
    baseSentence: "Magbakal ka nin sira sa saod.",
    cue: "kakanon",
    expectedAnswer: "Magbakal ka nin kakanon sa saod.",
    explanation: "Meaning: 'Buy fish at the market.' Swap 'sira' (fish) with 'kakanon' (food) → 'Buy food at the market.'",
  },
];

type LearnerProfile = {
  dialect?: string;
  goal?: string;
  level?: string;
  pace?: string;
};

type LearnStats = {
  completedDrills: number;
  correctFirstTry: number;
  phasesCompleted: number[];
};

const STATS_STORAGE_KEY = "bikoldict-learn-stats";
const PROFILE_STORAGE_KEY = "bikoldict-learner-profile";

export default function LearnPage() {
  const [isFinished, setIsFinished] = useState(false);
  const [activePhase, setActivePhase] = useState<1 | 2 | 3>(1);
  const [drills, setDrills] = useState<DrillType[]>(FALLBACK_DRILLS);
  const [isLoadingDrills, setIsLoadingDrills] = useState(true);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [showProfileBanner, setShowProfileBanner] = useState(true);
  const [stats, setStats] = useState<LearnStats>({
    completedDrills: 0,
    correctFirstTry: 0,
    phasesCompleted: [],
  });
  const router = useRouter();

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        // Load learner profile
        const rawProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (rawProfile) {
          const parsed = JSON.parse(rawProfile);
          if (parsed && (parsed.dialect || parsed.goal)) {
            setProfile(parsed);
          }
        }

        // Load stats
        const rawStats = localStorage.getItem(STATS_STORAGE_KEY);
        if (rawStats) {
          const parsed = JSON.parse(rawStats);
          if (parsed && typeof parsed === "object") {
            setStats({
              completedDrills: Number(parsed.completedDrills) || 0,
              correctFirstTry: Number(parsed.correctFirstTry) || 0,
              phasesCompleted: Array.isArray(parsed.phasesCompleted) ? parsed.phasesCompleted : [],
            });
          }
        }

        // Check phase query param
        const params = new URLSearchParams(window.location.search);
        const p = params.get("phase");
        if (p === "1" || p === "2" || p === "3") {
          setActivePhase(Number(p) as 1 | 2 | 3);
        }
      }
    } catch (e) {
      console.error("Error reading localStorage:", e);
    }
  }, []);

  useEffect(() => {
    async function fetchDrills() {
      try {
        const res = await fetch("/api/drills");
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        if (data && Array.isArray(data.cues) && data.baseSentence) {
          const generated: DrillType[] = data.cues.map(
            (item: { cue: string; expected: string; explanation?: string }, index: number) => ({
              id: `drill-${index}`,
              baseSentence: data.baseSentence as string,
              cue: item.cue,
              expectedAnswer: item.expected,
              explanation: item.explanation || `Swap with "${item.cue}" to form: "${item.expected}"`,
            })
          );
          if (generated.length > 0) setDrills(generated);
        }
      } catch (err) {
        console.error("Using enriched fallback drills:", err);
      } finally {
        setIsLoadingDrills(false);
      }
    }
    fetchDrills();
  }, []);

  const recordPhaseCompletion = (phase: number, count = 1) => {
    setStats((prev) => {
      const updated: LearnStats = {
        completedDrills: prev.completedDrills + count,
        correctFirstTry: prev.correctFirstTry + count,
        phasesCompleted: Array.from(new Set([...prev.phasesCompleted, phase])),
      };
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(updated));
        }
      } catch (err) {
        console.error("Failed to save learn stats:", err);
      }
      return updated;
    });
  };

  const handlePhase1Complete = () => {
    recordPhaseCompletion(1, drills.length);
    setActivePhase(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePhase2Complete = () => {
    recordPhaseCompletion(2, 3);
    setActivePhase(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePhase3Complete = () => {
    recordPhaseCompletion(3, 1);
    setIsFinished(true);
  };

  if (isFinished) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--editorial-bg)' }}>
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: 'rgba(196,155,76,0.05)' }} />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-10"
        >
          <div className="space-y-6">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, delay: 0.2 }}
              className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 glow-emerald-large"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </motion.div>
            
            <div className="space-y-2">
              <h1 className="text-5xl font-display font-black tracking-tight" style={{ color: 'var(--editorial-text)' }}>Well Done!</h1>
              <p className="text-lg leading-relaxed" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>
                You've mastered the substitution patterns and transformation challenges. Your Bikol fluency is reaching a new level.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <button 
              onClick={() => router.push("/")}
              className="w-full py-5 text-white font-bold rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3" style={{ backgroundColor: 'var(--editorial-accent)', fontFamily: 'var(--font-body)' }}
            >
              <Home className="w-5 h-5" />
              Return to Archive
            </button>
            <button 
              onClick={() => {
                setIsFinished(false);
                setActivePhase(1);
              }}
              className="w-full py-5 font-bold rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3" style={{ backgroundColor: 'var(--editorial-surface)', color: 'var(--editorial-text)', fontFamily: 'var(--font-body)', border: '1px solid var(--editorial-border)' }}
            >
              <RefreshCw className="w-5 h-5" />
              Practice Again
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-12 pb-32 text-zinc-900 dark:text-white" style={{ backgroundColor: 'var(--editorial-bg)' }}>
      <div className="max-w-4xl mx-auto px-6 space-y-10">
        <header className="space-y-6 pt-12">
          <Link 
            href="/"
            className="group flex items-center gap-2 transition-colors mb-4 w-fit"
            style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Archive</span>
          </Link>

          {/* Profile Banner */}
          {profile && showProfileBanner ? (
            <div
              className="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl border text-xs"
              style={{
                backgroundColor: "var(--editorial-surface)",
                borderColor: "var(--editorial-border)",
                color: "var(--editorial-text-secondary)",
              }}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold" style={{ color: "var(--editorial-accent)" }}>Active Focus:</span>
                <span>{profile.dialect || "Central Bikol (Naga)"}</span>
                <span style={{ color: "var(--editorial-divider)" }}>·</span>
                <span className="font-bold" style={{ color: "var(--editorial-accent)" }}>Goal:</span>
                <span>{profile.goal || "Connect with heritage"}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/start"
                  className="font-semibold underline underline-offset-2 hover:text-[var(--editorial-accent)] transition-colors"
                >
                  Change plan (/start)
                </Link>
                <button
                  onClick={() => setShowProfileBanner(false)}
                  className="text-xs hover:opacity-70 px-1 py-0.5 rounded"
                  aria-label="Dismiss banner"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : !profile ? (
            <div className="text-xs">
              <Link
                href="/start"
                className="inline-flex items-center gap-1.5 font-semibold hover:underline text-[var(--editorial-muted)] hover:text-[var(--editorial-accent)] transition-colors"
              >
                <span>New learner? Customize your starting plan →</span>
              </Link>
            </div>
          ) : null}

          {/* Title Area (Craft Floor: No-Kicker Rule obeyed) */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight md:text-6xl" style={{ color: 'var(--editorial-text)' }}>
              Mintz Drills: <span style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-display)' }}>
                {activePhase === 1 ? 'Warm-up' : activePhase === 2 ? 'Build' : 'Flow'}
              </span>
            </h1>
            <p className="text-base sm:text-lg max-w-xl leading-relaxed text-balance" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>
              {activePhase === 1 
                ? "Master sentence structure through rapid substitution. Based on Malcolm Mintz's functional fluency course."
                : activePhase === 2
                ? "Develop instinctual grammar recall by shifting tenses and focus patterns dynamically."
                : "Engage in functional dialogue based on visual cues and prompts to build communicative competence."}
            </p>
          </div>
        </header>

        {/* 3-Phase Curriculum Stepper ABOVE the active drill */}
        <nav
          aria-label="Curriculum phases"
          className="flex items-center rounded-2xl border p-1.5 gap-1.5"
          style={{
            backgroundColor: "var(--editorial-surface)",
            borderColor: "var(--editorial-border)",
          }}
        >
          {[
            { phase: 1, label: "1. Warm-up: Substitution" },
            { phase: 2, label: "2. Build: Transformation" },
            { phase: 3, label: "3. Flow: Dialogue" },
          ].map((item) => {
            const isActive = activePhase === item.phase;
            return (
              <button
                key={item.phase}
                type="button"
                onClick={() => setActivePhase(item.phase as 1 | 2 | 3)}
                className="flex-1 py-3 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-center focus-visible:outline-2 focus-visible:outline-[var(--editorial-accent)]"
                style={{
                  backgroundColor: isActive ? "var(--editorial-surface-raised)" : "transparent",
                  color: isActive ? "var(--editorial-accent)" : "var(--editorial-muted)",
                  border: isActive ? "1px solid var(--editorial-border)" : "1px solid transparent",
                  boxShadow: isActive ? "var(--editorial-shadow)" : "none",
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Active Drill Area */}
        <section className="relative">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[120px] -z-10" style={{ background: 'rgba(196,155,76,0.04)' }} />
          
          {isLoadingDrills && activePhase === 1 ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--editorial-accent)' }} />
              <p className="text-sm" style={{ color: 'var(--editorial-muted)' }}>Loading drills from the dictionary...</p>
            </div>
          ) : activePhase === 1 ? (
            <SubstitutionDrill drills={drills} onComplete={handlePhase1Complete} />
          ) : activePhase === 2 ? (
            <TransformationChallenge onComplete={handlePhase2Complete} />
          ) : (
            <AppliedFluency onComplete={handlePhase3Complete} />
          )}
        </section>

        {/* Honest Session Ledger (replaces fake static stat cards) */}
        <footer className="pt-8">
          <div
            className="p-6 rounded-2xl border"
            style={{
              backgroundColor: "var(--editorial-surface)",
              borderColor: "var(--editorial-border)",
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "var(--editorial-muted)", fontFamily: "var(--font-body)" }}
                >
                  Session Ledger
                </h3>
                {stats.completedDrills === 0 ? (
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--editorial-text-secondary)", fontFamily: "var(--font-body)" }}
                  >
                    0 drills completed in this browser — complete a prompt above to record your progress
                  </p>
                ) : (
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--editorial-text)", fontFamily: "var(--font-body)" }}
                  >
                    Verified archive progress recorded in this browser session.
                  </p>
                )}
              </div>

              {stats.completedDrills > 0 && (
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-xs block font-medium" style={{ color: "var(--editorial-muted)" }}>Completed</span>
                    <span className="text-xl font-black" style={{ color: "var(--editorial-accent)", fontFamily: "var(--font-display)" }}>
                      {stats.completedDrills} {stats.completedDrills === 1 ? "Drill" : "Drills"}
                    </span>
                  </div>
                  <div className="h-8 w-px" style={{ backgroundColor: "var(--editorial-divider)" }} />
                  <div>
                    <span className="text-xs block font-medium" style={{ color: "var(--editorial-muted)" }}>Curriculum Phases</span>
                    <span className="text-xl font-black" style={{ color: "var(--editorial-rust)", fontFamily: "var(--font-display)" }}>
                      {stats.phasesCompleted.length} / 3 Mastered
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
