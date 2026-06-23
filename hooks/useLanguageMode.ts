"use client";

import { useState, useEffect } from 'react';
import type { LanguageMode } from '@/components/LanguageToggle';

const STORAGE_KEY = 'bikoldict-lang-mode';
const EVENT_NAME = 'lang-mode-change';

export function useLanguageMode(): LanguageMode {
  const [langMode, setLangMode] = useState<LanguageMode>('all');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as LanguageMode | null;
    if (saved) setLangMode(saved);

    const handler = (e: Event) => setLangMode((e as CustomEvent<LanguageMode>).detail);
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  return langMode;
}
