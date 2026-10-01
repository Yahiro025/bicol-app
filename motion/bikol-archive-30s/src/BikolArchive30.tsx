import React from 'react';
import {Audio} from '@remotion/media';
import {loadFont as loadDMSans} from '@remotion/google-fonts/DMSans';
import {loadFont as loadPlayfairDisplay} from '@remotion/google-fonts/PlayfairDisplay';
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const {fontFamily: sans} = loadDMSans('normal', {
  weights: ['400', '500', '600', '700'],
  subsets: ['latin'],
});
const {fontFamily: serif} = loadPlayfairDisplay('normal', {
  weights: ['400', '600', '700', '900'],
  subsets: ['latin'],
});
loadPlayfairDisplay('italic', {
  weights: ['400', '600'],
  subsets: ['latin'],
});

const C = {
  bg: '#0E0D0B',
  bg2: '#161513',
  raised: '#201E1A',
  ink: '#F6F2EA',
  inkDim: '#D8D2C7',
  muted: '#8E897F',
  paper: '#FAF8F3',
  paper2: '#F0ECE3',
  paperInk: '#1C1B19',
  paperMuted: '#6B6760',
  border: '#373328',
  purple: '#A580C0',
  purpleDark: '#6F4C89',
  purpleLight: '#D7B8EB',
  rust: '#C07A50',
  gold: '#E9C988',
};

const mayon = 'https://raw.githubusercontent.com/Yahiro025/bicol-app/main/public/images/mayon-hero.png';
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

const reveal = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {...clamp, easing: ease});

const Noise: React.FC<{opacity?: number; dark?: boolean}> = ({opacity = 0.04, dark = true}) => (
  <AbsoluteFill
    style={{
      opacity,
      mixBlendMode: dark ? 'screen' : 'multiply',
      backgroundImage:
        'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 180 180\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.82\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'.75\'/%3E%3C/svg%3E")',
      pointerEvents: 'none',
    }}
  />
);

const Hairline: React.FC<{color?: string; opacity?: number}> = ({color = C.border, opacity = 1}) => (
  <div style={{height: 1, width: '100%', background: color, opacity}} />
);

const Pill: React.FC<{
  children: React.ReactNode;
  light?: boolean;
  accent?: boolean;
  style?: React.CSSProperties;
}> = ({children, light = false, accent = false, style}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      minHeight: 38,
      padding: '0 16px',
      borderRadius: 999,
      border: `1px solid ${accent ? C.purple : light ? '#D5D0C7' : C.border}`,
      background: accent ? 'rgba(165,128,192,.12)' : light ? '#FFFDF9' : C.raised,
      color: accent ? (light ? C.purpleDark : C.purpleLight) : light ? C.paperMuted : C.inkDim,
      fontFamily: sans,
      fontSize: 16,
      lineHeight: 1,
      fontWeight: 700,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);

const SearchBar: React.FC<{
  y: number;
  width: number;
  opacity?: number;
  scale?: number;
  typed?: string;
}> = ({y, width, opacity = 1, scale = 1, typed = 'magayon'}) => (
  <div
    style={{
      position: 'absolute',
      left: '50%',
      top: y,
      translate: '-50% -50%',
      width,
      height: 112,
      borderRadius: 28,
      background: 'rgba(25,23,20,.96)',
      border: `1px solid ${C.border}`,
      boxShadow: '0 28px 90px rgba(0,0,0,.34)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 34px',
      gap: 20,
      opacity,
      scale,
      zIndex: 10,
    }}
  >
    <div style={{fontFamily: sans, fontSize: 36, color: C.muted}}>⌕</div>
    <div style={{fontFamily: sans, fontSize: 34, fontWeight: 700, color: C.ink, letterSpacing: '-.02em'}}>
      {typed}
    </div>
    <div style={{height: 40, width: 2, background: C.purple, opacity: 0.9}} />
    <div style={{marginLeft: 'auto', fontFamily: sans, fontSize: 17, color: C.muted, letterSpacing: '.08em'}}>
      SEARCH BIKOL
    </div>
  </div>
);

const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const wordIn = spring({frame, fps, config: {damping: 110, stiffness: 105, mass: 0.85}});
  const arrowIn = reveal(frame, 12, 23);
  const translationIn = reveal(frame, 18, 33);
  const punchIn = reveal(frame, 35, 46);
  const search = reveal(frame, 53, 77);
  const mainOut = interpolate(frame, [54, 68], [1, 0], {...clamp, easing: ease});

  return (
    <AbsoluteFill style={{background: '#05070C', overflow: 'hidden'}}>
      <Img
        src={mayon}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: '50% 34%',
          scale: interpolate(frame, [0, 78], [1.08, 1.13], clamp),
          opacity: 0.6,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50% 38%, rgba(5,7,12,.10) 0%, rgba(5,7,12,.52) 52%, rgba(5,7,12,.96) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: mainOut,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: 34,
            width: '100%',
            paddingBottom: 70,
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 190,
              lineHeight: 0.9,
              letterSpacing: '-.065em',
              fontWeight: 700,
              color: C.ink,
              opacity: wordIn,
              translate: `${interpolate(wordIn, [0, 1], [-80, 0])}px 0`,
            }}
          >
            magayon
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 76,
              color: C.gold,
              fontWeight: 400,
              opacity: arrowIn,
              translate: `${interpolate(arrowIn, [0, 1], [-20, 0])}px 0`,
            }}
          >
            →
          </div>
          <div
            style={{
              fontFamily: serif,
              fontSize: 150,
              lineHeight: 0.9,
              letterSpacing: '-.055em',
              fontStyle: 'italic',
              color: C.purpleLight,
              opacity: translationIn,
              translate: `${interpolate(translationIn, [0, 1], [70, 0])}px 0`,
            }}
          >
            beautiful
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 145,
          textAlign: 'center',
          fontFamily: sans,
          fontSize: 34,
          color: C.inkDim,
          letterSpacing: '.03em',
          fontWeight: 600,
          opacity: punchIn * mainOut,
          translate: `0 ${interpolate(punchIn, [0, 1], [20, 0])}px`,
        }}
      >
        That’s only the start.
      </div>

      <div
        style={{
          position: 'absolute',
          top: 70,
          left: 80,
          fontFamily: sans,
          fontSize: 17,
          fontWeight: 700,
          color: C.gold,
          letterSpacing: '.24em',
          textTransform: 'uppercase',
          opacity: interpolate(frame, [0, 14, 48, 60], [0, 1, 1, 0], clamp),
        }}
      >
        The Bikol language archive
      </div>

      <SearchBar
        y={interpolate(search, [0, 1], [520, 540])}
        width={interpolate(search, [0, 1], [700, 1490])}
        opacity={search}
        scale={interpolate(search, [0, 1], [0.94, 1])}
      />
      <Noise opacity={0.055} />
    </AbsoluteFill>
  );
};

const SceneEntry: React.FC = () => {
  const frame = useCurrentFrame();
  const panelIn = reveal(frame, 12, 34);
  const wordIn = reveal(frame, 28, 48);
  const metaIn = reveal(frame, 44, 64);
  const sourceIn = reveal(frame, 62, 82);
  const wipe = reveal(frame, 112, 131);
  const searchY = interpolate(frame, [0, 20], [540, 92], {...clamp, easing: easeInOut});
  const searchW = interpolate(frame, [0, 20], [1490, 1680], {...clamp, easing: easeInOut});

  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <SearchBar y={searchY} width={searchW} />

      <div
        style={{
          position: 'absolute',
          left: 120,
          right: 120,
          top: 175,
          bottom: 88,
          borderRadius: 30,
          border: `1px solid ${C.border}`,
          background: C.bg2,
          overflow: 'hidden',
          opacity: panelIn,
          translate: `0 ${interpolate(panelIn, [0, 1], [35, 0])}px`,
          boxShadow: '0 40px 100px rgba(0,0,0,.28)',
        }}
      >
        <div style={{position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1.12fr .88fr'}}>
          <div style={{padding: '68px 72px', borderRight: `1px solid ${C.border}`, position: 'relative'}}>
            <div
              style={{
                fontFamily: serif,
                fontSize: 160,
                letterSpacing: '-.07em',
                lineHeight: 0.9,
                color: C.purpleLight,
                fontWeight: 700,
                opacity: wordIn,
                translate: `${interpolate(wordIn, [0, 1], [-34, 0])}px 0`,
              }}
            >
              magayon
            </div>
            <div
              style={{
                marginTop: 28,
                fontFamily: serif,
                fontSize: 74,
                fontStyle: 'italic',
                color: C.ink,
                opacity: wordIn,
              }}
            >
              beautiful
            </div>

            <div
              style={{
                position: 'absolute',
                left: 72,
                right: 72,
                bottom: 70,
                opacity: metaIn,
              }}
            >
              <Hairline opacity={0.8} />
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 26}}>
                <Pill accent>adjective</Pill>
                <Pill>dialect context</Pill>
                <Pill>examples</Pill>
                <Pill>etymology</Pill>
                <Pill>pronunciation</Pill>
              </div>
            </div>
          </div>

          <div style={{padding: '68px 64px', position: 'relative'}}>
            <div
              style={{
                fontFamily: sans,
                fontSize: 16,
                color: C.gold,
                fontWeight: 700,
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                opacity: wordIn,
              }}
            >
              An entry is more than a translation
            </div>
            <div
              style={{
                marginTop: 38,
                fontFamily: serif,
                fontSize: 57,
                lineHeight: 1.07,
                letterSpacing: '-.035em',
                color: C.ink,
                opacity: metaIn,
              }}
            >
              Meaning.
              <br />
              Context.
              <br />
              <span style={{color: C.purpleLight}}>Source.</span>
            </div>

            <div
              style={{
                position: 'absolute',
                left: 64,
                right: 64,
                bottom: 68,
                opacity: sourceIn,
              }}
            >
              <div style={{fontFamily: sans, fontSize: 15, color: C.muted, marginBottom: 14, letterSpacing: '.14em', textTransform: 'uppercase'}}>
                Source trail
              </div>
              <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}>
                <Pill>Mintz</Pill>
                <Pill>Wiktionary</Pill>
                <Pill>LearnBikol</Pill>
                <Pill>Community</Pill>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: `${wipe * 100}%`,
          background: C.paper,
          zIndex: 40,
        }}
      />
      <Noise />
    </AbsoluteFill>
  );
};

const dialects = ['CENTRAL', 'RINCONADA', 'ALBAY', 'CATANDUANES', 'SORSOGON'];

const SceneDialects: React.FC = () => {
  const frame = useCurrentFrame();
  const bigIn = reveal(frame, 0, 18);
  const titleIn = reveal(frame, 9, 27);
  const rowsIn = reveal(frame, 24, 72);
  const statementIn = reveal(frame, 66, 86);
  const eclipse = reveal(frame, 100, 119);

  return (
    <AbsoluteFill style={{background: C.paper, color: C.paperInk, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: -60,
          fontFamily: serif,
          fontSize: 700,
          lineHeight: 1,
          letterSpacing: '-.10em',
          fontWeight: 900,
          color: '#E8E0D3',
          opacity: bigIn,
          translate: `${interpolate(bigIn, [0, 1], [-80, 0])}px 0`,
        }}
      >
        5
      </div>

      <div
        style={{
          position: 'absolute',
          left: 615,
          top: 110,
          right: 90,
          fontFamily: serif,
          fontSize: 116,
          lineHeight: 0.94,
          fontWeight: 700,
          letterSpacing: '-.055em',
          opacity: titleIn,
        }}
      >
        Bikol dialects.
        <br />
        <span style={{color: C.purpleDark}}>One living archive.</span>
      </div>

      <div style={{position: 'absolute', left: 615, right: 90, top: 420, opacity: rowsIn}}>
        {dialects.map((dialect, i) => {
          const local = reveal(frame, 26 + i * 7, 43 + i * 7);
          const drift = interpolate(frame, [0, 120], [0, i % 2 === 0 ? -42 : 42], clamp);
          return (
            <div key={dialect} style={{position: 'relative', overflow: 'hidden'}}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '64px 1fr 150px',
                  alignItems: 'center',
                  minHeight: 82,
                  translate: `${interpolate(local, [0, 1], [i % 2 === 0 ? 100 : -100, 0]) + drift}px 0`,
                  opacity: local,
                }}
              >
                <div style={{fontFamily: sans, fontSize: 16, color: C.paperMuted, fontWeight: 700}}>0{i + 1}</div>
                <div style={{fontFamily: sans, fontSize: 38, fontWeight: 700, letterSpacing: '.07em'}}>{dialect}</div>
                <div style={{height: 2, background: i === 0 ? C.purple : '#CFC7BA'}} />
              </div>
              <Hairline color="#D7D1C6" opacity={0.8} />
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 90,
          bottom: 72,
          fontFamily: serif,
          fontSize: 54,
          fontStyle: 'italic',
          color: C.paperInk,
          opacity: statementIn,
        }}
      >
        Meaning lives in place.
      </div>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 2400,
          height: 2400,
          borderRadius: '50%',
          background: C.bg,
          translate: '-50% -50%',
          scale: eclipse,
          zIndex: 30,
        }}
      />
      <Noise opacity={0.025} dark={false} />
    </AbsoluteFill>
  );
};

const conjugations = [
  {label: 'ROOT', word: 'bakal', note: 'buy'},
  {label: 'INFINITIVE', word: 'magbakal', note: 'actor focus'},
  {label: 'PAST', word: 'nagbakal', note: 'completed'},
  {label: 'PROGRESSIVE', word: 'nagbabakal', note: 'ongoing'},
  {label: 'FUTURE', word: 'mababakal', note: 'future'},
];

const SceneGrammar: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOut = interpolate(frame, [12, 32], [1, 0], {...clamp, easing: ease});
  const titleScale = interpolate(frame, [0, 28], [1, 1.12], {...clamp, easing: ease});
  const panelsIn = reveal(frame, 18, 48);
  const creamRise = reveal(frame, 88, 104);

  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: serif,
          fontSize: 210,
          fontWeight: 700,
          letterSpacing: '-.07em',
          color: C.ink,
          opacity: titleOut,
          scale: titleScale,
        }}
      >
        WORDS MOVE.
      </div>

      <div
        style={{
          position: 'absolute',
          left: 70,
          right: 70,
          top: 140,
          bottom: 105,
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 12,
          opacity: panelsIn,
        }}
      >
        {conjugations.map((item, i) => {
          const p = reveal(frame, 23 + i * 7, 39 + i * 7);
          return (
            <div
              key={item.label}
              style={{
                borderRadius: 24,
                border: `1px solid ${i === 0 ? C.purple : C.border}`,
                background: i === 0 ? 'rgba(165,128,192,.12)' : C.bg2,
                padding: '34px 26px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: p,
                translate: `0 ${interpolate(p, [0, 1], [90, 0])}px`,
              }}
            >
              <div style={{fontFamily: sans, fontSize: 15, color: i === 0 ? C.purpleLight : C.muted, fontWeight: 700, letterSpacing: '.15em'}}>
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: serif,
                  fontSize: i === 0 ? 62 : 48,
                  lineHeight: 1,
                  letterSpacing: '-.04em',
                  color: C.ink,
                  overflowWrap: 'anywhere',
                }}
              >
                {item.word}
              </div>
              <div style={{fontFamily: sans, fontSize: 17, color: C.muted}}>{item.note}</div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 66,
          fontFamily: sans,
          fontSize: 17,
          color: C.gold,
          fontWeight: 700,
          letterSpacing: '.18em',
          opacity: panelsIn,
        }}
      >
        ROOT → TENSE → FOCUS
      </div>
      <div
        style={{
          position: 'absolute',
          right: 72,
          top: 58,
          fontFamily: serif,
          fontSize: 44,
          color: C.inkDim,
          fontStyle: 'italic',
          opacity: panelsIn,
        }}
      >
        See the pattern, not just the answer.
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: `${creamRise * 100}%`,
          background: C.paper,
          zIndex: 40,
        }}
      />
      <Noise />
    </AbsoluteFill>
  );
};

const LearningCard: React.FC<{
  title: string;
  kicker: string;
  x: number;
  y: number;
  rotate: number;
  delay: number;
  children: React.ReactNode;
}> = ({title, kicker, x, y, rotate, delay, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 90, stiffness: 120, mass: 0.8}});
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 500,
        height: 560,
        padding: 36,
        borderRadius: 28,
        background: '#FFFDF9',
        border: '1px solid #D8D1C5',
        boxShadow: '0 26px 70px rgba(60,48,35,.13)',
        rotate: `${rotate}deg`,
        opacity: p,
        translate: `0 ${interpolate(p, [0, 1], [120, 0])}px`,
      }}
    >
      <div style={{fontFamily: sans, fontSize: 14, letterSpacing: '.16em', color: C.purpleDark, fontWeight: 700}}>{kicker}</div>
      <div style={{fontFamily: serif, fontSize: 54, lineHeight: 1, marginTop: 16, color: C.paperInk, letterSpacing: '-.04em'}}>{title}</div>
      <div style={{marginTop: 34}}>{children}</div>
    </div>
  );
};

const SceneLearning: React.FC = () => {
  const frame = useCurrentFrame();
  const statement = reveal(frame, 0, 18);
  const useIt = reveal(frame, 15, 31);
  const detail = reveal(frame, 70, 90);
  const darkFall = reveal(frame, 103, 119);

  return (
    <AbsoluteFill style={{background: C.paper, color: C.paperInk, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: 68,
          top: 56,
          fontFamily: sans,
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: '.02em',
          color: C.paperMuted,
          opacity: statement,
        }}
      >
        Don’t just remember it.
      </div>
      <div
        style={{
          position: 'absolute',
          left: 50,
          top: 68,
          fontFamily: serif,
          fontSize: 300,
          lineHeight: .9,
          fontWeight: 900,
          letterSpacing: '-.085em',
          color: '#E5D8EB',
          opacity: useIt,
          zIndex: 0,
        }}
      >
        USE IT.
      </div>

      <LearningCard title="Recall" kicker="FLASHCARDS" x={170} y={350} rotate={-4} delay={20}>
        <div style={{fontFamily: serif, fontSize: 72, color: C.purpleDark, letterSpacing: '-.04em'}}>magayon</div>
        <Hairline color="#D8D1C5" />
        <div style={{fontFamily: sans, fontSize: 23, color: C.paperMuted, marginTop: 22}}>Reveal meaning → repeat → retain.</div>
      </LearningCard>

      <LearningCard title="Transform" kicker="GRAMMAR DRILLS" x={710} y={300} rotate={2.5} delay={29}>
        <div style={{display: 'grid', gap: 12}}>
          {['bakal', 'nagbakal', 'nagbabakal'].map((word, i) => (
            <div key={word} style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <div style={{width: 26, height: 26, borderRadius: 999, background: i === 0 ? C.purple : '#D8D1C5'}} />
              <div style={{fontFamily: sans, fontSize: 27, fontWeight: 700}}>{word}</div>
            </div>
          ))}
        </div>
      </LearningCard>

      <LearningCard title="Respond" kicker="DIALOGUE" x={1245} y={340} rotate={-2} delay={38}>
        <div style={{display: 'grid', gap: 16}}>
          <div style={{justifySelf: 'start', maxWidth: 330, padding: '18px 20px', borderRadius: '18px 18px 18px 5px', background: C.paper2, fontFamily: sans, fontSize: 21}}>
            Read the situation.
          </div>
          <div style={{justifySelf: 'end', maxWidth: 330, padding: '18px 20px', borderRadius: '18px 18px 5px 18px', background: '#E9DDF0', fontFamily: sans, fontSize: 21}}>
            Build the reply.
          </div>
        </div>
      </LearningCard>

      <div
        style={{
          position: 'absolute',
          left: 70,
          right: 70,
          bottom: 58,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: sans,
          fontSize: 18,
          color: C.paperMuted,
          opacity: detail,
        }}
      >
        <span>Vocabulary decks</span>
        <span>Sentence substitution</span>
        <span>Verb transformation</span>
        <span>Dialogue practice</span>
      </div>

      <div style={{position: 'absolute', inset: 0, background: C.bg, opacity: darkFall, zIndex: 40}} />
      <Noise opacity={0.025} dark={false} />
    </AbsoluteFill>
  );
};

const SourceChip: React.FC<{label: string; x: number; y: number; delay: number}> = ({label, x, y, delay}) => {
  const frame = useCurrentFrame();
  const p = reveal(frame, delay, delay + 14);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity: p,
        translate: `${interpolate(p, [0, 1], [-80, 0])}px 0`,
      }}
    >
      <Pill>{label}</Pill>
    </div>
  );
};

const SceneContribution: React.FC = () => {
  const frame = useCurrentFrame();
  const formIn = reveal(frame, 8, 28);
  const headline = reveal(frame, 0, 18);
  const fields = reveal(frame, 28, 52);
  const sources = reveal(frame, 48, 72);
  const button = reveal(frame, 66, 84);
  const flash = interpolate(frame, [92, 98, 104], [0, 1, 0], clamp);

  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: -40,
          top: 20,
          fontFamily: serif,
          fontSize: 180,
          fontWeight: 900,
          letterSpacing: '-.08em',
          color: '#171510',
          whiteSpace: 'nowrap',
          opacity: 1,
        }}
      >
        LANGUAGE CHANGES · LANGUAGE CHANGES
      </div>

      <div
        style={{
          position: 'absolute',
          left: 76,
          top: 58,
          fontFamily: serif,
          fontSize: 72,
          color: C.ink,
          letterSpacing: '-.04em',
          opacity: headline,
        }}
      >
        So can the archive.
      </div>

      <div
        style={{
          position: 'absolute',
          left: 190,
          right: 190,
          top: 205,
          bottom: 100,
          borderRadius: 30,
          background: C.bg2,
          border: `1px solid ${C.border}`,
          boxShadow: '0 36px 100px rgba(0,0,0,.30)',
          opacity: formIn,
          scale: interpolate(formIn, [0, 1], [.96, 1]),
          overflow: 'hidden',
        }}
      >
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%'}}>
          <div style={{padding: '46px 54px', borderRight: `1px solid ${C.border}`}}>
            <div style={{fontFamily: sans, fontSize: 15, color: C.gold, fontWeight: 700, letterSpacing: '.16em'}}>COMMUNITY CONTRIBUTION</div>
            <div style={{marginTop: 26, display: 'flex', gap: 10, flexWrap: 'wrap', opacity: fields}}>
              <Pill accent>new word</Pill>
              <Pill>correction</Pill>
              <Pill>definition</Pill>
              <Pill>source</Pill>
            </div>
            <div
              style={{
                marginTop: 38,
                height: 180,
                borderRadius: 20,
                border: `1px solid ${C.border}`,
                background: C.raised,
                padding: 28,
                fontFamily: serif,
                fontSize: 36,
                lineHeight: 1.15,
                color: C.ink,
                opacity: fields,
              }}
            >
              Add context.
              <br />
              Cite a source.
              <br />
              <span style={{color: C.purpleLight}}>Help the entry grow.</span>
            </div>
            <div
              style={{
                marginTop: 26,
                height: 58,
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: C.purple,
                color: '#160E1B',
                fontFamily: sans,
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: '.10em',
                opacity: button,
                scale: interpolate(frame, [78, 86, 94], [1, .97, 1], clamp),
              }}
            >
              SUBMIT WITH SOURCE
            </div>
          </div>

          <div style={{position: 'relative', padding: '48px 54px'}}>
            <div style={{fontFamily: sans, fontSize: 15, color: C.muted, fontWeight: 700, letterSpacing: '.16em'}}>SOURCE TRAIL</div>
            <div
              style={{
                position: 'absolute',
                left: 54,
                right: 54,
                top: 130,
                bottom: 60,
                borderLeft: `1px solid ${C.border}`,
                opacity: sources,
              }}
            />
            <SourceChip label="BOOK / DICTIONARY" x={92} y={170} delay={48} />
            <SourceChip label="WIKTIONARY" x={250} y={250} delay={56} />
            <SourceChip label="COMMUNITY NOTE" x={115} y={335} delay={64} />
            <SourceChip label="DIALECT LABEL" x={330} y={420} delay={72} />
            <div
              style={{
                position: 'absolute',
                right: 56,
                bottom: 54,
                width: 280,
                fontFamily: serif,
                fontSize: 42,
                lineHeight: 1.05,
                color: C.ink,
                opacity: sources,
              }}
            >
              Keep evidence
              <br />
              <span style={{color: C.purpleLight}}>attached.</span>
            </div>
          </div>
        </div>
      </div>
      <AbsoluteFill style={{background: C.paper, opacity: flash * .92, zIndex: 50}} />
      <Noise />
    </AbsoluteFill>
  );
};

const RecapBeat: React.FC<{
  start: number;
  end: number;
  word: string;
  detail: string;
  light?: boolean;
}> = ({start, end, word, detail, light = false}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [start, start + 4, end - 4, end], [0, 1, 1, 0], clamp);
  const x = interpolate(frame, [start, end], [120, -70], {...clamp, easing: Easing.linear});
  return (
    <AbsoluteFill
      style={{
        background: light ? C.paper : C.bg,
        color: light ? C.paperInk : C.ink,
        opacity,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: x,
          top: 170,
          fontFamily: serif,
          fontSize: 250,
          lineHeight: .9,
          fontWeight: 900,
          letterSpacing: '-.085em',
          whiteSpace: 'nowrap',
        }}
      >
        {word}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 120,
          bottom: 115,
          fontFamily: sans,
          fontSize: 32,
          fontWeight: 600,
          color: light ? C.purpleDark : C.purpleLight,
        }}
      >
        {detail}
      </div>
      <div
        style={{
          position: 'absolute',
          right: 90,
          bottom: 85,
          width: 460,
          height: 230,
          borderRadius: 26,
          border: `1px solid ${light ? '#D4CDC1' : C.border}`,
          background: light ? '#FFFDF9' : C.bg2,
          overflow: 'hidden',
        }}
      >
        <div style={{height: 46, borderBottom: `1px solid ${light ? '#D4CDC1' : C.border}`, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 8}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{width: 8, height: 8, borderRadius: 8, background: i === 0 ? C.purple : light ? '#CEC7BC' : C.border}} />
          ))}
        </div>
        <div style={{padding: 24, fontFamily: sans, color: light ? C.paperMuted : C.muted, fontSize: 17, lineHeight: 1.55}}>
          {word === 'SEARCH.' && 'magayon → beautiful → context'}
          {word === 'UNDERSTAND.' && 'Central · Rinconada · Albay · Catanduanes · Sorsogon'}
          {word === 'PRACTICE.' && 'Recall · transform · respond'}
          {word === 'CONTRIBUTE.' && 'Word · correction · definition · source'}
        </div>
      </div>
      <Noise opacity={0.028} dark={!light} />
    </AbsoluteFill>
  );
};

const SceneRecap: React.FC = () => {
  const frame = useCurrentFrame();
  const finalIn = reveal(frame, 91, 103);
  const finalScale = interpolate(frame, [91, 120], [.92, 1.04], {...clamp, easing: ease});
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <RecapBeat start={0} end={24} word="SEARCH." detail="Find the word." />
      <RecapBeat start={22} end={46} word="UNDERSTAND." detail="Keep the context." light />
      <RecapBeat start={44} end={68} word="PRACTICE." detail="Make it usable." />
      <RecapBeat start={66} end={92} word="CONTRIBUTE." detail="Help the archive grow." light />
      <AbsoluteFill
        style={{
          background: C.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: finalIn,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 190,
            lineHeight: .9,
            fontWeight: 900,
            letterSpacing: '-.075em',
            color: C.ink,
            scale: finalScale,
          }}
        >
          KEEP IT <span style={{color: C.purpleLight}}>ALIVE.</span>
        </div>
      </AbsoluteFill>
      <Noise />
    </AbsoluteFill>
  );
};

const SceneEnd: React.FC = () => {
  const frame = useCurrentFrame();
  const imageIn = reveal(frame, 0, 22);
  const titleIn = reveal(frame, 18, 42);
  const subIn = reveal(frame, 38, 56);
  const settle = interpolate(frame, [0, 120], [1.08, 1.02], {...clamp, easing: Easing.linear});

  return (
    <AbsoluteFill style={{background: '#05070C', overflow: 'hidden'}}>
      <Img
        src={mayon}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: '50% 36%',
          opacity: .76 * imageIn,
          scale: settle,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(5,7,12,.32) 0%, rgba(5,7,12,.58) 55%, rgba(5,7,12,.92) 100%)',
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
          paddingBottom: 30,
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 17,
            fontWeight: 700,
            color: C.gold,
            letterSpacing: '.24em',
            textTransform: 'uppercase',
            opacity: titleIn,
            marginBottom: 18,
          }}
        >
          The Bikol language archive
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 150,
            lineHeight: .9,
            fontWeight: 700,
            letterSpacing: '-.07em',
            color: C.ink,
            opacity: titleIn,
            translate: `0 ${interpolate(titleIn, [0, 1], [28, 0])}px`,
          }}
        >
          Bikol <span style={{fontStyle: 'italic', fontWeight: 400, color: '#F2DFC3'}}>Dictionary</span>
        </div>
        <div
          style={{
            marginTop: 28,
            fontFamily: serif,
            fontSize: 45,
            color: C.inkDim,
            opacity: subIn,
          }}
        >
          Search it. Study it. <span style={{color: C.purpleLight}}>Keep it alive.</span>
        </div>
        <div
          style={{
            marginTop: 34,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontFamily: sans,
            fontSize: 16,
            color: '#C9C1B5',
            letterSpacing: '.10em',
            textTransform: 'uppercase',
            opacity: subIn,
          }}
        >
          <span>bikoldictionary.app</span>
          <span style={{width: 4, height: 4, borderRadius: 4, background: C.gold}} />
          <span>Free & open access</span>
        </div>
      </div>
      <Noise opacity={0.055} />
    </AbsoluteFill>
  );
};

export const BikolArchive30: React.FC = () => {
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Audio src={staticFile('audio/bikol-motion.wav')} volume={0.82} />
      <Sequence from={0} durationInFrames={78}>
        <SceneHook />
      </Sequence>
      <Sequence from={78} durationInFrames={132}>
        <SceneEntry />
      </Sequence>
      <Sequence from={210} durationInFrames={120}>
        <SceneDialects />
      </Sequence>
      <Sequence from={330} durationInFrames={105}>
        <SceneGrammar />
      </Sequence>
      <Sequence from={435} durationInFrames={120}>
        <SceneLearning />
      </Sequence>
      <Sequence from={555} durationInFrames={105}>
        <SceneContribution />
      </Sequence>
      <Sequence from={660} durationInFrames={120}>
        <SceneRecap />
      </Sequence>
      <Sequence from={780} durationInFrames={120}>
        <SceneEnd />
      </Sequence>
    </AbsoluteFill>
  );
};
