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
  ink: '#F5F2EC',
  inkDim: '#D4CFC3',
  muted: '#8A8780',
  bg: '#0E0D0B',
  surface: '#161513',
  raised: '#1E1C18',
  border: '#353228',
  purple: '#A580C0',
  purpleDim: '#8A68A8',
  rust: '#C07A50',
  gold: '#E9C988',
  paper: '#FAFAF8',
};

const serif = "Georgia, 'Times New Roman', serif";
const sans = "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const mayon = 'https://raw.githubusercontent.com/Yahiro025/bicol-app/main/public/images/mayon-hero.png';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

const Noise: React.FC<{opacity?: number}> = ({opacity = 0.045}) => (
  <AbsoluteFill
    style={{
      opacity,
      backgroundImage:
        'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 180 180\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'.8\'/%3E%3C/svg%3E")',
      mixBlendMode: 'soft-light',
      pointerEvents: 'none',
    }}
  />
);

const Kicker: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      fontFamily: sans,
      fontSize: 22,
      textTransform: 'uppercase',
      letterSpacing: '0.22em',
      color: C.gold,
      fontWeight: 700,
    }}
  >
    {children}
  </div>
);

const Scene01: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const reveal = spring({frame, fps, config: {damping: 120, stiffness: 95, mass: 1.1}});
  const exit = interpolate(frame, [100, 134], [1, 0], {...clamp, easing: easeOut});

  return (
    <AbsoluteFill style={{backgroundColor: '#05070d', overflow: 'hidden', opacity: exit}}>
      <Img
        src={mayon}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: '50% 36%',
          scale: interpolate(frame, [0, 134], [1.04, 1.11], clamp),
          opacity: 0.86,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50% 36%, rgba(5,7,13,.18) 0%, rgba(5,7,13,.66) 56%, rgba(5,7,13,.98) 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          background: 'linear-gradient(180deg, rgba(5,7,13,.15) 0%, rgba(5,7,13,.34) 55%, #0E0D0B 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          paddingTop: 60,
        }}
      >
        <div
          style={{
            opacity: reveal,
            translate: `0 ${interpolate(reveal, [0, 1], [40, 0])}px`,
            fontFamily: sans,
            fontSize: 23,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: C.gold,
            fontWeight: 700,
            marginBottom: 22,
          }}
        >
          An Diksiyonaryo kan Bikol
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 112,
            lineHeight: 0.98,
            letterSpacing: '-0.045em',
            color: 'white',
            maxWidth: 1420,
            opacity: reveal,
            scale: interpolate(reveal, [0, 1], [0.94, 1]),
          }}
        >
          A language is more
          <br />
          than its words.
        </div>
        <div
          style={{
            width: interpolate(frame, [28, 74], [0, 390], {...clamp, easing: easeOut}),
            height: 1,
            background: 'rgba(233,201,136,.65)',
            marginTop: 36,
          }}
        />
      </div>
      <Noise opacity={0.065} />
    </AbsoluteFill>
  );
};

const SearchShell: React.FC<{query: string; progress: number}> = ({query, progress}) => (
  <div
    style={{
      width: 1130,
      borderRadius: 34,
      background: 'rgba(22,21,19,.92)',
      border: `1px solid ${C.border}`,
      boxShadow: '0 28px 90px rgba(0,0,0,.42)',
      padding: 18,
    }}
  >
    <div
      style={{
        height: 112,
        borderRadius: 24,
        background: C.raised,
        border: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 36px',
        gap: 22,
      }}
    >
      <div style={{fontFamily: sans, fontSize: 36, color: C.muted}}>⌕</div>
      <div style={{fontFamily: sans, fontSize: 36, color: C.ink, fontWeight: 600}}>{query}</div>
      <div
        style={{
          width: 3,
          height: 44,
          background: C.purple,
          opacity: progress > 0.12 && progress < 0.86 ? 1 : 0,
        }}
      />
      <div style={{marginLeft: 'auto', color: C.muted, fontFamily: sans, fontSize: 20}}>Search Bikol</div>
    </div>
  </div>
);

const Scene02: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = interpolate(frame, [0, 150], [0, 1], clamp);
  const shell = spring({frame, fps, config: {damping: 130, stiffness: 100}});
  const chars = Math.floor(interpolate(frame, [18, 52], [0, 7], clamp));
  const query = 'magayon'.slice(0, chars);
  const cardIn = spring({frame: frame - 60, fps, config: {damping: 100, stiffness: 120}});

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(165,128,192,.16) 0%, rgba(165,128,192,0) 68%)',
          right: -180,
          top: -240,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 120,
          top: 100,
          opacity: interpolate(frame, [0, 26], [0, 1], {...clamp, easing: easeOut}),
        }}
      >
        <Kicker>01 · Search the archive</Kicker>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 120,
          right: 120,
          top: 220,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 100,
        }}
      >
        <div
          style={{
            opacity: shell,
            translate: `${interpolate(shell, [0, 1], [-80, 0])}px 0`,
          }}
        >
          <SearchShell query={query} progress={p} />
        </div>
        <div
          style={{
            width: 500,
            opacity: cardIn,
            translate: `${interpolate(cardIn, [0, 1], [90, 0])}px 0`,
          }}
        >
          <div style={{fontFamily: serif, fontSize: 86, color: C.purple, letterSpacing: '-0.04em'}}>magayon</div>
          <div style={{height: 1, background: C.border, margin: '24px 0 26px'}} />
          <div style={{fontFamily: sans, fontSize: 27, color: C.muted, textTransform: 'uppercase', letterSpacing: '.16em'}}>adjective</div>
          <div style={{fontFamily: serif, fontSize: 48, color: C.ink, marginTop: 16}}>beautiful</div>
          <div style={{fontFamily: sans, fontSize: 23, lineHeight: 1.55, color: C.inkDim, marginTop: 26}}>
            Definitions, translations, dialect information, pronunciation, examples, and sources—when available.
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 120,
          bottom: 96,
          fontFamily: serif,
          fontSize: 62,
          color: C.ink,
          opacity: interpolate(frame, [86, 116], [0, 1], {...clamp, easing: easeOut}),
          translate: `0 ${interpolate(frame, [86, 116], [24, 0], clamp)}px`,
        }}
      >
        Meaning, context, source.
      </div>
      <Noise />
    </AbsoluteFill>
  );
};

const DialectPill: React.FC<{name: string; x: number; y: number; delay: number}> = ({name, x, y, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame: frame - delay, fps, config: {damping: 90, stiffness: 120}});
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity: a,
        scale: interpolate(a, [0, 1], [0.7, 1]),
        padding: '18px 28px',
        borderRadius: 999,
        border: `1px solid ${C.border}`,
        background: C.raised,
        color: C.inkDim,
        fontFamily: sans,
        fontSize: 22,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
      }}
    >
      {name}
    </div>
  );
};

const Scene03: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = interpolate(frame, [0, 26], [0, 1], {...clamp, easing: easeOut});

  return (
    <AbsoluteFill style={{background: C.paper, color: '#1C1B19', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 120, top: 100}}>
        <Kicker>02 · See the language in layers</Kicker>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 120,
          top: 210,
          fontFamily: serif,
          fontSize: 92,
          lineHeight: 1.02,
          letterSpacing: '-0.045em',
          width: 940,
          opacity: titleIn,
          translate: `0 ${interpolate(titleIn, [0, 1], [30, 0])}px`,
        }}
      >
        One word.
        <br />
        <span style={{color: '#7C5C92'}}>Many histories.</span>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 180,
          top: 236,
          width: 580,
          height: 580,
          borderRadius: '50%',
          border: '1px solid #D8D4C8',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 275,
          top: 332,
          width: 390,
          height: 390,
          borderRadius: '50%',
          border: '1px solid #D8D4C8',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 365,
          top: 424,
          width: 210,
          height: 210,
          borderRadius: '50%',
          background: '#1C1B19',
          color: C.paper,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          fontFamily: serif,
          fontSize: 38,
          lineHeight: 1.05,
          scale: interpolate(frame, [22, 58], [0.75, 1], {...clamp, easing: easeOut}),
        }}
      >
        Bikol
        <br />
        language
      </div>
      <DialectPill name="Central" x={1170} y={185} delay={34} />
      <DialectPill name="Rinconada" x={1450} y={315} delay={42} />
      <DialectPill name="Albay" x={1480} y={630} delay={50} />
      <DialectPill name="Catanduanes" x={1130} y={745} delay={58} />
      <DialectPill name="Sorsogon" x={940} y={515} delay={66} />
      <div
        style={{
          position: 'absolute',
          left: 120,
          bottom: 105,
          width: 790,
          fontFamily: sans,
          fontSize: 28,
          lineHeight: 1.55,
          color: '#6B6760',
          opacity: interpolate(frame, [68, 96], [0, 1], {...clamp, easing: easeOut}),
        }}
      >
        Dialect labels, etymology, pronunciation and source references preserve the differences instead of flattening them.
      </div>
      <Noise opacity={0.035} />
    </AbsoluteFill>
  );
};

const MorphWord: React.FC<{label: string; sub: string; x: number; delay: number}> = ({label, sub, x, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 95, stiffness: 120}});
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 430,
        width: 330,
        textAlign: 'center',
        opacity: p,
        translate: `0 ${interpolate(p, [0, 1], [70, 0])}px`,
      }}
    >
      <div style={{fontFamily: serif, fontSize: 68, color: C.ink}}>{label}</div>
      <div style={{height: 1, background: C.border, margin: '20px 0 16px'}} />
      <div style={{fontFamily: sans, fontSize: 20, color: C.muted, textTransform: 'uppercase', letterSpacing: '.18em'}}>{sub}</div>
    </div>
  );
};

const Scene04: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 120, top: 100}}>
        <Kicker>03 · Learn how words move</Kicker>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 120,
          top: 205,
          fontFamily: serif,
          fontSize: 92,
          color: C.ink,
          letterSpacing: '-0.045em',
        }}
      >
        From lookup to fluency.
      </div>
      <div
        style={{
          position: 'absolute',
          left: 190,
          right: 190,
          top: 520,
          height: 1,
          background: C.border,
          scale: `${interpolate(frame, [10, 60], [0, 1], {...clamp, easing: easeOut})} 1`,
          transformOrigin: 'left center',
        }}
      />
      <MorphWord label="bakal" sub="root" x={170} delay={18} />
      <MorphWord label="magbakal" sub="infinitive" x={585} delay={36} />
      <MorphWord label="nagbakal" sub="completed" x={1000} delay={54} />
      <MorphWord label="mabakal" sub="contemplated" x={1415} delay={72} />
      <div
        style={{
          position: 'absolute',
          left: 120,
          bottom: 92,
          right: 120,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          opacity: interpolate(frame, [88, 118], [0, 1], {...clamp, easing: easeOut}),
        }}
      >
        <div style={{fontFamily: sans, fontSize: 27, color: C.inkDim}}>Verb transformations · substitution drills · short dialogue scenarios</div>
        <div style={{fontFamily: sans, fontSize: 20, color: C.gold, textTransform: 'uppercase', letterSpacing: '.16em'}}>Practice in context →</div>
      </div>
      <Noise />
    </AbsoluteFill>
  );
};

const StudyCard: React.FC<{title: string; body: string; rotate: number; x: number; y: number; delay: number}> = ({title, body, rotate, x, y, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 90, stiffness: 110, mass: 1}});
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 480,
        height: 270,
        borderRadius: 26,
        background: '#FFFDF9',
        border: '1px solid #D8D4C8',
        boxShadow: '0 24px 70px rgba(28,27,25,.12)',
        padding: 34,
        rotate: `${interpolate(p, [0, 1], [rotate * 2.2, rotate])}deg`,
        scale: interpolate(p, [0, 1], [0.72, 1]),
        opacity: p,
      }}
    >
      <div style={{fontFamily: sans, fontSize: 18, textTransform: 'uppercase', letterSpacing: '.18em', color: '#7C5C92', fontWeight: 800}}>{title}</div>
      <div style={{fontFamily: serif, fontSize: 46, lineHeight: 1.1, color: '#1C1B19', marginTop: 28}}>{body}</div>
    </div>
  );
};

const Scene05: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 120, top: 95}}>
        <Kicker>04 · Study actively</Kicker>
      </div>
      <div style={{position: 'absolute', left: 120, top: 195, fontFamily: serif, fontSize: 96, letterSpacing: '-0.045em', color: '#1C1B19'}}>
        Don’t just remember it.
        <br />
        <span style={{color: '#7C5C92'}}>Use it.</span>
      </div>
      <StudyCard title="Flashcards" body="magayon → beautiful" rotate={-4} x={980} y={150} delay={12} />
      <StudyCard title="Dialogue" body="Practice a real exchange." rotate={3} x={1245} y={425} delay={30} />
      <StudyCard title="Grammar drill" body="Transform the sentence." rotate={-2} x={885} y={650} delay={48} />
      <div
        style={{
          position: 'absolute',
          left: 120,
          bottom: 105,
          width: 650,
          fontFamily: sans,
          fontSize: 28,
          lineHeight: 1.55,
          color: '#6B6760',
          opacity: interpolate(frame, [65, 95], [0, 1], {...clamp, easing: easeOut}),
        }}
      >
        Vocabulary decks, grammar drills, verb transformations and dialogue turn the archive into a place to practice.
      </div>
      <Noise opacity={0.035} />
    </AbsoluteFill>
  );
};

const Scene06: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const card = spring({frame: frame - 18, fps, config: {damping: 105, stiffness: 110}});
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 120, top: 100}}>
        <Kicker>05 · Keep it alive together</Kicker>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 120,
          top: 210,
          fontFamily: serif,
          fontSize: 90,
          lineHeight: 1.02,
          letterSpacing: '-0.045em',
          color: C.ink,
          maxWidth: 900,
        }}
      >
        A dictionary can be
        <br />
        <span style={{color: C.purple}}>a living archive.</span>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 140,
          top: 170,
          width: 710,
          borderRadius: 32,
          padding: 38,
          background: C.raised,
          border: `1px solid ${C.border}`,
          boxShadow: '0 30px 90px rgba(0,0,0,.35)',
          opacity: card,
          translate: `${interpolate(card, [0, 1], [85, 0])}px 0`,
        }}
      >
        <div style={{fontFamily: sans, color: C.gold, fontSize: 19, textTransform: 'uppercase', letterSpacing: '.18em', fontWeight: 800}}>Community contribution</div>
        <div style={{fontFamily: serif, color: C.ink, fontSize: 50, marginTop: 24}}>Suggest a word, correction, definition, or source.</div>
        <div style={{display: 'flex', gap: 14, marginTop: 34, flexWrap: 'wrap'}}>
          {['New word', 'Correction', 'Definition', 'Source'].map((x, i) => (
            <div key={x} style={{padding: '13px 18px', borderRadius: 999, border: `1px solid ${C.border}`, color: i === 0 ? C.bg : C.inkDim, background: i === 0 ? C.gold : C.surface, fontFamily: sans, fontSize: 18}}>{x}</div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 120,
          bottom: 120,
          fontFamily: sans,
          fontSize: 27,
          color: C.inkDim,
          width: 730,
          lineHeight: 1.55,
          opacity: interpolate(frame, [70, 103], [0, 1], {...clamp, easing: easeOut}),
        }}
      >
        Source labels stay attached to entries. Community input can correct what is missing, incomplete, or wrong.
      </div>
      <Noise />
    </AbsoluteFill>
  );
};

const Scene07: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = spring({frame, fps, config: {damping: 110, stiffness: 100}});
  return (
    <AbsoluteFill style={{background: '#08090d', overflow: 'hidden'}}>
      <Img
        src={mayon}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: '50% 40%',
          opacity: 0.42,
          scale: interpolate(frame, [0, 150], [1.09, 1.04], clamp),
        }}
      />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,9,13,.48), rgba(8,9,13,.93) 72%, #08090d 100%)'}} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          opacity: logo,
          scale: interpolate(logo, [0, 1], [0.93, 1]),
        }}
      >
        <div style={{fontFamily: sans, fontSize: 20, letterSpacing: '.28em', textTransform: 'uppercase', color: C.gold, fontWeight: 800}}>The Bikol Language Archive</div>
        <div style={{fontFamily: serif, fontSize: 116, lineHeight: .95, letterSpacing: '-.05em', color: 'white', marginTop: 28}}>
          Bikol <span style={{fontStyle: 'italic', fontWeight: 400, color: '#F4E3BE'}}>Dictionary</span>
        </div>
        <div style={{fontFamily: serif, fontSize: 46, color: C.inkDim, marginTop: 34}}>Search it. Study it. Add to it.</div>
        <div style={{width: 520, height: 1, background: 'rgba(233,201,136,.45)', marginTop: 38}} />
        <div style={{fontFamily: sans, fontSize: 22, color: C.inkDim, marginTop: 28, letterSpacing: '.08em'}}>bikoldictionary.app · Free & open access</div>
      </div>
      <Noise opacity={0.065} />
    </AbsoluteFill>
  );
};

export const BikolArchive30: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Sequence from={0} durationInFrames={135}>
        <Scene01 />
      </Sequence>
      <Sequence from={120} durationInFrames={165}>
        <Scene02 />
      </Sequence>
      <Sequence from={270} durationInFrames={150}>
        <Scene03 />
      </Sequence>
      <Sequence from={405} durationInFrames={150}>
        <Scene04 />
      </Sequence>
      <Sequence from={540} durationInFrames={150}>
        <Scene05 />
      </Sequence>
      <Sequence from={675} durationInFrames={135}>
        <Scene06 />
      </Sequence>
      <Sequence from={795} durationInFrames={105}>
        <Scene07 />
      </Sequence>
    </AbsoluteFill>
  );
};
