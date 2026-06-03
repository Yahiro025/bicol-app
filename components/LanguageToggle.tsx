"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Languages } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

export type LanguageMode = 'en' | 'tl' | 'all';

const MODE_LABELS: Record<LanguageMode, string> = {
  en: 'Definitions in English',
  tl: 'Definitions in Tagalog',
  all: 'All translations shown',
};

export default function LanguageToggle() {
  const [mode, setMode] = useState<LanguageMode>('all');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('bikoldict-lang-mode') as LanguageMode;
    if (saved) {
      setMode(saved);
      // Dispatch on initial load so all components sync immediately
      window.dispatchEvent(new CustomEvent('lang-mode-change', { detail: saved }));
    }
  }, []);

  const handleToggle = useCallback((newMode: LanguageMode) => {
    if (newMode === mode) return;
    
    setMode(newMode);
    localStorage.setItem('bikoldict-lang-mode', newMode);
    // Dispatch a custom event so other components can listen
    window.dispatchEvent(new CustomEvent('lang-mode-change', { detail: newMode }));

    // Show toast feedback
    setToastMessage(MODE_LABELS[newMode]);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }, [mode]);

  return (
    <div className="relative flex items-center gap-1 border p-1 rounded-full" style={{ backgroundColor: 'var(--editorial-surface)', borderColor: 'var(--editorial-border)' }}>
      {/* Toast notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg shadow-lg pointer-events-none z-50"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-1.5 px-2" style={{ color: 'var(--editorial-muted)' }}>
        <Languages size={14} />
      </div>
      <LayoutGroup>
        {(['en', 'tl', 'all'] as LanguageMode[]).map((m) => (
          <motion.button
            key={m}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleToggle(m)}
            className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest transition-all relative ${
              mode === m 
                ? 'text-white shadow-lg' 
                : ''
            }`}
            style={mode === m ? { backgroundColor: 'var(--editorial-accent)' } : { color: 'var(--editorial-muted)' }}
          >
            {m.toUpperCase()}
            {/* Active indicator dot */}
            {mode === m && (
              <motion.span
                layoutId="lang-active-dot"
                className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-white rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </LayoutGroup>
    </div>
  );
}
