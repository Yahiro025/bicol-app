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
};

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
};

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
              className="group p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-blue-500/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5 active:scale-95 transition-all duration-300 flex flex-col items-center text-center space-y-3 relative overflow-hidden"
              style={{ borderTop: `4px solid ${meta.color}` }}
            >
              <div 
                className="p-3 rounded-xl bg-zinc-800 group-hover:scale-110 transition-transform duration-300 shadow-inner"
                style={{ color: meta.color }}
              >
                <Icon size={28} />
              </div>
              <div>
                <h3 className="font-bold text-sm md:text-base text-zinc-100 group-hover:text-white transition-colors">{category}</h3>
                <p className="text-xs text-zinc-500">{_count.bikol} words</p>
              </div>
              
              {/* Subtle background glow on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${meta.color}, transparent 70%)` }}
              />
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
