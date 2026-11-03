"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_TTL = 7 * 24 * 60 * 60 * 1000;

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showAndroidBanner, setShowAndroidBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const wasDismissed = localStorage.getItem(DISMISS_KEY);
    if (wasDismissed && Date.now() - parseInt(wasDismissed, 10) < DISMISS_TTL) {
      setDismissed(true);
      return;
    }

    // Detect Android
    const isAndroid = /android/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    if (isAndroid && !isStandalone) {
      setShowAndroidBanner(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
        setShowAndroidBanner(false);
      }
    }
    dismiss();
  };

  const dismiss = () => {
    setShowPrompt(false);
    setShowAndroidBanner(false);
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  if (dismissed) return null;

  return (
    <>
      {/* Android App Banner */}
      <AnimatePresence>
        {showAndroidBanner && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-[73px] left-0 right-0 z-40 px-4 py-3 shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--editorial-accent), var(--editorial-rust))' }}
          >
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Get the BIKOL Dictionary App</p>
                  <p className="text-white/70 text-xs">Install for offline access and faster loading</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleInstall}
                  className="px-4 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-md"
                  style={{
                    backgroundColor: "var(--editorial-surface-raised)",
                    color: "var(--editorial-accent)",
                  }}
                >
                  <Download className="w-3.5 h-3.5" />
                  Install
                </button>
                <button
                  onClick={dismiss}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA Install Modal */}
      <AnimatePresence>
        {showPrompt && !showAndroidBanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={dismiss}
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-sm rounded-[32px] p-8 shadow-2xl space-y-6"
              style={{
                backgroundColor: "var(--editorial-surface-raised)",
                borderColor: "var(--editorial-border)",
                borderWidth: "1px",
              }}
            >
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 p-2 transition-colors rounded-xl"
                style={{ color: "var(--editorial-muted)" }}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-3">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-md"
                  style={{
                    backgroundColor: "var(--editorial-accent-glow)",
                    border: "1px solid var(--editorial-border)",
                  }}
                >
                  <Download className="w-8 h-8" style={{ color: "var(--editorial-accent)" }} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: "var(--editorial-text)" }}>Install BIKOL Dictionary</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--editorial-muted)" }}>
                  Add to your home screen for instant access, offline support, and a full-screen experience — no app store needed.
                </p>
              </div>

              <div className="grid gap-3">
                <button
                  onClick={handleInstall}
                  className="w-full py-4 text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg"
                  style={{
                    backgroundColor: "var(--editorial-accent)",
                    boxShadow: "0 10px 25px -5px var(--editorial-accent-glow)",
                  }}
                >
                  Install App
                </button>
                <button
                  onClick={dismiss}
                  className="w-full py-3 text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: "var(--editorial-muted)" }}
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
