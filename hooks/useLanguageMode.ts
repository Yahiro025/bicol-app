"use client";

import { useState, useEffect } from 'react';
import type { LanguageMode } from '@/components/LanguageToggle';

export function useLanguageMode(): LanguageMode {
  const [langMode, setLangMode] = useState<LanguageMode>('all');

  useEffect(() => {
    const saved = localStorage.getItem('bikoldict-lang-mode') as LanguageMode;
    if (saved) setLangMode(saved);

    const handler = (e: Event) => {
      setLangMode((e as CustomEvent<LanguageMode>).detail);
    };
    window.addEventListener('lang-mode-change', handler);
    return () => window.removeEventListener('lang-mode-change', handler);
  }, []);

  return langMode;
}
