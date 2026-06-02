"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NAV_LINKS, NAV_ICON_COLORS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/components/AuthProvider";
import { User, LogIn } from "lucide-react";

export default function DesktopNav() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const { openSignIn } = useAuthModal();

  return (
    <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
      {NAV_LINKS.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/" && pathname.startsWith(link.href));
        const colors = NAV_ICON_COLORS[link.href] ?? {
          base: "#a1a1aa",
          active: "#3b82f6",
        };

        return (
          <motion.span
            key={link.href}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              href={link.href}
              onFocus={(e) => {
                if (!isActive) {
                  const icon = e.currentTarget.firstElementChild as HTMLElement | null;
                  if (icon) icon.style.color = colors.active;
                }
              }}
              onBlur={(e) => {
                if (!isActive) {
                  const icon = e.currentTarget.firstElementChild as HTMLElement | null;
                  if (icon) icon.style.color = colors.base;
                }
              }}
              className={`flex items-center gap-1.5 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950 ${
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
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as unknown as HTMLElement).style.color = colors.active;
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as unknown as HTMLElement).style.color = colors.base;
                }}
              />
              {link.label}
            </Link>
          </motion.span>
        );
      })}

      {/* Auth button */}
      {isLoading ? (
        <span className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      ) : user ? (
        <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/profile"
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            aria-label="View profile"
          >
            <User className="w-3.5 h-3.5" />
            <span className="max-w-[80px] truncate">
              {user.user_metadata?.username ?? user.email?.split("@")[0]}
            </span>
          </Link>
        </motion.span>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={openSignIn}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          aria-label="Sign in"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </motion.button>
      )}
    </nav>
  );
}
