'use client';

import React from 'react';

interface GrammarHighlightProps {
  text: string;
}

/**
 * GrammarHighlight Component
 * 
 * Highlights Bikol grammar markers:
 * - 'si' class markers in Blue-500 (Bold)
 * - 'ni' class markers in Orange-500 (Bold)
 * 
 * Follows the "Living Archive" design system's emphasis on clarity and academic precision.
 */
export const GrammarHighlight: React.FC<GrammarHighlightProps> = ({ text }) => {
  if (!text) return null;

  // Split by whitespace but keep the delimiters if they are markers
  // We look for "si" or "ni" as whole words (case-insensitive)
  const parts = text.split(/(\b(?:si|ni|Si|Ni)\b)/g);

  return (
    <span>
      {parts.map((part, index) => {
        const lowerPart = part.toLowerCase();
        if (lowerPart === 'si') {
          return (
            <strong key={index} className="text-blue-500 font-bold">
              {part}
            </strong>
          );
        }
        if (lowerPart === 'ni') {
          return (
            <strong key={index} className="text-orange-500 font-bold">
              {part}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};
