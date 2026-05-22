"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Home, RefreshCw, ArrowLeft } from "lucide-react";
import SubstitutionDrill from "@/components/learn/SubstitutionDrill";
import TransformationChallenge from "@/components/learn/TransformationChallenge";
import type { SubstitutionDrill as DrillType } from "@/lib/types/learn";
import Link from "next/link";

const MOCK_DRILLS: DrillType[] = [
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

export default function LearnPage() {
  const [isFinished, setIsFinished] = useState(false);
  const [activePhase, setActivePhase] = useState<1 | 2>(1);
  const router = useRouter();

  const handleComplete = () => {
    setIsFinished(true);
  };

  if (isFinished) {
    // ... (finished state stays same)
  }

  return (
    <main className="min-h-screen pt-12 pb-32">
      <div className="max-w-4xl mx-auto px-6 space-y-12">
        <header className="space-y-6 pt-12">
          <Link 
            href="/"
            className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mb-4 w-fit"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Archive</span>
          </Link>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-purple-500/50" />
              <span className="text-purple-500 text-xs font-bold uppercase tracking-[0.3em]">Learning Module</span>
            </div>
            <h1 className="text-5xl font-display font-black tracking-tight text-white md:text-7xl">
              Mintz Drills: <span className="text-zinc-500">{activePhase === 1 ? 'Lesson 1' : 'Transformation'}</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-xl leading-relaxed text-balance">
              {activePhase === 1 
                ? "Master sentence structure through rapid substitution. Based on Malcolm Mintz's functional fluency course."
                : "Develop instinctual grammar recall by shifting tenses and focus patterns dynamically."}
            </p>
          </div>
        </header>

        <section className="relative">
          {/* Decorative Background Element */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] -z-10" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] -z-10" />
          
          {activePhase === 1 ? (
            <SubstitutionDrill drills={MOCK_DRILLS} onComplete={handleComplete} />
          ) : (
            <TransformationChallenge />
          )}
        </section>

        {/* Phase Roadmap */}
        <section className="space-y-8 pt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-display font-bold text-white tracking-tight">Curriculum Path</h2>
              <p className="text-zinc-500 mt-1">Our 3-Phase approach to Bikol fluency</p>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <button 
              onClick={() => setActivePhase(1)}
              className={`text-left p-8 border rounded-[32px] space-y-4 transition-all ${
                activePhase === 1 
                ? 'bg-blue-500/10 border-blue-500/40' 
                : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
                activePhase === 1 ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-500'
              }`}>1</div>
              <h3 className="text-xl font-bold text-white">Substitution</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Master core sentence structures by swapping key components.</p>
            </button>
            
            <button 
              onClick={() => setActivePhase(2)}
              className={`text-left p-8 border rounded-[32px] space-y-4 transition-all ${
                activePhase === 2 
                ? 'bg-blue-500/10 border-blue-500/40' 
                : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
                activePhase === 2 ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-500'
              }`}>2</div>
              <h3 className="text-xl font-bold text-white">Transformation</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Change tenses and focus patterns (Actor vs Object) dynamically.</p>
            </button>
            
            <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-[32px] space-y-4 opacity-70">
              <div className="w-10 h-10 bg-zinc-800 text-zinc-500 rounded-full flex items-center justify-center font-black">3</div>
              <h3 className="text-xl font-bold text-white">Response</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Engage in functional dialogue based on visual cues and prompts.</p>
            </div>
          </div>
        </section>


        <section className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 pt-12">
           <div className="p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl space-y-2 hover:border-zinc-700 transition-colors group">
              <h3 className="text-zinc-100 font-bold text-sm uppercase tracking-widest group-hover:text-blue-400 transition-colors">Vocabulary Bloom</h3>
              <p className="text-blue-500 text-2xl font-black">12 Words</p>
              <p className="text-zinc-500 text-xs font-medium">Progress since yesterday</p>
           </div>
           <div className="p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl space-y-2 hover:border-zinc-700 transition-colors group">
              <h3 className="text-zinc-100 font-bold text-sm uppercase tracking-widest group-hover:text-purple-400 transition-colors">Mastery Streak</h3>
              <p className="text-purple-500 text-2xl font-black">3 Days</p>
              <p className="text-zinc-500 text-xs font-medium">Keep the momentum</p>
           </div>
           <div className="p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl space-y-2 hover:border-zinc-700 transition-colors group sm:col-span-2 md:col-span-1">
              <h3 className="text-zinc-100 font-bold text-sm uppercase tracking-widest group-hover:text-white transition-colors">Accuracy</h3>
              <p className="text-white text-2xl font-black">88%</p>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
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
