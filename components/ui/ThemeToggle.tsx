"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={cn("w-11 h-11 rounded-xl", className)}
        style={{ backgroundColor: 'var(--editorial-surface)' }}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "p-2 rounded-xl transition-all duration-200 min-w-11 min-h-11",
        "hover:brightness-95 dark:hover:brightness-110 hover:scale-105 active:scale-95",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--editorial-bg)]",
        "touch-manipulation [-webkit-tap-highlight-color:transparent]",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-500" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" style={{ color: 'var(--editorial-muted)' }} aria-hidden="true" />
      )}
    </button>
  );
}
