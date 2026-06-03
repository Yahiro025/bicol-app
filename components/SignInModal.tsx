"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, KeyRound, Loader2 } from "lucide-react";
import { useAuth, supabase as getSupabase } from "@/hooks/useAuth";

type SignInModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type AuthView = "sign-in" | "sign-up" | "magic-link" | "magic-link-sent";

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [view, setView] = useState<AuthView>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setView("sign-in");
      setEmail("");
      setPassword("");
      setError(null);
      setIsSubmitting(false);
      // Focus email input after animation
      requestAnimationFrame(() => emailRef.current?.focus());
    }
  }, [isOpen]);

  // Auto-close if user becomes authenticated
  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: authError } = await getSupabase().auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) throw authError;
      // onClose is triggered by user change effect
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to sign in";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: authError } = await getSupabase().auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      // Supabase may return a session immediately if email confirmation is off,
      // or return user with no session if confirmation is required.
      setView("magic-link-sent");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create account";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: authError } = await getSupabase().auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      setView("magic-link-sent");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send magic link";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl z-10"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white">
                  {view === "sign-up"
                    ? "Create Account"
                    : view === "magic-link" || view === "magic-link-sent"
                      ? "Magic Link"
                      : "Sign In"}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {view === "sign-up"
                    ? "Join the Bikol Dictionary community"
                    : "Track your learning progress and contributions"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full transition-colors"
                aria-label="Close sign in"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {view === "magic-link-sent" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center space-y-4"
                >
                  <div className="w-14 h-14 mx-auto bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-lg font-black text-white">
                      Check your email
                    </h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      We sent a magic link to{" "}
                      <span className="text-blue-400 font-semibold">
                        {email}
                      </span>
                      . Click the link to sign in instantly.
                    </p>
                  </div>
                  <button
                    onClick={() => setView("sign-in")}
                    className="text-sm text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                  >
                    ← Back to sign in
                  </button>
                </motion.div>
              ) : (
                <form
                  onSubmit={
                    view === "sign-up"
                      ? handleEmailSignUp
                      : view === "magic-link"
                        ? handleMagicLink
                        : handleEmailSignIn
                  }
                  className="space-y-4"
                >
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="signin-email"
                      className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2"
                    >
                      Email
                    </label>
                    <input
                      ref={emailRef}
                      id="signin-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                      }}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-zinc-500"
                    />
                  </div>

                  {/* Password (hidden for magic-link view) */}
                  {view !== "magic-link" && (
                    <div>
                      <label
                        htmlFor="signin-password"
                        className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2"
                      >
                        Password
                      </label>
                      <input
                        id="signin-password"
                        type="password"
                        required
                        autoComplete={
                          view === "sign-up"
                            ? "new-password"
                            : "current-password"
                        }
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError(null);
                        }}
                        placeholder={
                          view === "sign-up"
                            ? "Create a password (min 8 chars)"
                            : "Enter your password"
                        }
                        minLength={view === "sign-up" ? 8 : undefined}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-zinc-500"
                      />
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 font-medium"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting || authLoading}
                    className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {view === "sign-up"
                          ? "Creating account..."
                          : view === "magic-link"
                            ? "Sending link..."
                            : "Signing in..."}
                      </>
                    ) : view === "sign-up" ? (
                      <>
                        <KeyRound className="w-4 h-4" />
                        Create Account
                      </>
                    ) : view === "magic-link" ? (
                      <>
                        <Mail className="w-4 h-4" />
                        Send Magic Link
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        Sign In
                      </>
                    )}
                  </button>

                  {/* Alternate auth methods */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800">
                    {view === "sign-in" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setView("magic-link")}
                          className="w-full py-2.5 text-sm text-zinc-400 hover:text-white font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          Sign in with magic link
                        </button>
                        <button
                          type="button"
                          onClick={() => setView("sign-up")}
                          className="w-full py-2.5 text-sm text-zinc-400 hover:text-white font-medium transition-colors"
                        >
                          Don&apos;t have an account?{" "}
                          <span className="text-blue-400 font-semibold">
                            Sign up
                          </span>
                        </button>
                      </>
                    )}

                    {view === "sign-up" && (
                      <button
                        type="button"
                        onClick={() => setView("sign-in")}
                        className="w-full py-2.5 text-sm text-zinc-400 hover:text-white font-medium transition-colors"
                      >
                        Already have an account?{" "}
                        <span className="text-blue-400 font-semibold">
                          Sign in
                        </span>
                      </button>
                    )}

                    {view === "magic-link" && (
                      <button
                        type="button"
                        onClick={() => setView("sign-in")}
                        className="w-full py-2.5 text-sm text-zinc-400 hover:text-white font-medium transition-colors"
                      >
                        ← Back to password sign in
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
