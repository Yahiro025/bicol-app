import React from "react";
import { cn } from "@/lib/utils";

interface LoadingBarProps {
  progress: number;
  className?: string;
}

export function LoadingBar({ progress, className }: LoadingBarProps) {
  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading progress"
      aria-live="polite"
      className={cn(
        "w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden",
        className
      )}
    >
      <div
        className="h-full bg-blue-500 rounded-full transition-all duration-150 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
