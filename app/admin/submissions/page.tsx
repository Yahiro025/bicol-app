"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, ShieldCheck, Clock } from "lucide-react";

type Submission = {
  id: number;
  word: string;
  definition: string;
  dialect: string | null;
  status: string;
  created_at: string;
};

export default function AdminSubmissionsPage() {
  // Auth state — must be before any conditional returns (React hooks rules)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  // Data state — all hooks declared unconditionally
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/submit");
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setSubmissions(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load submissions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubmissions();
    }
  }, [isAuthenticated, fetchSubmissions]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password gate — set NEXT_PUBLIC_ADMIN_PASSWORD in your .env to secure this
    if (password === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "bikoldict2024")) {
      setIsAuthenticated(true);
      setPasswordError(false);
      setPassword("");
    } else {
      setPasswordError(true);
    }
  };

  const handleAction = async (id: number, status: "approved" | "rejected") => {
    try {
      const res = await fetch("/api/submit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update submission");
    }
  };

  const filtered = submissions.filter((s) =>
    filter === "all" ? true : s.status === filter
  );

  const counts = {
    all: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
  };

  const FILTERS: { key: typeof filter; label: string; icon: React.ReactNode }[] = [
    { key: "pending", label: "Pending", icon: <Clock className="w-3 h-3" /> },
    { key: "approved", label: "Approved", icon: <CheckCircle2 className="w-3 h-3" /> },
    { key: "rejected", label: "Rejected", icon: <XCircle className="w-3 h-3" /> },
    { key: "all", label: "All", icon: <ShieldCheck className="w-3 h-3" /> },
  ];

  // Password gate — render login form if not authenticated
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <ShieldCheck className="w-12 h-12 mx-auto text-blue-500" />
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">Admin Access</h1>
            <p className="text-sm text-zinc-500">Enter the admin password to continue</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(false);
            }}
            placeholder="Password"
            className="w-full px-5 py-3.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
            autoFocus
          />
          {passwordError && (
            <p className="text-sm text-red-500 text-center font-medium">Incorrect password. Try again.</p>
          )}
          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors active:scale-95 shadow-lg shadow-blue-500/20"
          >
            Unlock
          </button>
        </form>
      </main>
    );
  }

  // Authenticated view
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Link
              href="/"
              className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors w-fit mb-3"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Back to Archive</span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight">
              Submissions
            </h1>
            <p className="text-zinc-500">Review and moderate user-contributed words</p>
          </div>
          <button
            onClick={fetchSubmissions}
            className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            title="Refresh"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === f.key
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {f.icon}
              {f.label}
              <span className="ml-1 opacity-60">({counts[f.key]})</span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full"
            />
            <p className="text-zinc-500 text-sm">Loading submissions...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-2xl text-center">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            <button
              onClick={fetchSubmissions}
              className="mt-3 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Submissions list */}
        {!isLoading && !error && (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-bold">No {filter} submissions</p>
                <p className="text-sm mt-1">Check back later for new contributions</p>
              </div>
            ) : (
              <AnimatePresence>
                {filtered.map((sub) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-blue-500">{sub.word}</h3>
                          {sub.dialect && (
                            <span className="text-[10px] uppercase tracking-widest font-black bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded border border-purple-500/20">
                              {sub.dialect}
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-700 dark:text-zinc-300">{sub.definition}</p>
                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                          <span>
                            Submitted: {new Date(sub.created_at).toLocaleDateString()}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold ${
                              sub.status === "approved"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : sub.status === "rejected"
                                ? "bg-red-500/10 text-red-500"
                                : "bg-yellow-500/10 text-yellow-500"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>
                      </div>

                      {sub.status === "pending" && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleAction(sub.id, "approved")}
                            className="p-3 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all active:scale-95 border border-emerald-500/20"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleAction(sub.id, "rejected")}
                            className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all active:scale-95 border border-red-500/20"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
