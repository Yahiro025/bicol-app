"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Clock,
  Edit3,
  Save,
  Database,
  MessageSquare,
  GitCompareArrows,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";

type Submission = {
  id: number;
  word: string;
  definition: string;
  pos: string | null;
  dialect: string | null;
  pronunciation: string | null;
  example_bikol: string | null;
  example_english: string | null;
  source: string | null;
  status: string;
  target_table: string;
  admin_notes: string | null;
  original_id: string | null;
  original_type: string | null;
  created_at: string;
};

type EditFormData = {
  word: string;
  definition: string;
  pos: string;
  dialect: string;
  pronunciation: string;
  example_bikol: string;
  example_english: string;
  source: string;
  admin_notes: string;
};

type OriginalWordData = {
  word: string | null;
  pos: string | null;
  pronunciation: string | null;
  definition: string | null;
  dialect: string | null;
  example_bikol: string | null;
  example_english: string | null;
  source: string | null;
};

const DIFF_FIELDS: { key: keyof OriginalWordData; label: string }[] = [
  { key: "word", label: "Bikol Word" },
  { key: "definition", label: "Definition" },
  { key: "pos", label: "Part of Speech" },
  { key: "dialect", label: "Dialect" },
  { key: "pronunciation", label: "Pronunciation" },
  { key: "example_bikol", label: "Example (Bikol)" },
  { key: "example_english", label: "Example (English)" },
  { key: "source", label: "Source" },
];

function DiffRow({ label, original, proposed }: { label: string; original: string | null; proposed: string | null }) {
  const norm = (v: string | null | undefined) => (v ?? "").trim();
  const isChanged = norm(original) !== norm(proposed);

  if (!isChanged) {
    return (
      <div className="grid grid-cols-[140px_1fr_1fr] gap-3 text-xs items-start py-2 opacity-40">
        <span className="font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none text-[10px]">{label}</span>
        <span className="text-zinc-600 dark:text-zinc-400 break-words">{norm(original) || "—"}</span>
        <span className="text-zinc-600 dark:text-zinc-400 break-words">{norm(proposed) || "—"}</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[140px_1fr_1fr] gap-3 text-xs items-start py-2 bg-yellow-500/5 dark:bg-yellow-500/[0.02] border-l-2 border-yellow-500/40 pl-2 rounded-r-md">
      <span className="font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider text-[10px] flex items-center gap-1 select-none">
        {label}
        <span className="text-[9px] bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-1 rounded font-normal font-sans">Changed</span>
      </span>
      <span className="text-red-600 dark:text-red-400/80 bg-red-500/5 px-2 py-1 rounded border border-red-500/10 break-words line-through">
        {norm(original) || "—"}
      </span>
      <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10 break-words font-medium">
        {norm(proposed) || "—"}
      </span>
    </div>
  );
}

const emptyEditForm = (sub: Submission): EditFormData => ({
  word: sub.word,
  definition: sub.definition,
  pos: sub.pos || "",
  dialect: sub.dialect || "",
  pronunciation: sub.pronunciation || "",
  example_bikol: sub.example_bikol || "",
  example_english: sub.example_english || "",
  source: sub.source || "",
  admin_notes: sub.admin_notes || "",
});

export default function AdminSubmissionsPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  // Data state
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");

  // Edit modal state
  const [editTarget, setEditTarget] = useState<Submission | null>(null);
  const [editForm, setEditForm] = useState<EditFormData | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Batch action state
  const [batchLoading, setBatchLoading] = useState(false);

  // Comparison view state (for suggested edits)
  const [expandedCompare, setExpandedCompare] = useState<Set<number>>(new Set());
  const [originals, setOriginals] = useState<Record<number, OriginalWordData | null>>({});
  const [originalsLoading, setOriginalsLoading] = useState<Set<number>>(new Set());

  const ADMIN_SECRET =
    process.env.NEXT_PUBLIC_ADMIN_API_SECRET || "bikoldict-admin-secret-change-me";

  const adminHeaders = {
    "Content-Type": "application/json",
    "x-admin-secret": ADMIN_SECRET,
  };
  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/submit?limit=500", { headers: adminHeaders });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setSubmissions(data);
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Failed to load submissions",
      );
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
    if (
      password ===
      (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "bikoldict2024")
    ) {
      setIsAuthenticated(true);
      setPasswordError(false);
      setPassword("");
    } else {
      setPasswordError(true);
    }
  };

  // ─── Edit modal ──────────────────────────────────────────────────────────
  const openEdit = (sub: Submission) => {
    setEditTarget(sub);
    setEditForm(emptyEditForm(sub));
    setEditError("");
  };

  const closeEdit = () => {
    setEditTarget(null);
    setEditForm(null);
    setEditError("");
  };

  const handleEditSave = async () => {
    if (!editTarget || !editForm) return;
    setEditSaving(true);
    setEditError("");

    try {
      const res = await fetch("/api/submit", {
        method: "PATCH",
        headers: adminHeaders,
        body: JSON.stringify({
          id: editTarget.id,
          word: editForm.word.trim(),
          definition: editForm.definition.trim(),
          pos: editForm.pos || null,
          dialect: editForm.dialect || null,
          pronunciation: editForm.pronunciation || null,
          example_bikol: editForm.example_bikol || null,
          example_english: editForm.example_english || null,
          source: editForm.source || null,
          admin_notes: editForm.admin_notes || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      const { data: updated } = await res.json();
      setSubmissions((prev) =>
        prev.map((s) => (s.id === editTarget.id ? { ...s, ...updated } : s)),
      );
      closeEdit();
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setEditSaving(false);
    }
  };

  // ─── Single action ───────────────────────────────────────────────────────
  const handleAction = async (
    id: number,
    status: "approved" | "rejected",
    targetTable?: string,
  ) => {
    try {
      const body: Record<string, unknown> = { id, status };
      if (targetTable) body.targetTable = targetTable;
      // Use existing target_table if not specified
      if (!targetTable) {
        const sub = submissions.find((s) => s.id === id);
        if (sub) body.targetTable = sub.target_table;
      }

      const res = await fetch("/api/submit", {
        method: "PATCH",
        headers: adminHeaders,
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const { data: updated } = await res.json();
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updated } : s)),
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update submission");
    }
  };

  // ─── Batch approve/reject ────────────────────────────────────────────────
  const handleBatchAction = async (status: "approved" | "rejected") => {
    const pending = filtered.filter((s) => s.status === "pending");
    if (pending.length === 0) return;

    setBatchLoading(true);
    setError(null);

    let successCount = 0;
    for (const sub of pending) {
      try {
        const res = await fetch("/api/submit", {
          method: "PATCH",
          headers: adminHeaders,
          body: JSON.stringify({
            id: sub.id,
            status,
            targetTable: sub.target_table,
          }),
        });
        if (res.ok) {
          const { data: updated } = await res.json();
          setSubmissions((prev) =>
            prev.map((s) => (s.id === sub.id ? { ...s, ...updated } : s)),
          );
          successCount++;
        }
      } catch {
        // continue with remaining
      }
    }

    if (successCount < pending.length) {
      setError(
        `Processed ${successCount}/${pending.length} submissions. Some failed.`,
      );
    }

    setBatchLoading(false);
  };

  const toggleCompare = async (sub: Submission) => {
    if (!sub.original_id || !sub.original_type) return;

    const id = sub.id;
    const isExpanded = expandedCompare.has(id);

    if (isExpanded) {
      setExpandedCompare((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return;
    }

    setExpandedCompare((prev) => new Set(prev).add(id));

    if (originals[id] !== undefined) return;

    setOriginalsLoading((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(
        `/api/admin/word-original?id=${encodeURIComponent(sub.original_id)}&type=${sub.original_type}`,
        { headers: adminHeaders }
      );
      if (!res.ok) throw new Error(`Failed to fetch original: ${res.status}`);
      const data = await res.json();
      setOriginals((prev) => ({ ...prev, [id]: data }));
    } catch (err) {
      console.error(err);
      setOriginals((prev) => ({ ...prev, [id]: null }));
    } finally {
      setOriginalsLoading((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const filtered = submissions.filter((s) =>
    filter === "all" ? true : s.status === filter,
  );

  const counts = {
    all: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
  };

  const FILTERS: {
    key: typeof filter;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "pending",
      label: "Pending",
      icon: <Clock className="w-3 h-3" />,
    },
    {
      key: "approved",
      label: "Approved",
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    {
      key: "rejected",
      label: "Rejected",
      icon: <XCircle className="w-3 h-3" />,
    },
    {
      key: "all",
      label: "All",
      icon: <ShieldCheck className="w-3 h-3" />,
    },
  ];

  // ─── Password gate ───────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-6"
        >
          <div className="text-center space-y-2">
            <ShieldCheck className="w-12 h-12 mx-auto text-blue-500" />
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
              Admin Access
            </h1>
            <p className="text-sm text-zinc-500">
              Enter the admin password to continue
            </p>
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
            <p className="text-sm text-red-500 text-center font-medium">
              Incorrect password. Try again.
            </p>
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

  // ─── Authenticated view ──────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <Link
              href="/"
              className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors w-fit mb-3"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Back to Archive
              </span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight">
              Submissions
            </h1>
            <p className="text-zinc-500">
              Review and moderate user-contributed words
            </p>
          </div>
          <button
            onClick={fetchSubmissions}
            className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            title="Refresh"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
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

        {/* Batch actions (pending tab only) */}
        {filter === "pending" && counts.pending > 0 && (
          <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <span className="text-sm font-bold text-zinc-500">
              Batch actions:
            </span>
            <button
              onClick={() => handleBatchAction("approved")}
              disabled={batchLoading}
              className="px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              Approve All ({counts.pending})
            </button>
            <button
              onClick={() => handleBatchAction("rejected")}
              disabled={batchLoading}
              className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-400 transition-colors disabled:opacity-50"
            >
              Reject All ({counts.pending})
            </button>
          </div>
        )}

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
        {error && !isLoading && (
          <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-2xl text-center">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchSubmissions();
              }}
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
                <p className="text-sm mt-1">
                  Check back later for new contributions
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {filtered.map((sub) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-5 sm:p-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-bold text-blue-500 break-all">
                            {sub.word}
                          </h3>
                          {sub.pos && (
                            <span className="text-[10px] uppercase tracking-widest font-black bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded border border-zinc-300 dark:border-zinc-700">
                              {sub.pos}
                            </span>
                          )}
                          {sub.dialect && (
                            <span className="text-[10px] uppercase tracking-widest font-black bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded border border-purple-500/20">
                              {sub.dialect}
                            </span>
                          )}
                          {sub.original_id && (
                            <div className="flex flex-wrap gap-2">
                              <Link 
                                href={`/word/${encodeURIComponent(sub.word)}`}
                                target="_blank"
                                className="text-[10px] uppercase tracking-widest font-black bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded border border-yellow-500/20 flex items-center gap-1 transition-colors"
                              >
                                <span>✏️ Suggested Edit</span>
                                <span className="opacity-70 font-normal font-sans">(View Current)</span>
                              </Link>
                              <button
                                onClick={() => toggleCompare(sub)}
                                className="text-[10px] uppercase tracking-widest font-black bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded border border-blue-500/20 flex items-center gap-1 transition-colors"
                              >
                                <GitCompareArrows className="w-3 h-3" />
                                <span>{expandedCompare.has(sub.id) ? "Hide Changes" : "Compare Changes"}</span>
                                {expandedCompare.has(sub.id) ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                        <p className="text-zinc-700 dark:text-zinc-300">
                          {sub.definition}
                        </p>

                        {/* Extra fields */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 mt-1">
                          {sub.pronunciation && (
                            <span>🔊 {sub.pronunciation}</span>
                          )}
                          {sub.example_bikol && (
                            <span className="italic">
                              &ldquo;{sub.example_bikol}&rdquo;
                            </span>
                          )}
                          {sub.example_english && (
                            <span>&ldquo;{sub.example_english}&rdquo;</span>
                          )}
                          {sub.source && (
                            <span>📖 {sub.source}</span>
                          )}
                        </div>

                        {/* Admin notes */}
                        {sub.admin_notes && (
                          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/20 rounded-lg text-xs text-yellow-700 dark:text-yellow-400">
                            <MessageSquare className="w-3 h-3 inline mr-1" />
                            {sub.admin_notes}
                          </div>
                        )}

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mt-2">
                          <span>
                            Submitted:{" "}
                            {new Date(sub.created_at).toLocaleDateString()}
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
                          <span className="flex items-center gap-1">
                            <Database className="w-3 h-3" />
                            {sub.target_table === "normalized"
                              ? "Roots"
                              : "Legacy"}
                          </span>
                        </div>

                        {/* Comparison Panel */}
                        {sub.original_id && expandedCompare.has(sub.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden mt-4"
                          >
                            <div className="p-4 bg-zinc-100/50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl space-y-3">
                              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                <span>Field</span>
                                <div className="grid grid-cols-2 gap-3 flex-1 ml-[140px] text-left">
                                  <span>Current (Live)</span>
                                  <span>Proposed Edit</span>
                                </div>
                              </div>

                              {originalsLoading.has(sub.id) ? (
                                <div className="flex items-center gap-2 py-4 justify-center text-xs text-zinc-500">
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    className="w-3.5 h-3.5 border border-blue-500/20 border-t-blue-500 rounded-full"
                                  />
                                  <span>Fetching current database values...</span>
                                </div>
                              ) : originals[sub.id] === null ? (
                                <div className="text-center py-4 text-xs text-red-500 font-medium">
                                  Original word has been deleted or not found in the database.
                                </div>
                              ) : originals[sub.id] ? (
                                <div className="space-y-1 divide-y divide-zinc-200/30 dark:divide-zinc-800/30">
                                  {DIFF_FIELDS.map((field) => {
                                    const orig = originals[sub.id]?.[field.key] ?? null;
                                    const prop = sub[field.key as keyof Submission] ?? null;
                                    
                                    return (
                                      <DiffRow
                                        key={field.key}
                                        label={field.label}
                                        original={orig}
                                        proposed={prop ? String(prop) : null}
                                      />
                                    );
                                  })}
                                </div>
                              ) : null}
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Action buttons */}
                      {sub.status === "pending" && (
                        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                          <button
                            onClick={() =>
                              handleAction(sub.id, "approved")
                            }
                            className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all active:scale-95 border border-emerald-500/20"
                            title="Approve to Legacy"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleAction(
                                sub.id,
                                "approved",
                                "normalized",
                              )
                            }
                            className="p-2.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-all active:scale-95 border border-blue-500/20"
                            title="Approve to Normalized"
                          >
                            <Database className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openEdit(sub)}
                            className="p-2.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-xl transition-all active:scale-95 border border-zinc-300 dark:border-zinc-600"
                            title="Edit before approving"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleAction(sub.id, "rejected")
                            }
                            className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all active:scale-95 border border-red-500/20"
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

      {/* ─── Edit Modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editTarget && editForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={closeEdit}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-black mb-6">Edit Submission</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
                    Bikol Word
                  </label>
                  <input
                    value={editForm.word}
                    onChange={(e) =>
                      setEditForm({ ...editForm, word: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
                    Definition
                  </label>
                  <textarea
                    value={editForm.definition}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        definition: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
                      Part of Speech
                    </label>
                    <input
                      value={editForm.pos}
                      onChange={(e) =>
                        setEditForm({ ...editForm, pos: e.target.value })
                      }
                      placeholder="e.g. Noun"
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
                      Dialect
                    </label>
                    <input
                      value={editForm.dialect}
                      onChange={(e) =>
                        setEditForm({ ...editForm, dialect: e.target.value })
                      }
                      placeholder="e.g. Central Bikol"
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
                    Pronunciation
                  </label>
                  <input
                    value={editForm.pronunciation}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        pronunciation: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
                    Example (Bikol)
                  </label>
                  <input
                    value={editForm.example_bikol}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        example_bikol: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
                    Example (English)
                  </label>
                  <input
                    value={editForm.example_english}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        example_english: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
                    Source
                  </label>
                  <input
                    value={editForm.source}
                    onChange={(e) =>
                      setEditForm({ ...editForm, source: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
                    Admin Notes
                  </label>
                  <textarea
                    value={editForm.admin_notes}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        admin_notes: e.target.value,
                      })
                    }
                    placeholder="Internal notes for other moderators..."
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[60px]"
                  />
                </div>
              </div>

              {editError && (
                <p className="mt-4 text-sm text-red-500 font-medium">
                  {editError}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={closeEdit}
                  className="flex-1 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={editSaving}
                  className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {editSaving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
