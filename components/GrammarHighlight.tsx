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
        if (lower === 'si') return (
          <strong
            key={index}
            className="font-black cursor-help rounded px-0.5 transition-colors hover:bg-[var(--editorial-accent-glow)]"
            style={{ color: "var(--editorial-accent)" }}
            title="Actor Marker (Si)"
          >
            {part}
          </strong>
        );
        if (lower === 'ni') return (
          <strong
            key={index}
            className="font-black cursor-help rounded px-0.5 transition-colors hover:bg-[rgba(194,106,62,0.12)]"
            style={{ color: "var(--editorial-rust)" }}
            title="Object/Possessive Marker (Ni)"
          >
            {part}
          </strong>
        );
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};
