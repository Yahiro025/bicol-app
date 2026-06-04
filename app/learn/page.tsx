"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Home, RefreshCw, ArrowLeft, Loader2 } from "lucide-react";
import SubstitutionDrill from "@/components/learn/SubstitutionDrill";
import TransformationChallenge from "@/components/learn/TransformationChallenge";
import AppliedFluency from "@/components/learn/AppliedFluency";
import { escapeRegex } from "@/lib/fuzzy";
import type { SubstitutionDrill as DrillType } from "@/lib/types/learn";

// Fallback drills when the API is unavailable
const FALLBACK_DRILLS: DrillType[] = [
  {
    id: "1",
    baseSentence: "An payong nasa irarom kan lamisa.",
    cue: "tukawan",
    expectedAnswer: "An payong nasa irarom kan tukawan.",
    explanation: "In Bikol, location phrases follow the structure [Subject] [Linker] [Location Word] [Noun].",
  },
  {
    id: "2",
    baseSentence: "Nagduduman si Pedro sa saod.",
    cue: "Maria",
    expectedAnswer: "Nagduduman si Maria sa saod.",
    explanation: "Proper names are preceded by the personal marker 'si'.",
  },
  {
    id: "3",
    baseSentence: "Magayon an saiyang harong.",
    cue: "dakula",
    expectedAnswer: "Dakula an saiyang harong.",
    explanation: "Sentences often start with the adjective (Predicate-Initial order).",
  },
  {
    id: "4",
    baseSentence: "Nagbakal ako nin kakanon.",
    cue: "tinapay",
    expectedAnswer: "Nagbakal ako nin tinapay.",
    explanation: "Objects of actor-focus verbs are marked with 'nin'.",
  },
  {
    id: "5",
    baseSentence: "Nagbakal ako nin tinapay.",
    cue: "sira",
    expectedAnswer: "Nagbakal ako nin sira.",
    explanation: "'Sira' (fish) is a common object in Bikol cuisine.",
  }
];

/**
 * Generate substitution drills from real dictionary words.
 * Creates drills by using example sentences and substituting key words.
 */
function generateDrillsFromWords(words: { bikol: string; english: string; example_bikol?: string | null; example_english?: string | null }[]): DrillType[] {
  const drills: DrillType[] = [];
  
  // Words with examples make the best drill sources
  const withExamples = words.filter(w => w.example_bikol);
  const withoutExamples = words.filter(w => !w.example_bikol);
  
  // Generate drills from example sentences
  for (let i = 0; i < Math.min(withExamples.length, 3); i++) {
    const word = withExamples[i];
    const otherWord = withExamples[(i + 1) % withExamples.length];
    if (!word || !otherWord || !word.example_bikol || !otherWord.bikol) continue;
    // Use word boundary to avoid partial matches (e.g., "si" matching inside "sira")
    const wordRegex = new RegExp('\\b' + escapeRegex(word.bikol) + '\\b', 'gi');
    drills.push({
      id: `db-ex-${i}`,
      baseSentence: word.example_bikol,
      cue: otherWord.bikol,
      expectedAnswer: word.example_bikol.replace(wordRegex, otherWord.bikol),
      explanation: `Practice substituting "${word.bikol}" with "${otherWord.bikol}" (${otherWord.english}).`,
    });
  }
  
  // Generate simple vocabulary swap drills
  for (let i = 0; i < Math.min(withoutExamples.length - 1, 2); i++) {
    const a = withoutExamples[i];
    const b = withoutExamples[i + 1];
    if (!a || !b) continue;
    drills.push({
      id: `db-swap-${i}`,
      baseSentence: `An ${a.bikol} magayon.`,
      cue: b.bikol,
      expectedAnswer: `An ${b.bikol} magayon.`,
      explanation: `Swap the subject "${a.bikol}" (${a.english}) with "${b.bikol}" (${b.english}).`,
    });
  }
  
  return drills;
}

export default function LearnPage() {
  const [isFinished, setIsFinished] = useState(false);
  const [activePhase, setActivePhase] = useState<1 | 2 | 3>(1);
  const [drills, setDrills] = useState<DrillType[]>(FALLBACK_DRILLS);
  const [isLoadingDrills, setIsLoadingDrills] = useState(true);
  const router = useRouter();

  // Fetch real words from the database to generate drills
  useEffect(() => {
    async function fetchDrills() {
      try {
        const res = await fetch("/api/learn?mode=flashcards&limit=20");
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const words = await res.json();
        if (Array.isArray(words) && words.length >= 3) {
          const generated = generateDrillsFromWords(words);
          if (generated.length >= 3) {
            setDrills(generated);
          }
        }
      } catch (err) {
        console.error("Using fallback drills:", err);
      } finally {
        setIsLoadingDrills(false);
      }
    }
    fetchDrills();
  }, []);

  const handlePhase1Complete = () => {
    setActivePhase(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePhase2Complete = () => {
    setActivePhase(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePhase3Complete = () => {
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
      <div className="max-w-4xl mx-auto px-6 space-y-12">
        <header className="space-y-6 pt-12">
          <Link 
            href="/"
            className="group flex items-center gap-2 transition-colors mb-4 w-fit"
            style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Archive</span>
          </Link>

          <div className="space-y-4">
            <span className="section-number">Learning Module</span>
            <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight md:text-7xl" style={{ color: 'var(--editorial-text)' }}>
              Mintz Drills: <span style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-display)' }}>
                {activePhase === 1 ? 'Warm-up' : activePhase === 2 ? 'Build' : 'Flow'}
              </span>
            </h1>
            <p className="text-lg max-w-xl leading-relaxed text-balance" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>
              {activePhase === 1 
                ? "Master sentence structure through rapid substitution. Based on Malcolm Mintz's functional fluency course."
                : activePhase === 2
                ? "Develop instinctual grammar recall by shifting tenses and focus patterns dynamically."
                : "Engage in functional dialogue based on visual cues and prompts to build communicative competence."}
            </p>
          </div>
        </header>

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

        <section className="space-y-8 pt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-display font-bold tracking-tight" style={{ color: 'var(--editorial-text)' }}>Curriculum Path</h2>
              <p className="mt-1" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>Our 3-Phase approach to Bikol fluency</p>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <button 
              onClick={() => setActivePhase(1)}
              className={`text-left p-8 border rounded-[32px] space-y-4 transition-all ${
                activePhase === 1 
                ? 'border-[var(--editorial-accent)]' 
                : 'border-[var(--editorial-border)]'
              }`}
              style={activePhase === 1 ? { backgroundColor: 'rgba(196,155,76,0.08)' } : { backgroundColor: 'var(--editorial-surface)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${activePhase === 1 ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Warm-up</span>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
                activePhase === 1 ? 'text-white' : ''
              }`} style={activePhase === 1 ? { backgroundColor: 'var(--editorial-accent)' } : { backgroundColor: 'var(--editorial-bg)', color: 'var(--editorial-muted)' }}>1</div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--editorial-text)', fontFamily: 'var(--font-display)' }}>Substitution</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>Master core sentence structures by swapping key components.</p>
            </button>
            
            <button 
              onClick={() => setActivePhase(2)}
              className={`text-left p-8 border rounded-[32px] space-y-4 transition-all ${
                activePhase === 2 
                ? 'border-[var(--editorial-accent)]' 
                : 'border-[var(--editorial-border)]'
              }`}
              style={activePhase === 2 ? { backgroundColor: 'rgba(196,155,76,0.08)' } : { backgroundColor: 'var(--editorial-surface)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activePhase === 2 ? '#f59e0b' : 'var(--editorial-muted)' }} />
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Build</span>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
                activePhase === 2 ? 'text-white' : ''
              }`} style={activePhase === 2 ? { backgroundColor: 'var(--editorial-accent)' } : { backgroundColor: 'var(--editorial-bg)', color: 'var(--editorial-muted)' }}>2</div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--editorial-text)', fontFamily: 'var(--font-display)' }}>Transformation</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>Change tenses and focus patterns (Actor vs Object) dynamically.</p>
            </button>
            
            <button 
              onClick={() => setActivePhase(3)}
              className={`text-left p-8 border rounded-[32px] space-y-4 transition-all ${
                activePhase === 3 
                ? 'border-[var(--editorial-accent)]' 
                : 'border-[var(--editorial-border)]'
              }`}
              style={activePhase === 3 ? { backgroundColor: 'rgba(196,155,76,0.08)' } : { backgroundColor: 'var(--editorial-surface)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activePhase === 3 ? '#ef4444' : 'var(--editorial-muted)' }} />
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Flow</span>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
                activePhase === 3 ? 'text-white' : ''
              }`} style={activePhase === 3 ? { backgroundColor: 'var(--editorial-accent)' } : { backgroundColor: 'var(--editorial-bg)', color: 'var(--editorial-muted)' }}>3</div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--editorial-text)', fontFamily: 'var(--font-display)' }}>Response</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>Engage in functional dialogue based on visual cues and prompts.</p>
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-12">
           <div className="p-6 rounded-2xl space-y-2 transition-colors group" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}>
              <h3 className="font-bold text-sm uppercase tracking-widest group-hover:text-[var(--editorial-accent)] transition-colors" style={{ fontFamily: 'var(--font-body)', color: 'var(--editorial-muted)' }}>Vocabulary Bloom</h3>
              <p className="text-2xl font-black" style={{ color: 'var(--editorial-accent)', fontFamily: 'var(--font-display)' }}>12 Words</p>
              <p className="text-xs font-medium" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>Progress since yesterday</p>
           </div>
           <div className="p-6 rounded-2xl space-y-2 transition-colors group" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}>
              <h3 className="font-bold text-sm uppercase tracking-widest group-hover:text-[var(--editorial-rust)] transition-colors" style={{ fontFamily: 'var(--font-body)', color: 'var(--editorial-muted)' }}>Mastery Streak</h3>
              <p className="text-2xl font-black" style={{ color: 'var(--editorial-rust)', fontFamily: 'var(--font-display)' }}>3 Days</p>
              <p className="text-xs font-medium" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>Keep the momentum</p>
           </div>
           <div className="p-6 rounded-2xl space-y-2 transition-colors group sm:col-span-2 md:col-span-1" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}>
              <h3 className="font-bold text-sm uppercase tracking-widest group-hover:text-[var(--editorial-text)] transition-colors" style={{ fontFamily: 'var(--font-body)', color: 'var(--editorial-muted)' }}>Accuracy</h3>
              <p className="text-2xl font-black" style={{ color: 'var(--editorial-text)', fontFamily: 'var(--font-display)' }}>88%</p>
              <div className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: 'var(--editorial-surface-sunken)' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "88%" }}
                  className="h-full bg-emerald-500" 
                />
              </div>
           </div>
        </section>
      </div>
    </main>
  );
}
