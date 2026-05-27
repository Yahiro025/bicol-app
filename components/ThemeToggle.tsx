"use client";
import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  let transitionTimer: ReturnType<typeof setTimeout> | null = null;

  useEffect(() => {
    setMounted(true);
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    // Activate smooth transition
    document.documentElement.classList.add('changing-theme');

    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Deactivate transition after animation completes
    // Clear previous timeout to handle rapid toggles properly
    if (transitionTimer) clearTimeout(transitionTimer);
    transitionTimer = setTimeout(() => {
      document.documentElement.classList.remove('changing-theme');
      transitionTimer = null;
    }, 300);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  return (
    <button 
      onClick={toggleTheme}
      className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:scale-105 transition-transform"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-zinc-600" />}
    </button>
  );
}
