"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, NAV_ICON_COLORS } from "@/lib/constants";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Restore focus to the hamburger button after close animation
    setTimeout(() => {
      hamburgerRef.current?.focus();
    }, 0);
  }, []);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Focus trap: set inert on main content, focus the close button
  useEffect(() => {
    const mainContent = document.getElementById("main-content");
    if (!mainContent) return;

    if (isOpen) {
      mainContent.setAttribute("inert", "");
      // Focus the close button after the drawer animation starts
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
    } else {
      mainContent.removeAttribute("inert");
    }

    return () => {
      mainContent.removeAttribute("inert");
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        ref={hamburgerRef}
        onClick={open}
        className="p-2 -mr-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#09090b]"
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay + Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>              {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={close}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="fixed top-0 right-0 z-50 h-full w-[280px] bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-lg font-display font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                  BIKOL
                </span>
                <button
                  ref={closeButtonRef}
                  onClick={close}
                  className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav Links */}
              <nav className="py-4 px-3">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                  const colors = NAV_ICON_COLORS[link.href] ?? {
                    base: "#a1a1aa",
                    active: "#3b82f6",
                  };
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      prefetch={false}
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
                      className={`flex items-center gap-3 px-4 py-4 rounded-2xl text-lg font-bold transition-all mb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900 ${
                        isActive
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <link.icon
                        className="w-5 h-5 shrink-0 transition-colors"
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
                  );
                })}
              </nav>

              {/* Bottom hint */}
              <div className="absolute bottom-6 left-0 right-0 text-center">
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  Bikol Dictionary
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
