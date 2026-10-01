import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const C = {
  bg: '#0B0A09',
  surface: '#171512',
  raised: '#211E19',
  ink: '#F5F1E8',
  inkDim: '#CDC6B8',
  muted: '#8C8579',
  purple: '#A986C6',
  purpleDark: '#5D4473',
  rust: '#B76F47',
  gold: '#E8C47A',
  paper: '#F5F0E7',
  paperInk: '#171512',
  paperMuted: '#6C655B',
  line: '#34302A',
};

const serif = "Georgia, 'Times New Roman', serif";
const sans = "Inter, Arial, Helvetica, sans-serif";
const mayon = 'https://raw.githubusercontent.com/Yahiro025/bicol-app/main/public/images/mayon-hero.png';
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.76, 0, 0.24, 1);

const fade = (frame: number, a: number, b: number, c: number, d: number) =>
  interpolate(frame, [a, b, c, d], [0, 1, 1, 0], {...clamp, easing: [ease, Easing.linear, ease]});

const Noise: React.FC<{opacity?: number}> = ({opacity = 0.035}) => (
  <AbsoluteFill
    style={{
      opacity,
      pointerEvents: 'none',
      mixBlendMode: 'soft-light',
      backgroundImage:
        'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 220 220\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'.55\'/%3E%3C/svg%3E")',
    }}
  />
);

const Eyebrow: React.FC<{children: React.ReactNode; dark?: boolean}> = ({children, dark}) => (
  <div
    style={{
      fontFamily: sans,
      fontSize: 18,
      fontWeight: 800,
      letterSpacing: '0.24em',
      textTransform: 'uppercase',
      color: dark ? C.paperMuted : C.gold,
    }}
  >
    {children}
  </div>
);

const BigWord: React.FC<{
  children: React.ReactNode;
  color?: string;
  size?: number;
  italic?: boolean;
  style?: React.CSSProperties;
}> = ({children, color = C.ink, size = 220, italic, style}) => (
  <div
    style={{
      fontFamily: serif,
      fontSize: size,
      lineHeight: 0.82,
      letterSpacing: '-0.065em',
      color,
      fontStyle: italic ? 'italic' : 'normal',
      ...style,
    }}
  >
    {children}
  </div>
);

const Scene01Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame, fps, config: {damping: 120, stiffness: 105, mass: 0.9}});
  const q = interpolate(frame, [34, 58], [0, 1], {...clamp, easing: ease});
  const rebuttal = interpolate(frame, [66, 88], [0, 1], {...clamp, easing: ease});
  const exit = interpolate(frame, [88, 110], [1, 0], {...clamp, easing: easeInOut});
  const zoom = interpolate(frame, [80, 110], [1, 6.2], {...clamp, easing: easeInOut});

  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden', opacity: exit}}>
      <div
        style={{
          position: 'absolute',
          width: 960,
          height: 960,
          borderRadius: '50%',
          right: -140,
          top: -290,
          background: 'radial-gradient(circle, rgba(169,134,198,.24), rgba(169,134,198,0) 68%)',
        }}
      />

      <div style={{position: 'absolute', left: 78, top: 66}}>
        <Eyebrow>An Diksiyonaryo kan Bikol</Eyebrow>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 160,
          transformOrigin: '49% 52%',
          scale: zoom,
        }}
      >
        <BigWord
          size={305}
          color={C.ink}
          style={{
            opacity: pop,
            translate: `${interpolate(pop, [0, 1], [-130, 0])}px 0`,
          }}
        >
          magayon
        </BigWord>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 88,
          top: 530,
          display: 'flex',
          alignItems: 'baseline',
          gap: 30,
          opacity: q,
          translate: `0 ${interpolate(q, [0, 1], [35, 0])}px`,
        }}
      >
        <div style={{fontFamily: serif, fontSize: 92, color: C.purple, letterSpacing: '-0.04em'}}>beautiful</div>
        <div style={{fontFamily: serif, fontSize: 92, color: C.muted}}>?</div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 90,
          bottom: 76,
          width: 1480,
          opacity: rebuttal,
          translate: `0 ${interpolate(rebuttal, [0, 1], [30, 0])}px`,
        }}
      >
        <div style={{fontFamily: serif, fontSize: 66, lineHeight: 1, color: C.inkDim, letterSpacing: '-0.03em'}}>
          A translation gives you a word.
          <span style={{color: C.gold}}> A language gives you context.</span>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 72,
          bottom: 78,
          fontFamily: sans,
          fontSize: 18,
          color: C.muted,
          letterSpacing: '.14em',
          textTransform: 'uppercase',
        }}
      >
        Search → context → fluency
      </div>
      <Noise opacity={0.05} />
    </AbsoluteFill>
  );
};

const ContextChip: React.FC<{label: string; value: string; delay: number; x: number; y: number; rotate?: number}> = ({
  label,
  value,
  delay,
  x,
  y,
  rotate = 0,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 120, stiffness: 135}});
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 330,
        padding: '24px 26px 26px',
        borderRadius: 24,
        background: 'rgba(33,30,25,.95)',
        border: `1px solid ${C.line}`,
        boxShadow: '0 28px 70px rgba(0,0,0,.28)',
        opacity: p,
        scale: interpolate(p, [0, 1], [0.72, 1]),
        rotate: `${rotate + interpolate(p, [0, 1], [-8, 0])}deg`,
      }}
    >
      <div style={{fontFamily: sans, fontSize: 15, color: C.gold, letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 800}}>{label}</div>
      <div style={{fontFamily: serif, fontSize: 42, lineHeight: 1, color: C.ink, marginTop: 13}}>{value}</div>
    </div>
  );
};

const Scene02Search: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inP = spring({frame, fps, config: {damping: 110, stiffness: 120}});
  const chars = Math.floor(interpolate(frame, [10, 40], [0, 7], clamp));
  const query = 'magayon'.slice(0, chars);
  const result = spring({frame: frame - 38, fps, config: {damping: 110, stiffness: 115}});
  const out = interpolate(frame, [118, 140], [1, 0], {...clamp, easing: easeInOut});
  const cardZoom = interpolate(frame, [116, 140], [1, 3.4], {...clamp, easing: easeInOut});

  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden', opacity: out}}>
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 56,
          right: 80,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Eyebrow>01 · Search the archive</Eyebrow>
        <div style={{fontFamily: sans, fontSize: 18, color: C.muted}}>Meaning is only the beginning.</div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 145,
          width: 1780,
          height: 150,
          borderRadius: 34,
          background: C.raised,
          border: `1px solid ${C.line}`,
          boxShadow: '0 30px 100px rgba(0,0,0,.34)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 48px',
          opacity: inP,
          translate: `0 ${interpolate(inP, [0, 1], [70, 0])}px`,
        }}
      >
        <div style={{fontFamily: sans, fontSize: 46, color: C.muted, marginRight: 26}}>⌕</div>
        <div style={{fontFamily: sans, fontSize: 52, fontWeight: 650, color: C.ink}}>{query}</div>
        <div style={{width: 3, height: 56, background: C.purple, marginLeft: 8, opacity: frame < 50 ? 1 : 0.15}} />
        <div style={{marginLeft: 'auto', fontFamily: sans, fontSize: 18, color: C.muted, letterSpacing: '.12em', textTransform: 'uppercase'}}>Bikol → English / Tagalog</div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 350,
          width: 920,
          transformOrigin: '50% 50%',
          scale: cardZoom,
          opacity: result,
        }}
      >
        <BigWord size={196} color={C.purple}>magayon</BigWord>
        <div style={{display: 'flex', gap: 22, alignItems: 'baseline', marginTop: 28}}>
          <div style={{fontFamily: serif, fontSize: 72, color: C.ink}}>beautiful</div>
          <div style={{fontFamily: sans, fontSize: 19, color: C.muted, letterSpacing: '.18em', textTransform: 'uppercase'}}>adjective</div>
        </div>
        <div style={{height: 1, background: C.line, width: 770, marginTop: 30}} />
      </div>

      <ContextChip label="Dialect" value="Central Bikol" delay={52} x={1120} y={370} rotate={-2} />
      <ContextChip label="Pronunciation" value="ma·ga·yon" delay={60} x={1450} y={485} rotate={3} />
      <ContextChip label="Example" value="Magayon an aga." delay={68} x={1090} y={665} rotate={2} />
      <ContextChip label="Source" value="Mintz / community" delay={76} x={1450} y={770} rotate={-3} />

      <div
        style={{
          position: 'absolute',
          left: 78,
          bottom: 66,
          fontFamily: serif,
          fontSize: 52,
          color: C.inkDim,
          opacity: interpolate(frame, [72, 92], [0, 1], {...clamp, easing: ease}),
        }}
      >
        Keep the word. Keep what surrounds it.
      </div>
      <Noise />
    </AbsoluteFill>
  );
};

const Scene03Dialect: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const intro = spring({frame, fps, config: {damping: 110, stiffness: 120}});
  const out = interpolate(frame, [118, 140], [1, 0], {...clamp, easing: easeInOut});
  const names = [
    ['CENTRAL', 140, 300, -7],
    ['RINCONADA', 930, 210, 5],
    ['ALBAY', 1220, 565, -4],
    ['CATANDUANES', 560, 740, 4],
    ['SORSOGON', 115, 650, 6],
  ] as const;

  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden', color: C.paperInk, opacity: out}}>
      <div style={{position: 'absolute', left: 70, top: 52}}>
        <Eyebrow dark>02 · One language, many voices</Eyebrow>
      </div>

      <div
        style={{
          position: 'absolute',
          left: -70,
          top: 110,
          width: 2060,
          textAlign: 'center',
          opacity: 0.07,
          scale: interpolate(frame, [0, 140], [0.93, 1.08], clamp),
        }}
      >
        <BigWord size={390} color={C.paperInk}>MAGAYON</BigWord>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 690,
          top: 315,
          width: 550,
          height: 550,
          borderRadius: '50%',
          background: C.paperInk,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          boxShadow: '0 40px 110px rgba(23,21,18,.2)',
          opacity: intro,
          scale: interpolate(intro, [0, 1], [0.72, 1]),
        }}
      >
        <div>
          <div style={{fontFamily: serif, fontSize: 84, letterSpacing: '-0.05em', color: C.paper}}>Bikol</div>
          <div style={{fontFamily: sans, fontSize: 17, letterSpacing: '.18em', textTransform: 'uppercase', color: C.gold, marginTop: 14}}>not one flattened voice</div>
        </div>
      </div>

      {names.map(([name, x, y, rot], i) => {
        const p = spring({frame: frame - 20 - i * 7, fps, config: {damping: 100, stiffness: 120}});
        return (
          <div
            key={name}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              padding: '24px 34px',
              borderRadius: 999,
              background: i % 2 === 0 ? C.purple : C.rust,
              color: 'white',
              fontFamily: sans,
              fontSize: 27,
              fontWeight: 850,
              letterSpacing: '.12em',
              opacity: p,
              scale: interpolate(p, [0, 1], [0.4, 1]),
              rotate: `${rot}deg`,
              boxShadow: '0 16px 40px rgba(23,21,18,.16)',
            }}
          >
            {name}
          </div>
        );
      })}

      <div
        style={{
          position: 'absolute',
          right: 85,
          bottom: 60,
          width: 660,
          fontFamily: serif,
          fontSize: 54,
          lineHeight: 0.98,
          letterSpacing: '-0.04em',
          textAlign: 'right',
          opacity: interpolate(frame, [70, 92], [0, 1], {...clamp, easing: ease}),
        }}
      >
        Preserve differences.
        <br />
        <span style={{color: C.purpleDark}}>Don’t erase them.</span>
      </div>
      <Noise opacity={0.025} />
    </AbsoluteFill>
  );
};

const WordStage: React.FC<{word: string; label: string; frame: number; start: number; x: number; accent?: boolean}> = ({
  word,
  label,
  frame,
  start,
  x,
  accent,
}) => {
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - start, fps, config: {damping: 100, stiffness: 120}});
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 360,
        opacity: p,
        translate: `${interpolate(p, [0, 1], [110, 0])}px 0`,
      }}
    >
      <div style={{fontFamily: serif, fontSize: 96, color: accent ? C.gold : C.ink, letterSpacing: '-0.05em'}}>{word}</div>
      <div style={{fontFamily: sans, fontSize: 16, color: C.muted, letterSpacing: '.2em', textTransform: 'uppercase', marginTop: 10}}>{label}</div>
    </div>
  );
};

const Scene04Transform: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [136, 158], [1, 0], {...clamp, easing: easeInOut});
  const stemGrow = interpolate(frame, [12, 100], [0, 1], {...clamp, easing: ease});

  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden', opacity: out}}>
      <div style={{position: 'absolute', left: 72, top: 58}}>
        <Eyebrow>03 · Watch words move</Eyebrow>
      </div>

      <div style={{position: 'absolute', left: 70, top: 135}}>
        <div style={{fontFamily: serif, fontSize: 82, color: C.inkDim, letterSpacing: '-0.04em'}}>Lookup is static.</div>
        <div style={{fontFamily: serif, fontSize: 112, color: C.ink, letterSpacing: '-0.05em', marginTop: -10}}>
          Language <span style={{color: C.purple}}>moves.</span>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 100,
          right: 100,
          top: 535,
          height: 2,
          background: C.line,
        }}
      >
        <div style={{height: 2, width: `${stemGrow * 100}%`, background: `linear-gradient(90deg, ${C.rust}, ${C.purple}, ${C.gold})`}} />
      </div>

      <WordStage word="bakal" label="root" frame={frame} start={8} x={90} accent />
      <WordStage word="magbakal" label="infinitive" frame={frame} start={30} x={475} />
      <WordStage word="nagbakal" label="completed" frame={frame} start={52} x={930} />
      <WordStage word="mabakal" label="contemplative" frame={frame} start={74} x={1390} />

      <div
        style={{
          position: 'absolute',
          left: 70,
          bottom: 72,
          right: 70,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'end',
        }}
      >
        <div style={{fontFamily: serif, fontSize: 52, color: C.inkDim, maxWidth: 730, lineHeight: 1}}>
          See how a verb changes,
          <br />
          not just what it translates to.
        </div>
        <div style={{fontFamily: sans, fontSize: 18, color: C.muted, letterSpacing: '.14em', textTransform: 'uppercase'}}>conjugation · focus · tense</div>
      </div>
      <Noise />
    </AbsoluteFill>
  );
};

const LearningPanel: React.FC<{
  label: string;
  title: string;
  copy: string;
  x: number;
  w: number;
  delay: number;
  rotate: number;
  accent: string;
}> = ({label, title, copy, x, w, delay, rotate, accent}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 105, stiffness: 125}});
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 250,
        width: w,
        height: 600,
        borderRadius: 36,
        background: C.paper,
        color: C.paperInk,
        padding: 44,
        boxShadow: '0 36px 90px rgba(0,0,0,.34)',
        opacity: p,
        scale: interpolate(p, [0, 1], [0.84, 1]),
        rotate: `${rotate + interpolate(p, [0, 1], [6, 0])}deg`,
      }}
    >
      <div style={{height: 10, width: 120, borderRadius: 999, background: accent}} />
      <div style={{fontFamily: sans, fontSize: 15, color: C.paperMuted, letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 800, marginTop: 30}}>{label}</div>
      <div style={{fontFamily: serif, fontSize: 76, lineHeight: 0.95, letterSpacing: '-0.05em', marginTop: 42}}>{title}</div>
      <div style={{fontFamily: sans, fontSize: 23, lineHeight: 1.45, color: C.paperMuted, marginTop: 32}}>{copy}</div>
      <div style={{position: 'absolute', left: 44, bottom: 42, fontFamily: serif, fontSize: 42, color: accent}}>magayon</div>
    </div>
  );
};

const Scene05Practice: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [145, 167], [1, 0], {...clamp, easing: easeInOut});
  const headline = interpolate(frame, [0, 24], [0, 1], {...clamp, easing: ease});

  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden', opacity: out}}>
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 54,
          right: 72,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'end',
        }}
      >
        <Eyebrow>04 · From recognition to recall</Eyebrow>
        <div style={{fontFamily: serif, fontSize: 66, color: C.ink, letterSpacing: '-0.04em', opacity: headline}}>
          Look it up → say it → use it.
        </div>
      </div>

      <LearningPanel
        label="Flashcards"
        title="Remember it."
        copy="High-frequency vocabulary becomes something you can retrieve, not merely recognize."
        x={45}
        w={600}
        delay={10}
        rotate={-3}
        accent={C.purpleDark}
      />
      <LearningPanel
        label="Grammar drills"
        title="Transform it."
        copy="Substitute words and change verbs so grammar becomes a motion you can perform."
        x={660}
        w={600}
        delay={25}
        rotate={2}
        accent={C.rust}
      />
      <LearningPanel
        label="Dialogue"
        title="Use it."
        copy="Short scenarios turn isolated vocabulary into an actual exchange with context."
        x={1275}
        w={600}
        delay={40}
        rotate={-2}
        accent={C.gold}
      />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: -16,
          textAlign: 'center',
          fontFamily: serif,
          fontSize: 150,
          color: 'rgba(245,241,232,.055)',
          letterSpacing: '-0.06em',
        }}
      >
        SEARCH · STUDY · SPEAK · REPEAT
      </div>
      <Noise />
    </AbsoluteFill>
  );
};

const Scene06Community: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const form = spring({frame: frame - 18, fps, config: {damping: 105, stiffness: 115}});
  const stamp = spring({frame: frame - 70, fps, config: {damping: 70, stiffness: 160, mass: 0.8}});
  const out = interpolate(frame, [108, 130], [1, 0], {...clamp, easing: easeInOut});

  return (
    <AbsoluteFill style={{background: C.paper, color: C.paperInk, overflow: 'hidden', opacity: out}}>
      <div style={{position: 'absolute', left: 70, top: 54}}>
        <Eyebrow dark>05 · Keep it alive together</Eyebrow>
      </div>

      <div style={{position: 'absolute', left: 70, top: 150, width: 980}}>
        <div style={{fontFamily: serif, fontSize: 118, lineHeight: 0.88, letterSpacing: '-0.055em'}}>
          A dictionary is not
          <br />
          a <span style={{color: C.purpleDark}}>finished object.</span>
        </div>
        <div style={{fontFamily: sans, fontSize: 26, lineHeight: 1.45, color: C.paperMuted, width: 760, marginTop: 46}}>
          Speakers can suggest words, corrections, definitions, dialect labels, and sources. The archive can improve without pretending every entry is final.
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 80,
          top: 150,
          width: 670,
          height: 700,
          background: '#171512',
          borderRadius: 42,
          padding: 46,
          boxShadow: '0 42px 100px rgba(23,21,18,.24)',
          color: C.ink,
          opacity: form,
          translate: `${interpolate(form, [0, 1], [110, 0])}px 0`,
          rotate: `${interpolate(form, [0, 1], [4, -1.5])}deg`,
        }}
      >
        <div style={{fontFamily: sans, fontSize: 16, color: C.gold, letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 800}}>Community contribution</div>
        <div style={{fontFamily: serif, fontSize: 62, lineHeight: 1, marginTop: 22}}>Add what the archive is missing.</div>
        {['Word', 'Dialect', 'Definition / correction', 'Source'].map((label, i) => (
          <div key={label} style={{marginTop: i === 0 ? 42 : 20}}>
            <div style={{fontFamily: sans, fontSize: 14, color: C.muted, letterSpacing: '.12em', textTransform: 'uppercase'}}>{label}</div>
            <div style={{height: 50, borderBottom: `1px solid ${C.line}`, fontFamily: serif, fontSize: 25, paddingTop: 10, color: i === 0 ? C.purple : C.inkDim}}>{i === 0 ? 'magayon' : ''}</div>
          </div>
        ))}
        <div style={{position: 'absolute', left: 46, right: 46, bottom: 42, height: 70, borderRadius: 18, background: C.gold, color: C.paperInk, fontFamily: sans, fontSize: 18, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Submit with a source →</div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 620,
          bottom: 105,
          padding: '18px 28px',
          border: `4px solid ${C.rust}`,
          color: C.rust,
          fontFamily: sans,
          fontSize: 28,
          fontWeight: 950,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          rotate: '-8deg',
          opacity: stamp,
          scale: interpolate(stamp, [0, 1], [1.8, 1]),
        }}
      >
        sourced · reviewable · alive
      </div>
      <Noise opacity={0.02} />
    </AbsoluteFill>
  );
};

const Scene07Final: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 120, stiffness: 90, mass: 1.1}});
  const copy = interpolate(frame, [34, 58], [0, 1], {...clamp, easing: ease});
  const line = interpolate(frame, [54, 82], [0, 1], {...clamp, easing: ease});

  return (
    <AbsoluteFill style={{background: '#05070d', overflow: 'hidden'}}>
      <Img
        src={mayon}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: '50% 34%',
          scale: interpolate(frame, [0, 160], [1.08, 1.02], clamp),
        }}
      />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(5,7,13,.94) 0%, rgba(5,7,13,.72) 48%, rgba(5,7,13,.34) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(5,7,13,.92), transparent 50%, rgba(5,7,13,.28))'}} />

      <div style={{position: 'absolute', left: 78, top: 70}}>
        <Eyebrow>The Bikol language archive</Eyebrow>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 180,
          opacity: p,
          translate: `${interpolate(p, [0, 1], [-80, 0])}px 0`,
        }}
      >
        <BigWord size={220}>Bikol</BigWord>
        <BigWord size={220} italic color={C.gold} style={{marginTop: 6}}>Dictionary</BigWord>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 82,
          bottom: 185,
          fontFamily: serif,
          fontSize: 64,
          lineHeight: 1,
          color: C.ink,
          opacity: copy,
        }}
      >
        Search it. Learn it.
        <br />
        <span style={{color: C.purple}}>Keep it alive.</span>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 82,
          right: 82,
          bottom: 82,
          height: 1,
          background: `linear-gradient(90deg, ${C.gold} ${line * 100}%, rgba(245,241,232,.15) ${line * 100}%)`,
        }}
      />
      <div style={{position: 'absolute', left: 82, bottom: 38, fontFamily: sans, fontSize: 18, color: C.inkDim, letterSpacing: '.12em'}}>bikoldictionary.app</div>
      <div style={{position: 'absolute', right: 82, bottom: 38, fontFamily: sans, fontSize: 18, color: C.gold, letterSpacing: '.12em', textTransform: 'uppercase'}}>Free · open access · community-grown</div>
      <Noise opacity={0.055} />
    </AbsoluteFill>
  );
};

const PurpleBridge: React.FC<{from: number; duration: number; direction?: 'left' | 'right'}> = ({from, duration, direction = 'left'}) => (
  <Sequence from={from} durationInFrames={duration}>
    <Bridge direction={direction} />
  </Sequence>
);

const Bridge: React.FC<{direction: 'left' | 'right'}> = ({direction}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {...clamp, easing: easeInOut});
  const x = direction === 'left' ? interpolate(p, [0, 1], [-120, 120]) : interpolate(p, [0, 1], [120, -120]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: -120,
          bottom: -120,
          left: `${x}%`,
          width: '68%',
          background: C.purple,
          rotate: '8deg',
          boxShadow: '0 0 120px rgba(169,134,198,.3)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -120,
          bottom: -120,
          left: `${x - 18}%`,
          width: '12%',
          background: C.gold,
          rotate: '8deg',
          opacity: 0.7,
        }}
      />
    </AbsoluteFill>
  );
};

export const BikolArchive30: React.FC = () => {
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Sequence from={0} durationInFrames={110}><Scene01Hook /></Sequence>
      <Sequence from={92} durationInFrames={140}><Scene02Search /></Sequence>
      <Sequence from={214} durationInFrames={140}><Scene03Dialect /></Sequence>
      <Sequence from={336} durationInFrames={158}><Scene04Transform /></Sequence>
      <Sequence from={476} durationInFrames={167}><Scene05Practice /></Sequence>
      <Sequence from={625} durationInFrames={130}><Scene06Community /></Sequence>
      <Sequence from={737} durationInFrames={163}><Scene07Final /></Sequence>

      <PurpleBridge from={100} duration={20} direction="left" />
      <PurpleBridge from={224} duration={18} direction="right" />
      <PurpleBridge from={346} duration={18} direction="left" />
      <PurpleBridge from={486} duration={18} direction="right" />
      <PurpleBridge from={635} duration={18} direction="left" />
      <PurpleBridge from={745} duration={18} direction="right" />
    </AbsoluteFill>
  );
};
