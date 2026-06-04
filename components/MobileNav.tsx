"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Only render portal after client-side mount (SSR-safe)
  useEffect(() => {
    setMounted(true);
  }, []);

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
        className="p-2 -mr-2 transition-colors rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--editorial-bg)]"
        style={{ color: 'var(--editorial-muted)' }}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Menu className="w-6 h-6" />
      </button>
      {/* Overlay + Drawer — rendered via portal to document.body so the inert
          attribute on #main-content doesn't block drawer interactions.
          AnimatePresence is placed INSIDE the portal (not wrapping it) so
          framer-motion can properly track motion children for enter/exit. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  key="mobile-nav-backdrop"
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
                  key="mobile-nav-drawer"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Navigation menu"
                  className="fixed top-0 right-0 z-50 h-full w-[280px] shadow-2xl"
                  style={{
                    backgroundColor: 'var(--editorial-surface-raised)',
                    borderLeft: '1px solid var(--editorial-border)',
                  }}
                >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--editorial-border)' }}>
                  <span className="text-lg font-display font-black"
                    style={{ color: 'var(--editorial-accent)' }}>
                    BIKOL
                  </span>
                  <button
                    ref={closeButtonRef}
                    onClick={close}
                    className="p-2 transition-colors rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--editorial-bg)]"
                    style={{ color: 'var(--editorial-muted)' }}
                    aria-label="Close navigation menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Nav Links */}
                <nav className="py-4 px-3">
                  {NAV_LINKS.map((link) => {
                    const isActive =
                      pathname === link.href ||
                      (link.href !== "/" && pathname.startsWith(link.href));
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        prefetch={false}
                        className={`flex items-center gap-3 px-4 py-4 rounded-2xl text-lg font-bold transition-all duration-200 mb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--editorial-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--editorial-bg)] ${
                          isActive
                            ? "border"
                            : "hover:bg-[var(--editorial-surface-sunken)]"
                        }`}
                        style={isActive
                          ? {
                              backgroundColor: 'rgba(124, 92, 146, 0.08)',
                              color: 'var(--editorial-accent)',
                              borderColor: 'rgba(124, 92, 146, 0.2)',
                            }
                          : {
                              color: 'var(--editorial-text-secondary)',
                            }
                        }
                      >
                        <link.icon
                          className="w-5 h-5 shrink-0 transition-colors duration-200"
                          style={{
                            color: isActive ? 'var(--editorial-accent)' : 'var(--editorial-muted)',
                          }}
                        />
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>

                {/* Bottom hint */}
                <div className="absolute bottom-0 left-0 right-0 text-center py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--editorial-muted)' }}>
                    Bikol Dictionary
                  </p>
                </div>
              </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
