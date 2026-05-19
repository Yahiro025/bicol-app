"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Home, RefreshCw, ArrowLeft } from "lucide-react";
import SubstitutionDrill from "@/components/learn/SubstitutionDrill";
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
    baseSentence: "Nagbakál ako nin kakanon.",
    cue: "tinapay",
    expectedAnswer: "Nagbakál ako nin tinapay.",
    explanation: "Objects of actor-focus verbs are marked with 'nin'.",
  },
  {
    id: "5",
    baseSentence: "Nagbakál ako nin tinapay.",
    cue: "sira",
    expectedAnswer: "Nagbakál ako nin sira.",
    explanation: "'Sira' (fish) is a common object in Bikol cuisine.",
  }
];

export default function LearnPage() {
  const [isFinished, setIsFinished] = useState(false);
  const router = useRouter();

  const handleComplete = () => {
    setIsFinished(true);
  };

  if (isFinished) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-zinc-950">
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
              className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </motion.div>
            
            <div className="space-y-2">
              <h1 className="text-5xl font-display font-black text-white tracking-tight">Well Done!</h1>
              <p className="text-zinc-400 text-lg leading-relaxed">
                You've mastered the substitution patterns for Mintz Lesson 1. Your accuracy and speed are improving.
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
              onClick={() => setIsFinished(false)}
              className="w-full py-5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 border border-zinc-800"
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
              Mintz Drills: <span className="text-zinc-500">Lesson 1</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-xl leading-relaxed text-balance">
              Master sentence structure through rapid substitution. These drills are based on the Malcolm Mintz Bikol Course for functional fluency.
            </p>
          </div>
        </header>

        <section className="relative">
          {/* Decorative Background Element */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] -z-10" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] -z-10" />
          
          <SubstitutionDrill drills={MOCK_DRILLS} onComplete={handleComplete} />
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
            <div className="p-8 bg-blue-500/10 border border-blue-500/20 rounded-[32px] space-y-4">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-black">1</div>
              <h3 className="text-xl font-bold text-white">Substitution</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Master core sentence structures by swapping key components. (Current)</p>
            </div>
            
            <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-[32px] space-y-4 opacity-70">
              <div className="w-10 h-10 bg-zinc-800 text-zinc-500 rounded-full flex items-center justify-center font-black">2</div>
              <h3 className="text-xl font-bold text-white">Transformation</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Change tenses and focus patterns (Actor vs Object) dynamically. (Coming Soon)</p>
            </div>
            
            <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-[32px] space-y-4 opacity-70">
              <div className="w-10 h-10 bg-zinc-800 text-zinc-500 rounded-full flex items-center justify-center font-black">3</div>
              <h3 className="text-xl font-bold text-white">Response</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Engage in functional dialogue based on visual cues and prompts. (Coming Soon)</p>
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
