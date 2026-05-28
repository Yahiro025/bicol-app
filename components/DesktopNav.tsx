"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";

/** Per-link icon accent colors (light/dark) for hover and active states */
const ICON_COLORS: Record<string, { base: string; active: string }> = {
  "/":           { base: "#a1a1aa", active: "#3b82f6" }, // blue-500
  "/browse":     { base: "#a1a1aa", active: "#10b981" }, // emerald-500
  "/learn":      { base: "#a1a1aa", active: "#f59e0b" }, // amber-500
  "/flashcards": { base: "#a1a1aa", active: "#8b5cf6" }, // violet-500
};

export default function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest">
      {NAV_LINKS.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/" && pathname.startsWith(link.href));
        const colors = ICON_COLORS[link.href] ?? {
          base: "#a1a1aa",
          active: "#3b82f6",
        };

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-1.5 transition-colors ${
              isActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <link.icon
              className="w-3.5 h-3.5 shrink-0 transition-colors"
              style={{
                color: isActive ? colors.active : colors.base,
              }}
              // On hover (when not active), use the accent color
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.color = colors.active;
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.color = colors.base;
              }}
            />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
