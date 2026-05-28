"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Home, RefreshCw, ArrowLeft, Loader2 } from "lucide-react";
import SubstitutionDrill from "@/components/learn/SubstitutionDrill";
import TransformationChallenge from "@/components/learn/TransformationChallenge";
import AppliedFluency from "@/components/learn/AppliedFluency";
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
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
      <main className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-zinc-950">
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px]" />
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
              <h1 className="text-5xl font-display font-black text-zinc-900 dark:text-white tracking-tight">Well Done!</h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed">
                You've mastered the substitution patterns and transformation challenges. Your Bikol fluency is reaching a new level.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <button 
              onClick={() => router.push("/")}
              className="w-full py-5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
            >
              <Home className="w-5 h-5" />
              Return to Archive
            </button>
            <button 
              onClick={() => {
                setIsFinished(false);
                setActivePhase(1);
              }}
              className="w-full py-5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 border border-zinc-200 dark:border-zinc-800"
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
    <main className="min-h-screen pt-12 pb-32 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <div className="max-w-4xl mx-auto px-6 space-y-12">
        <header className="space-y-6 pt-12">
          <Link 
            href="/"
            className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors mb-4 w-fit"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Archive</span>
          </Link>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-purple-500/50" />
              <span className="text-purple-500 text-xs font-bold uppercase tracking-[0.3em]">Learning Module</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight md:text-7xl">
              Mintz Drills: <span className="text-zinc-400 dark:text-zinc-500">
                {activePhase === 1 ? 'Lesson 1' : activePhase === 2 ? 'Transformation' : 'Response'}
              </span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-xl leading-relaxed text-balance">
              {activePhase === 1 
                ? "Master sentence structure through rapid substitution. Based on Malcolm Mintz's functional fluency course."
                : activePhase === 2
                ? "Develop instinctual grammar recall by shifting tenses and focus patterns dynamically."
                : "Engage in functional dialogue based on visual cues and prompts to build communicative competence."}
            </p>
          </div>
        </header>

        <section className="relative">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] -z-10" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] -z-10" />
          
          {isLoadingDrills && activePhase === 1 ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-zinc-500 text-sm">Loading drills from the dictionary...</p>
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
              <h2 className="text-3xl font-display font-bold tracking-tight">Curriculum Path</h2>
              <p className="text-zinc-500 mt-1">Our 3-Phase approach to Bikol fluency</p>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <button 
              onClick={() => setActivePhase(1)}
              className={`text-left p-8 border rounded-[32px] space-y-4 transition-all ${
                activePhase === 1 
                ? 'bg-blue-500/10 border-blue-500/40' 
                : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
                activePhase === 1 ? 'bg-blue-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
              }`}>1</div>
              <h3 className="text-xl font-bold">Substitution</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">Master core sentence structures by swapping key components.</p>
            </button>
            
            <button 
              onClick={() => setActivePhase(2)}
              className={`text-left p-8 border rounded-[32px] space-y-4 transition-all ${
                activePhase === 2 
                ? 'bg-blue-500/10 border-blue-500/40' 
                : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
                activePhase === 2 ? 'bg-blue-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
              }`}>2</div>
              <h3 className="text-xl font-bold">Transformation</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">Change tenses and focus patterns (Actor vs Object) dynamically.</p>
            </button>
            
            <button 
              onClick={() => setActivePhase(3)}
              className={`text-left p-8 border rounded-[32px] space-y-4 transition-all ${
                activePhase === 3 
                ? 'bg-blue-500/10 border-blue-500/40' 
                : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
                activePhase === 3 ? 'bg-blue-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
              }`}>3</div>
              <h3 className="text-xl font-bold">Response</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">Engage in functional dialogue based on visual cues and prompts.</p>
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-12">
           <div className="p-6 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl space-y-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group">
              <h3 className="font-bold text-sm uppercase tracking-widest group-hover:text-blue-400 transition-colors">Vocabulary Bloom</h3>
              <p className="text-blue-500 text-2xl font-black">12 Words</p>
              <p className="text-zinc-500 text-xs font-medium">Progress since yesterday</p>
           </div>
           <div className="p-6 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl space-y-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group">
              <h3 className="font-bold text-sm uppercase tracking-widest group-hover:text-purple-400 transition-colors">Mastery Streak</h3>
              <p className="text-purple-500 text-2xl font-black">3 Days</p>
              <p className="text-zinc-500 text-xs font-medium">Keep the momentum</p>
           </div>
           <div className="p-6 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl space-y-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group sm:col-span-2 md:col-span-1">
              <h3 className="font-bold text-sm uppercase tracking-widest group-hover:text-zinc-700 dark:group-hover:text-white transition-colors">Accuracy</h3>
              <p className="text-2xl font-black">88%</p>
              <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden">
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
