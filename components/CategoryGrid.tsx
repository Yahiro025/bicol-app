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
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
} as const;

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
} as const;

export default function CategoryGrid({ categoryCounts, className }: CategoryGridProps) {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className}`}
    >
      {categoryCounts.map(({ category, _count }) => {
        const meta = CATEGORY_META[category] || { icon: Book, color: "#6B6259" };
        const Icon = meta.icon;

        return (
          <motion.div key={category} variants={itemVariants}>
            <Link
              href={`/browse?category=${encodeURIComponent(category)}`}
              className="group p-8 backdrop-blur-sm border rounded-2xl hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98] transition-all duration-300 flex flex-col items-center text-center space-y-4 relative overflow-hidden"
              style={{ backgroundColor: 'var(--editorial-surface)', borderColor: 'var(--editorial-border)' }}
            >
              <div 
                className="p-4 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-inner border"
                style={{ backgroundColor: 'var(--editorial-bg)', borderColor: 'var(--editorial-border)', color: 'var(--editorial-accent)' }}
              >
                <Icon size={32} />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg group-hover:opacity-80 transition-colors tracking-tight" style={{ color: 'var(--editorial-text)' }}>{category}</h3>
                <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>{_count.bikol} words</p>
              </div>
              
              {/* Subtle background glow on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                style={{ background: 'radial-gradient(circle at center, var(--editorial-accent) 0%, transparent 70%)' }}
              />
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
