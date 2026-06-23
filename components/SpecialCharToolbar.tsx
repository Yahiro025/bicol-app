"use client";

const CHAR_SECTIONS = [
  {
    label: "Diacritics",
    chars: [
      { char: "´", label: "Acute", description: "Stress mark (pahilíg)" },
      { char: "`", label: "Grave", description: "Glottal stop + stress (paiwà)" },
      { char: "ˆ", label: "Circumflex", description: "Glottal stop + stress (pakupyâ)" },
      { char: "¨", label: "Diaeresis", description: "Hiatus marker" },
    ],
  },
  {
    label: "Special Characters",
    chars: [
      { char: "ʔ", label: "Glottal stop", description: "Glottal stop (ʔ)" },
      { char: "ŋ", label: "Eng", description: "Velar nasal (ng)" },
    ],
  },
] as const;

const BTN_CLASS = "w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-90 text-sm font-bold";

export default function SpecialCharToolbar({ onInsert }: { onInsert: (char: string) => void }) {
  return (
    <div className="space-y-2">
      {CHAR_SECTIONS.map(({ label, chars }, si) => (
        <div key={label} className={si > 0 ? "mt-3" : ""}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</p>
          <div className="flex gap-1.5 flex-wrap">
            {chars.map(({ char, label: cl, description }) => (
              <button key={char} type="button" onClick={() => onInsert(char)} title={`${cl}: ${description}`} className={BTN_CLASS}>
                {char}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
