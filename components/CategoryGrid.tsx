'use client';

import React from 'react';
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
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25
    }
  }
} as const;

export default function CategoryGrid({ categoryCounts, className }: CategoryGridProps) {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}
    >
      {categoryCounts.map(({ category, _count }) => {
        const meta = CATEGORY_META[category] || { icon: Book, color: "#6B6259" };
        const Icon = meta.icon;

        return (
          <motion.div key={category} variants={itemVariants}>
            <Link
              href={`/browse?category=${encodeURIComponent(category)}`}
              className="group p-6 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 active:scale-[0.98] transition-all duration-300 flex flex-col items-center text-center space-y-4 relative overflow-hidden"
            >
              <div 
                className="p-4 rounded-2xl bg-zinc-800/50 text-blue-500 group-hover:bg-blue-500/10 group-hover:scale-110 transition-all duration-300 shadow-inner border border-zinc-700/50 group-hover:border-blue-500/20"
              >
                <Icon size={32} />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white group-hover:text-blue-400 transition-colors tracking-tight">{category}</h3>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">{_count.bikol} words</p>
              </div>
              
              {/* Subtle background glow on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none bg-radial-gradient from-blue-500 to-transparent"
              />
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
