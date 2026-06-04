"use client";

type SpecialCharToolbarProps = {
  onInsert: (char: string) => void;
};

const DIALECT_MARKS = [
  { char: "´", label: "Acute", description: "Stress mark (pahilíg)" },
  { char: "`", label: "Grave", description: "Glottal stop + stress (paiwà)" },
  { char: "ˆ", label: "Circumflex", description: "Glottal stop + stress (pakupyâ)" },
  { char: "¨", label: "Diaeresis", description: "Hiatus marker" },
] as const;

const SPECIAL_CHARS = [
  { char: "ʔ", label: "Glottal stop", description: "Glottal stop (ʔ)" },
  { char: "ŋ", label: "Eng", description: "Velar nasal (ng)" },
] as const;

export default function SpecialCharToolbar({
  onInsert,
}: SpecialCharToolbarProps) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
        Diacritics
      </p>
      <div className="flex gap-1.5 flex-wrap">
        {DIALECT_MARKS.map(({ char, label, description }) => (
          <button
            key={char}
            type="button"
            onClick={() => onInsert(char)}
            title={`${label}: ${description}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-90 text-sm font-bold"
          >
            {char}
          </button>
        ))}
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-3">
        Special Characters
      </p>
      <div className="flex gap-1.5 flex-wrap">
        {SPECIAL_CHARS.map(({ char, label, description }) => (
          <button
            key={char}
            type="button"
            onClick={() => onInsert(char)}
            title={`${label}: ${description}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-90 text-sm font-bold"
          >
            {char}
          </button>
        ))}
      </div>
    </div>
  );
}
