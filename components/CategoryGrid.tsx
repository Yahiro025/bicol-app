'use client';

import Link from 'next/link';
import { CATEGORY_META } from '@/lib/constants';
import { Book } from 'lucide-react';
import { motion } from 'framer-motion';

interface CategoryCount {
  category: string;
  _count: {
    bikol: number;
  };
}

interface CategoryGridProps {
  categoryCounts: CategoryCount[];
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
} as const;

export default function CategoryGrid({ categoryCounts, className }: CategoryGridProps) {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 ${className ?? ''}`}
    >
      {categoryCounts.map(({ category, _count }) => {
        const meta = CATEGORY_META[category] || { icon: Book, color: "#6B6259" };
        const Icon = meta.icon;

        return (
          <motion.div key={category} variants={itemVariants}>
            <Link
              href={`/browse?category=${encodeURIComponent(category)}`}
              className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--editorial-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--editorial-bg)]"
              style={{
                backgroundColor: 'var(--editorial-surface)',
                borderColor: 'var(--editorial-border)',
              }}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105"
                  style={{
                    backgroundColor: 'var(--editorial-bg)',
                    borderColor: 'var(--editorial-border)',
                    color: 'var(--editorial-accent)',
                  }}
                >
                  <Icon size={18} />
                </div>
                <h3
                  className="font-bold text-base truncate tracking-tight group-hover:text-[var(--editorial-accent)] transition-colors"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--editorial-text)',
                  }}
                >
                  {category}
                </h3>
              </div>
              <div className="shrink-0 ml-3">
                <span
                  className="text-xs font-mono font-medium tabular-nums px-2.5 py-1 rounded-full border transition-colors group-hover:border-[var(--editorial-accent)]"
                  style={{
                    backgroundColor: 'var(--editorial-bg)',
                    borderColor: 'var(--editorial-border)',
                    color: 'var(--editorial-muted)',
                  }}
                >
                  {_count.bikol.toLocaleString()} entries
                </span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
