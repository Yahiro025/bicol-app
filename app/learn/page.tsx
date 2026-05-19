import SubstitutionDrill from "@/components/learn/SubstitutionDrill";
import { SubstitutionDrill as DrillType } from "@/lib/types/learn";

export const dynamic = 'force-dynamic';

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
  }
];

export default function LearnPage() {
  return (
    <main className="min-h-screen pt-12 pb-32">
      <div className="max-w-4xl mx-auto px-6 space-y-12">
        <header className="space-y-4 pt-12">
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
        </header>

        <section className="relative">
          {/* Decorative Background Element */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] -z-10" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] -z-10" />
          
          <SubstitutionDrill drills={MOCK_DRILLS} />
        </section>

        <section className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 pt-12">
           <div className="p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl space-y-2 hover:border-zinc-700 transition-colors">
              <h3 className="text-zinc-100 font-bold text-sm uppercase tracking-widest">Vocabulary Bloom</h3>
              <p className="text-blue-500 text-2xl font-black">12 Words</p>
              <p className="text-zinc-500 text-xs font-medium">Progress since yesterday</p>
           </div>
           <div className="p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl space-y-2 hover:border-zinc-700 transition-colors">
              <h3 className="text-zinc-100 font-bold text-sm uppercase tracking-widest">Mastery Streak</h3>
              <p className="text-purple-500 text-2xl font-black">3 Days</p>
              <p className="text-zinc-500 text-xs font-medium">Keep the momentum</p>
           </div>
           <div className="p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl space-y-2 hover:border-zinc-700 transition-colors sm:col-span-2 md:col-span-1">
              <h3 className="text-zinc-100 font-bold text-sm uppercase tracking-widest">Accuracy</h3>
              <p className="text-white text-2xl font-black">88%</p>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2">
                <div className="h-full bg-emerald-500 w-[88%] rounded-full" />
              </div>
           </div>
        </section>
      </div>
    </main>
  );
}
