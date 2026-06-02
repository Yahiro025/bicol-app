"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck,
  BookOpen,
  ArrowLeft
} from "lucide-react";
import type { DialogueScenario, DialogueMessage, LinguisticAudit } from "@/lib/types/learn";
import Button from "@/components/ui/Button";

export default function AppliedFluency({ onComplete }: { onComplete: () => void }) {
  const [scenarios, setScenarios] = useState<DialogueScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<DialogueScenario | null>(null);
  const [messages, setMessages] = useState<DialogueMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [audit, setAudit] = useState<LinguisticAudit | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchScenarios();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchScenarios = async () => {
    try {
      const res = await fetch("/api/learn/dialogue");
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const data = await res.json();
      
      // If no scenarios in DB, provide mocks
      if (!data || data.length === 0) {
        setScenarios([
          {
            id: "mock-1",
            title: "Sa Saod (At the Market)",
            description: "You are at the local market in Naga. Your goal is to buy fresh fish (sira) and vegetables (gulay).",
            goal: "Successfully purchase fish and vegetables after asking for the price.",
            difficulty: "beginner",
            visualCue: "ShoppingBag",
            vocabulary: ["pira", "bakal", "sira", "gulay", "mahal", "barato"]
          },
          {
            id: "mock-2",
            title: "Pagbisita sa Amigo (Visiting a Friend)",
            description: "You are visiting a friend's house. Practice formal greetings and polite inquiries.",
            goal: "Exchange greetings and ask how the family is doing.",
            difficulty: "beginner",
            visualCue: "Home",
            vocabulary: ["marhay", "aga", "kumusta", "pamilya", "salamat", "duman"]
          }
        ]);
      } else {
        setScenarios(data);
      }
    } catch (error) {
      console.error("Failed to fetch scenarios, using defaults:", error);
      // Fallback to mocks on error to prevent total page failure
      setScenarios([
        {
          id: "mock-1",
          title: "Sa Saod (At the Market)",
          description: "You are at the local market in Naga. Your goal is to buy fresh fish (sira) and vegetables (gulay).",
          goal: "Successfully purchase fish and vegetables after asking for the price.",
          difficulty: "beginner",
          visualCue: "ShoppingBag",
          vocabulary: ["pira", "bakal", "sira", "gulay", "mahal", "barato"]
        }
      ]);
    }
  };

  const startScenario = (scenario: DialogueScenario) => {
    setSelectedScenario(scenario);
    setMessages([
      {
        role: "assistant",
        content: `Marhay na aldaw! Yaon ako sa ${(scenario?.title ?? "").split('(')[0]?.trim() ?? ""}. Ano an maitatabang ko saimo?`,
        timestamp: Date.now()
      }
    ]);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedScenario || isLoading) return;

    const userMessage: DialogueMessage = {
      role: "user",
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/learn/dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: selectedScenario,
          messages: [...messages, userMessage],
          mode: "chat"
        })
      });

      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.message,
        timestamp: Date.now()
      }]);

      if (data.goalAchieved) {
        setIsFinished(true);
      }
    } catch (error) {
      console.error("Dialogue error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const runAudit = async () => {
    if (!selectedScenario || messages.length === 0) return;
    setIsEvaluating(true);

    try {
      const res = await fetch("/api/learn/dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: selectedScenario,
          messages,
          mode: "evaluate"
        })
      });

      const data = await res.json();
      setAudit(data);
    } catch (error) {
      console.error("Audit error:", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (audit) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-8 bg-zinc-900/50 border border-emerald-500/20 rounded-[32px] space-y-8 glow-emerald-tiny">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-white">Linguistic Audit</h3>
                <p className="text-zinc-500 text-sm">Post-Session Performance Review</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-emerald-500">{audit.score}%</div>
              <div className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Accuracy Score</div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-6 bg-zinc-950/50 border border-white/5 rounded-2xl space-y-3">
              <h4 className="text-emerald-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" /> Comprehension
              </h4>
              <p className="text-zinc-300 text-sm leading-relaxed">{audit.comprehension}</p>
            </div>
            <div className="p-6 bg-zinc-950/50 border border-white/5 rounded-2xl space-y-3">
              <h4 className="text-blue-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-3 h-3" /> Focus & Affixes
              </h4>
              <p className="text-zinc-300 text-sm leading-relaxed">{audit.focus}</p>
            </div>
            <div className="p-6 bg-zinc-950/50 border border-white/5 rounded-2xl space-y-3">
              <h4 className="text-purple-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" /> Particles & Markers
              </h4>
              <p className="text-zinc-300 text-sm leading-relaxed">{audit.particles}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => {
                setAudit(null);
                setSelectedScenario(null);
                setMessages([]);
                setIsFinished(false);
              }}
              className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all"
            >
              New Scenario
            </button>
            <button 
              onClick={onComplete}
              className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl transition-all"
            >
              Complete Module
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedScenario) {
    return (
      <div className="flex flex-col h-[600px] bg-zinc-900/50 border border-white/5 rounded-[32px] overflow-hidden shadow-2xl relative">
        {/* Scenario Header */}
        <div className="p-6 border-b border-white/5 bg-zinc-900/80 backdrop-blur-xl flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedScenario(null)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-white font-bold">{selectedScenario.title}</h3>
              <p className="text-zinc-500 text-xs truncate max-w-[200px]">{selectedScenario.goal}</p>
            </div>
          </div>
          {isFinished && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={runAudit}
              disabled={isEvaluating}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-full flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              {isEvaluating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
              {isEvaluating ? 'Auditing...' : 'Review Session'}
            </motion.button>
          )}
        </div>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
        >
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  m.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-tr-none' 
                    : 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-white/5'
                }`}>
                  <p className="text-sm leading-relaxed">{m.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 p-4 rounded-2xl rounded-tl-none animate-pulse">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-zinc-900/80 backdrop-blur-xl border-t border-white/5">
          <div className="relative">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Simbag sa Bikol..."
              disabled={isLoading || audit !== null}
              className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 pl-6 pr-14 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading || audit !== null}
              className="absolute right-2 top-2 w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-800 text-white rounded-xl flex items-center justify-center transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {selectedScenario.vocabulary.map((vocab, i) => (
              <span key={i} className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                {vocab}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {scenarios.map((scenario) => (
        <button
          key={scenario.id}
          onClick={() => startScenario(scenario)}
          className="text-left p-8 bg-zinc-900/50 border border-white/5 rounded-[32px] hover:border-blue-500/30 transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-blue-500/10 transition-colors">
            <MessageSquare className="w-24 h-24" />
          </div>
          <div className="space-y-4 relative z-10">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{scenario.title}</h3>
              <p className="text-zinc-500 text-sm mt-1 leading-relaxed">{scenario.description}</p>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5">
                {scenario.difficulty === 'beginner' ? (
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                ) : scenario.difficulty === 'intermediate' ? (
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                ) : (
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                )}
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  {scenario.difficulty === 'beginner' ? 'Low Energy' :
                   scenario.difficulty === 'intermediate' ? 'Moderate Energy' :
                   'High Energy'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-blue-500 text-xs font-bold">
                Start Session <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
