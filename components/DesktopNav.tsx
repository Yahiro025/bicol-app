"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NAV_LINKS } from "@/lib/constants";

export default function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
      {NAV_LINKS.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

        return (
          <motion.span key={href} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={href}
              className={`flex items-center gap-1.5 transition-colors duration-200 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--editorial-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--editorial-bg)] ${
                isActive ? 'text-[var(--editorial-accent)]' : 'text-[var(--editorial-muted)] hover:text-[var(--editorial-text)]'
              }`}
            >
              <Icon
                className="w-3.5 h-3.5 shrink-0 transition-colors duration-200"
                style={{ color: isActive ? 'var(--editorial-accent)' : 'var(--editorial-muted)' }}
              />
              {label}
            </Link>
          </motion.span>
        );
      })}
    </nav>
  );
}
