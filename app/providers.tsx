"use client";

import { ThemeProvider } from "next-themes";
import { MotionProvider } from "@/hooks/useMotionPreferences";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <MotionProvider>
        {children}
      </MotionProvider>
    </ThemeProvider>
  );
}
