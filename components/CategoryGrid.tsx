import React from 'react';
import Link from 'next/link';
import { CATEGORY_META } from '@/lib/constants';
import { Book } from 'lucide-react';

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

export default function CategoryGrid({ categoryCounts }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categoryCounts.map(({ category, _count }) => {
        const meta = CATEGORY_META[category] || { icon: Book, color: "#6B6259" };
        const Icon = meta.icon;

        return (
          <Link
            key={category}
            href={`/browse?category=${encodeURIComponent(category)}`}
            className="group p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-blue-500/50 transition-all duration-300 flex flex-col items-center text-center space-y-3"
            style={{ borderTop: `4px solid ${meta.color}` }}
          >
            <div 
              className="p-3 rounded-xl bg-zinc-800 group-hover:scale-110 transition-transform duration-300"
              style={{ color: meta.color }}
            >
              <Icon size={28} />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base text-zinc-100">{category}</h3>
              <p className="text-xs text-zinc-500">{_count.bikol} words</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
