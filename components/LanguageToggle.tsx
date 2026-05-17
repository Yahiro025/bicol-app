"use client";

import React, { useState, useEffect } from 'react';
import { Languages } from 'lucide-react';

export type LanguageMode = 'en' | 'tl' | 'all';

export default function LanguageToggle() {
  const [mode, setMode] = useState<LanguageMode>('all');

  useEffect(() => {
    const saved = localStorage.getItem('bikoldict-lang-mode') as LanguageMode;
    if (saved) setMode(saved);
  }, []);

  const handleToggle = (newMode: LanguageMode) => {
    setMode(newMode);
    localStorage.setItem('bikoldict-lang-mode', newMode);
    // Dispatch a custom event so other components can listen
    window.dispatchEvent(new CustomEvent('lang-mode-change', { detail: newMode }));
  };

  return (
    <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-full">
      <div className="flex items-center gap-1.5 px-2 text-zinc-500">
        <Languages size={14} />
      </div>
      {(['en', 'tl', 'all'] as LanguageMode[]).map((m) => (
        <button
          key={m}
          onClick={() => handleToggle(m)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
            mode === m 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {m.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
