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

export default function SpecialCharToolbar({ onInsert }: { onInsert: (char: string) => void }) {
  return (
    <div className="space-y-3">
      {CHAR_SECTIONS.map(({ label, chars }, si) => (
        <div key={label} className={si > 0 ? "mt-3" : ""}>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
            style={{ color: "var(--editorial-muted)" }}
          >
            {label}
          </p>
          <div className="flex gap-2 flex-wrap">
            {chars.map(({ char, label: cl, description }) => (
              <button
                key={char}
                type="button"
                onClick={() => onInsert(char)}
                title={`${cl}: ${description}`}
                style={{
                  backgroundColor: "var(--editorial-surface)",
                  borderColor: "var(--editorial-border)",
                  color: "var(--editorial-text)",
                }}
                className="min-w-11 min-h-11 px-2.5 py-1.5 flex flex-col items-center justify-center gap-0.5 rounded-xl border text-center transition-all duration-150 cursor-pointer active:scale-95 hover:border-[var(--editorial-accent)] hover:text-[var(--editorial-accent)] hover:bg-[var(--editorial-surface-raised)]"
              >
                <span className="text-base font-bold leading-none">{char}</span>
                <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80 leading-none">
                  {cl}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
