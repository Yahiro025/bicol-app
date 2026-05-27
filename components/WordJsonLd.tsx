"use client";

import Script from "next/script";

interface WordJsonLdProps {
  bikol: string;
  english: string;
  tagalog?: string | null;
  pos?: string | null;
  pronunciation?: string | null;
  definitions?: Array<{
    english: string | null;
    tagalog?: string | null;
    dialect?: string | null;
    exampleSentences?: Array<{ bikol: string | null; english: string | null }>;
  }>;
}

export default function WordJsonLd({ bikol, english, tagalog, pos, pronunciation, definitions }: WordJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: bikol,
    description: english,
    ...(tagalog && { alternateName: tagalog }),
    ...(pronunciation && { 
      termCode: pronunciation.replace(/\//g, "") 
    }),
    ...(pos && {
      inDefinedTermSet: {
        "@type": "DefinedTermSet",
        name: "BIKOL Dictionary",
        url: process.env.NEXT_PUBLIC_SITE_URL || "https://bikoldictionary.app",
      },
      additionalType: pos,
    }),
    ...(definitions && definitions.length > 0 && {
      hasDefinedTerm: definitions.slice(0, 3).map((def, i) => ({
        "@type": "DefinedTerm",
        name: `${bikol} (definition ${i + 1})`,
        description: def.english,
        ...(def.tagalog && { alternateName: def.tagalog }),
        ...(def.dialect && { 
          inDefinedTermSet: {
            "@type": "DefinedTermSet",
            name: `BIKOL Dictionary — ${def.dialect} dialect`,
          }
        }),
      })),
    }),
  };

  return (
    <Script
      id={`jsonld-${bikol}`}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
