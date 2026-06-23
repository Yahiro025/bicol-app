'use client';

import React from 'react';

interface GrammarHighlightProps {
  text: string;
}

export const GrammarHighlight: React.FC<GrammarHighlightProps> = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/(\b(?:si|ni|Si|Ni)\b)/g);

  return (
    <span>
      {parts.map((part, index) => {
        const lower = part.toLowerCase();
        if (lower === 'si') return <strong key={index} className="text-blue-500 font-black cursor-help hover:bg-blue-500/10 rounded px-0.5 transition-colors" title="Actor Marker (Si)">{part}</strong>;
        if (lower === 'ni') return <strong key={index} className="text-orange-500 font-black cursor-help hover:bg-orange-500/10 rounded px-0.5 transition-colors" title="Object/Possessive Marker (Ni)">{part}</strong>;
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};
