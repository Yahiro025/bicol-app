"use client";

import { ThemeProvider } from "next-themes";
import { MotionProvider } from "@/hooks/useMotionPreferences";
import { AuthProvider } from "@/components/AuthProvider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <MotionProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </MotionProvider>
    </ThemeProvider>
  );
}
