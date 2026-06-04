"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NAV_LINKS } from "@/lib/constants";

export default function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
      {NAV_LINKS.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/" && pathname.startsWith(link.href));

        return (
          <motion.span
            key={link.href}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              href={link.href}
              className={`flex items-center gap-1.5 transition-colors duration-200 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--editorial-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--editorial-bg)] ${
                isActive ? 'text-[var(--editorial-accent)]' : 'text-[var(--editorial-muted)] hover:text-[var(--editorial-text)]'
              }`}
            >
              <link.icon
                className="w-3.5 h-3.5 shrink-0 transition-colors duration-200"
                style={{
                  color: isActive ? 'var(--editorial-accent)' : 'var(--editorial-muted)',
                }}
              />
              {link.label}
            </Link>
          </motion.span>
        );
      })}

    </nav>
  );
}
