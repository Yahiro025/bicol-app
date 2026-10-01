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
  night: '#08090D',
  black: '#0E0D0B',
  raised: '#191714',
  ink: '#F7F3EA',
  ink2: '#D9D2C6',
  muted: '#8D877E',
  line: '#37332D',
  purple: '#A580C0',
  purpleDark: '#6F4D87',
  rust: '#C8794E',
  gold: '#EBCB86',
  paper: '#F7F4ED',
  paper2: '#EEE9DE',
  paperInk: '#181715',
};

const serif = "Georgia, 'Times New Roman', serif";
const sans = "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const mayon = 'https://raw.githubusercontent.com/Yahiro025/bicol-app/main/public/images/mayon-hero.png';
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = Easing.bezier(0.16, 1, 0.3, 1);

const fade = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {...clamp, easing: ease});

const Noise: React.FC<{opacity?: number}> = ({opacity = 0.035}) => (
  <AbsoluteFill
    style={{
      opacity,
      pointerEvents: 'none',
      mixBlendMode: 'soft-light',
      backgroundImage:
        'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 180 180\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.82\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'.78\'/%3E%3C/svg%3E")',
    }}
  />
);

const Eyebrow: React.FC<{children: React.ReactNode; dark?: boolean}> = ({children, dark = true}) => (
  <div
    style={{
      fontFamily: sans,
      fontSize: 18,
      fontWeight: 800,
      letterSpacing: '0.28em',
      textTransform: 'uppercase',
      color: dark ? C.gold : C.purpleDark,
    }}
  >
    {children}
  </div>
);

const Scene01Hook: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const collapse = interpolate(f, [92, 126], [0, 1], {...clamp, easing: ease});
  const letters = 'MAGAYON'.split('');

  return (
    <AbsoluteFill style={{backgroundColor: C.night, overflow: 'hidden'}}>
      <Img
        src={mayon}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: '50% 34%',
          scale: interpolate(f, [0, 126], [1.02, 1.13], clamp),
          opacity: interpolate(f, [0, 22, 92, 126], [0.5, 0.92, 0.92, 0.22], clamp),
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 58%, rgba(200,121,78,.13), transparent 28%), radial-gradient(ellipse at 50% 40%, rgba(8,9,13,.05), rgba(8,9,13,.88) 74%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 92,
          right: 92,
          top: 74,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          opacity: fade(f, 0, 18) * (1 - collapse),
        }}
      >
        <Eyebrow>BIKOL · WORD 0001</Eyebrow>
        <div style={{fontFamily: sans, fontSize: 17, letterSpacing: '.16em', color: C.ink2}}>
          language archive
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 56,
          right: 56,
          top: interpolate(collapse, [0, 1], [278, 96]),
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'baseline',
          gap: interpolate(collapse, [0, 1], [10, 2]),
          scale: interpolate(collapse, [0, 1], [1, 0.22]),
          transformOrigin: '50% 50%',
        }}
      >
        {letters.map((letter, i) => {
          const li = spring({
            frame: f - 10 - i * 2.8,
            fps,
            config: {damping: 105, stiffness: 110},
          });
          return (
            <span
              key={`${letter}-${i}`}
              style={{
                display: 'inline-block',
                fontFamily: serif,
                fontSize: 244,
                fontWeight: 700,
                letterSpacing: '-0.055em',
                lineHeight: 0.84,
                color: C.ink,
                opacity: li,
                translate: `0 ${interpolate(li, [0, 1], [70, 0])}px`,
                rotate: `${interpolate(li, [0, 1], [i % 2 ? 3 : -3, 0])}deg`,
                textShadow: '0 24px 80px rgba(0,0,0,.38)',
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 562,
          textAlign: 'center',
          opacity: fade(f, 46, 68) * (1 - collapse),
        }}
      >
        <div style={{fontFamily: serif, fontSize: 52, fontStyle: 'italic', color: C.gold}}>
          beautiful · maganda
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 100,
          right: 100,
          bottom: 82,
          borderTop: '1px solid rgba(235,203,134,.36)',
          paddingTop: 26,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          opacity: fade(f, 58, 80) * (1 - collapse),
        }}
      >
        <div style={{fontFamily: serif, fontSize: 62, color: C.ink, letterSpacing: '-.03em'}}>
          One word can carry a place.
        </div>
        <div style={{fontFamily: sans, fontSize: 18, color: C.ink2, textTransform: 'uppercase', letterSpacing: '.18em'}}>
          meaning · sound · memory
        </div>
      </div>
      <Noise opacity={0.055} />
    </AbsoluteFill>
  );
};

const Scene02Search: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bgIn = fade(f, 0, 20);
  const queryIn = spring({frame: f - 10, fps, config: {damping: 105, stiffness: 110}});
  const infoIn = spring({frame: f - 34, fps, config: {damping: 115, stiffness: 95}});
  const toCenter = interpolate(f, [132, 170], [0, 1], {...clamp, easing: ease});

  return (
    <AbsoluteFill style={{overflow: 'hidden', pointerEvents: 'none'}}>
      <AbsoluteFill style={{backgroundColor: C.black, opacity: bgIn}} />
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          top: 58,
          height: 124,
          borderRadius: 28,
          border: `1px solid ${C.line}`,
          background: 'rgba(25,23,20,.96)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 34px',
          boxShadow: '0 28px 80px rgba(0,0,0,.32)',
          opacity: queryIn,
          translate: `0 ${interpolate(queryIn, [0, 1], [-34, 0])}px`,
        }}
      >
        <div style={{fontFamily: sans, fontSize: 34, color: C.muted, marginRight: 22}}>⌕</div>
        <div style={{fontFamily: sans, fontSize: 48, fontWeight: 650, color: C.ink}}>magayon</div>
        <div style={{width: 2, height: 54, background: C.purple, marginLeft: 8, opacity: f % 20 < 10 ? 1 : 0.25}} />
        <div style={{marginLeft: 'auto', fontFamily: sans, fontSize: 17, letterSpacing: '.18em', textTransform: 'uppercase', color: C.muted}}>
          search the archive
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: interpolate(toCenter, [0, 1], [104, 630]),
          top: interpolate(toCenter, [0, 1], [242, 382]),
          scale: interpolate(toCenter, [0, 1], [1, 0.64]),
          zIndex: 4,
          opacity: infoIn,
        }}
      >
        <div style={{fontFamily: serif, fontSize: 202, lineHeight: .9, fontWeight: 700, letterSpacing: '-.055em', color: C.purple}}>
          magayon
        </div>
        <div style={{width: interpolate(infoIn, [0, 1], [0, 870]), height: 2, background: C.line, marginTop: 28}} />
      </div>

      <div
        style={{
          position: 'absolute',
          right: 112,
          top: 282,
          width: 670,
          opacity: infoIn * (1 - toCenter),
          translate: `${interpolate(infoIn, [0, 1], [70, 0])}px 0`,
        }}
      >
        <Eyebrow>ADJECTIVE</Eyebrow>
        <div style={{fontFamily: serif, fontSize: 150, lineHeight: .9, letterSpacing: '-.05em', color: C.ink, marginTop: 28}}>
          beautiful
        </div>
        <div style={{fontFamily: serif, fontSize: 52, fontStyle: 'italic', color: C.gold, marginTop: 28}}>
          maganda
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 108,
          right: 108,
          bottom: 74,
          display: 'grid',
          gridTemplateColumns: '1.15fr .85fr 1fr 1fr',
          borderTop: `1px solid ${C.line}`,
          borderBottom: `1px solid ${C.line}`,
          opacity: fade(f, 62, 82) * (1 - toCenter),
        }}
      >
        {[
          ['PRONUNCIATION', 'ma·ga·yon'],
          ['DIALECT', 'Central Bikol'],
          ['CONTEXT', 'examples'],
          ['REFERENCE', 'source attached'],
        ].map(([k, v], i) => (
          <div key={k} style={{padding: '26px 30px', borderLeft: i === 0 ? 'none' : `1px solid ${C.line}`}}>
            <div style={{fontFamily: sans, fontSize: 14, letterSpacing: '.2em', fontWeight: 800, color: C.muted}}>{k}</div>
            <div style={{fontFamily: serif, fontSize: 34, color: C.ink, marginTop: 10}}>{v}</div>
          </div>
        ))}
      </div>
      <Noise />
    </AbsoluteFill>
  );
};

const dialects = [
  {name: 'CENTRAL', x: 960, y: 130},
  {name: 'RINCONADA', x: 1510, y: 360},
  {name: 'ALBAY', x: 1450, y: 820},
  {name: 'SORSOGON', x: 470, y: 820},
  {name: 'CATANDUANES', x: 350, y: 350},
];

const Scene03Dialect: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const paper = interpolate(f, [0, 34], [3, 126], {...clamp, easing: ease});
  const title = fade(f, 28, 52);
  const core = spring({frame: f - 18, fps, config: {damping: 100, stiffness: 100}});
  const exitCircle = interpolate(f, [112, 150], [1, 11], {...clamp, easing: ease});

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{background: C.paper, clipPath: `circle(${paper}% at 50% 50%)`}} />
      <div
        style={{
          position: 'absolute',
          left: 84,
          right: 84,
          top: 64,
          display: 'flex',
          justifyContent: 'space-between',
          opacity: title,
        }}
      >
        <Eyebrow dark={false}>02 · LANGUAGE IN CONTEXT</Eyebrow>
        <div style={{fontFamily: sans, fontSize: 18, color: '#6B6760', letterSpacing: '.15em'}}>one archive · distinct dialects</div>
      </div>

      {[420, 620, 830].map((size, i) => (
        <div
          key={size}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            left: 960 - size / 2,
            top: 540 - size / 2,
            borderRadius: '50%',
            border: '1px solid rgba(28,27,25,.18)',
            opacity: fade(f, 20 + i * 7, 46 + i * 7),
            scale: interpolate(f, [0, 150], [0.86, 1.08 + i * 0.02], clamp),
          }}
        />
      ))}

      {dialects.map((d, i) => {
        const p = spring({frame: f - 30 - i * 5, fps, config: {damping: 105, stiffness: 115}});
        return (
          <div
            key={d.name}
            style={{
              position: 'absolute',
              left: d.x,
              top: d.y,
              translate: '-50% -50%',
              padding: '15px 24px',
              borderRadius: 999,
              background: C.paper,
              border: '1px solid rgba(28,27,25,.26)',
              boxShadow: '0 16px 36px rgba(28,27,25,.08)',
              color: C.paperInk,
              fontFamily: sans,
              fontSize: 19,
              fontWeight: 800,
              letterSpacing: '.12em',
              opacity: p,
              scale: interpolate(p, [0, 1], [.6, 1]),
            }}
          >
            {d.name}
          </div>
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          translate: '-50% -50%',
          width: 310,
          height: 310,
          borderRadius: '50%',
          background: C.paperInk,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: C.paper,
          opacity: core,
          scale: interpolate(core, [0, 1], [.72, 1]) * exitCircle,
          zIndex: 5,
          boxShadow: '0 30px 80px rgba(28,27,25,.18)',
        }}
      >
        <div style={{fontFamily: serif, fontSize: 70, lineHeight: .9, letterSpacing: '-.04em'}}>magayon</div>
        <div style={{fontFamily: sans, fontSize: 14, letterSpacing: '.2em', marginTop: 18, color: '#D8D1C5'}}>ONE WORD</div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 82,
          bottom: 62,
          fontFamily: serif,
          fontSize: 72,
          lineHeight: .95,
          letterSpacing: '-.04em',
          color: C.paperInk,
          opacity: title * (1 - interpolate(f, [112, 144], [0, 1], clamp)),
        }}
      >
        One language.
        <br />
        <span style={{color: C.purpleDark, fontStyle: 'italic'}}>Five dialects.</span>
      </div>
      <Noise opacity={0.025} />
    </AbsoluteFill>
  );
};

const forms = [
  {word: 'bakal', label: 'root'},
  {word: 'magbakal', label: 'infinitive'},
  {word: 'nagbakal', label: 'completed'},
  {word: 'mabakal', label: 'contemplated'},
];

const Scene04Conjugation: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const darkReveal = interpolate(f, [0, 32], [2, 126], {...clamp, easing: ease});
  const step = Math.min(forms.length - 1, Math.floor(interpolate(f, [34, 124], [0, forms.length], clamp)));
  const active = forms[step];
  const wordIn = spring({frame: f - 22, fps, config: {damping: 105, stiffness: 105}});
  const cardGrow = interpolate(f, [132, 168], [0, 1], {...clamp, easing: ease});

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{background: C.black, clipPath: `circle(${darkReveal}% at 50% 50%)`}} />
      <div style={{position: 'absolute', left: 86, top: 68, opacity: fade(f, 24, 44)}}>
        <Eyebrow>03 · WORDS MOVE</Eyebrow>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 210,
          textAlign: 'center',
          opacity: wordIn * (1 - cardGrow),
        }}
      >
        <div style={{fontFamily: sans, fontSize: 22, color: C.muted, textTransform: 'uppercase', letterSpacing: '.24em'}}>
          ROOT → ASPECT → MEANING
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 250,
            lineHeight: .9,
            letterSpacing: '-.065em',
            color: C.ink,
            marginTop: 52,
            scale: interpolate(wordIn, [0, 1], [.84, 1]),
          }}
        >
          {active.word}
        </div>
        <div style={{fontFamily: serif, fontSize: 48, fontStyle: 'italic', color: C.purple, marginTop: 18}}>{active.label}</div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 110,
          right: 110,
          bottom: 106,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          opacity: fade(f, 48, 68) * (1 - cardGrow),
        }}
      >
        {forms.map((form, i) => {
          const on = i <= step;
          return (
            <div
              key={form.word}
              style={{
                borderTop: `2px solid ${on ? C.gold : C.line}`,
                paddingTop: 18,
                paddingRight: 26,
                opacity: on ? 1 : .32,
              }}
            >
              <div style={{fontFamily: serif, fontSize: 42, color: on ? C.ink : C.muted}}>{form.word}</div>
              <div style={{fontFamily: sans, fontSize: 13, letterSpacing: '.18em', textTransform: 'uppercase', color: on ? C.gold : C.muted, marginTop: 9}}>{form.label}</div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 540,
          width: interpolate(cardGrow, [0, 1], [420, 2140]),
          height: interpolate(cardGrow, [0, 1], [270, 1240]),
          translate: '-50% -50%',
          borderRadius: interpolate(cardGrow, [0, 1], [30, 0]),
          background: C.paper,
          zIndex: 8,
          opacity: cardGrow,
        }}
      />
      <Noise />
    </AbsoluteFill>
  );
};

const PracticeCard: React.FC<{
  label: string;
  title: string;
  accent: string;
  children: React.ReactNode;
}> = ({label, title, accent, children}) => (
  <div
    style={{
      width: 1380,
      height: 610,
      flex: '0 0 auto',
      borderRadius: 42,
      border: '1px solid rgba(28,27,25,.16)',
      background: '#FFFDF8',
      boxShadow: '0 34px 80px rgba(28,27,25,.12)',
      padding: '56px 62px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden',
    }}
  >
    <div>
      <div style={{fontFamily: sans, fontSize: 15, letterSpacing: '.22em', fontWeight: 850, textTransform: 'uppercase', color: accent}}>{label}</div>
      <div style={{fontFamily: serif, fontSize: 108, lineHeight: .94, letterSpacing: '-.055em', color: C.paperInk, marginTop: 25}}>{title}</div>
    </div>
    {children}
  </div>
);

const Scene05Practice: React.FC = () => {
  const f = useCurrentFrame();
  const reveal = interpolate(f, [0, 26], [100, 0], {...clamp, easing: ease});
  const track = interpolate(f, [30, 152], [0, -3000], {...clamp, easing: Easing.bezier(.2, .8, .2, 1)});
  const exit = interpolate(f, [146, 172], [0, 1], {...clamp, easing: ease});

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{background: C.paper, clipPath: `inset(0 0 0 ${reveal}%)`}} />
      <div
        style={{
          position: 'absolute',
          left: 76,
          right: 76,
          top: 52,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          opacity: fade(f, 18, 38) * (1 - exit),
        }}
      >
        <div style={{fontFamily: serif, fontSize: 86, color: C.paperInk, letterSpacing: '-.045em'}}>
          Don’t just remember it. <span style={{color: C.purpleDark, fontStyle: 'italic'}}>Use it.</span>
        </div>
        <Eyebrow dark={false}>04 · PRACTICE</Eyebrow>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 270 + track,
          top: 282,
          display: 'flex',
          gap: 120,
          rotate: '-1.2deg',
          opacity: 1 - exit,
        }}
      >
        <PracticeCard label="FLASHCARD" title="magayon → beautiful" accent={C.purpleDark}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'end'}}>
            <div style={{fontFamily: serif, fontSize: 42, color: '#6B6760'}}>Recall before reveal.</div>
            <div style={{fontFamily: sans, fontSize: 15, letterSpacing: '.18em', textTransform: 'uppercase', color: '#6B6760'}}>top 25 · 50 · 100</div>
          </div>
        </PracticeCard>

        <PracticeCard label="GRAMMAR DRILL" title="Transform the sentence." accent={C.rust}>
          <div>
            <div style={{fontFamily: serif, fontSize: 48, color: C.paperInk}}>An aki <span style={{borderBottom: `4px solid ${C.rust}`}}>___</span> sa harong.</div>
            <div style={{fontFamily: sans, fontSize: 15, letterSpacing: '.18em', textTransform: 'uppercase', color: '#6B6760', marginTop: 22}}>substitution · verb transformation</div>
          </div>
        </PracticeCard>

        <PracticeCard label="DIALOGUE" title="Practice a real exchange." accent={C.purpleDark}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26}}>
            <div style={{background: C.paper2, borderRadius: 24, padding: '24px 28px', fontFamily: serif, fontSize: 34, color: C.paperInk}}>Kumusta ka?</div>
            <div style={{background: '#E7DDF0', borderRadius: 24, padding: '24px 28px', fontFamily: serif, fontSize: 34, color: C.paperInk}}>Marhay man.</div>
          </div>
        </PracticeCard>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 44,
          display: 'flex',
          justifyContent: 'center',
          gap: 10,
          opacity: fade(f, 28, 46) * (1 - exit),
        }}
      >
        {[0, 1, 2].map((i) => {
          const activeIndex = track > -900 ? 0 : track > -2300 ? 1 : 2;
          return <div key={i} style={{width: activeIndex === i ? 54 : 12, height: 8, borderRadius: 999, background: activeIndex === i ? C.purpleDark : '#CAC2B7'}} />;
        })}
      </div>
      <Noise opacity={0.02} />
    </AbsoluteFill>
  );
};

const archiveWords = [
  ['magayon', 'beautiful'], ['padaba', 'love'], ['uran', 'rain'], ['oragon', 'resilient'],
  ['aram', 'know'], ['bakal', 'buy'], ['harong', 'home'], ['aki', 'child'],
  ['marhay', 'good'], ['dakul', 'many'], ['saro', 'one'], ['gayon', 'beauty'],
  ['boses', 'voice'], ['taram', 'speak'], ['dalan', 'road'], ['dagat', 'sea'],
];

const Scene06Archive: React.FC = () => {
  const f = useCurrentFrame();
  const dark = interpolate(f, [0, 26], [100, 0], {...clamp, easing: ease});
  const zoom = interpolate(f, [112, 150], [1, .72], {...clamp, easing: ease});
  const dim = interpolate(f, [104, 146], [0, .58], clamp);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{background: C.black, clipPath: `inset(${dark}% 0 0 0)`}} />
      <div
        style={{
          position: 'absolute',
          inset: -80,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridAutoRows: '230px',
          gap: 18,
          rotate: '-3deg',
          scale: zoom,
          translate: `0 ${interpolate(f, [0, 150], [42, -30], clamp)}px`,
        }}
      >
        {archiveWords.map(([w, m], i) => {
          const p = fade(f, 10 + i * 1.8, 32 + i * 1.8);
          const highlight = i === 10;
          return (
            <div
              key={`${w}-${i}`}
              style={{
                border: `1px solid ${highlight ? 'rgba(235,203,134,.75)' : C.line}`,
                background: highlight ? '#2A2419' : C.raised,
                borderRadius: 24,
                padding: '28px 30px',
                opacity: p,
                translate: `0 ${interpolate(p, [0, 1], [40, 0])}px`,
              }}
            >
              <div style={{fontFamily: serif, fontSize: 50, color: highlight ? C.gold : C.ink, letterSpacing: '-.03em'}}>{w}</div>
              <div style={{fontFamily: sans, fontSize: 17, color: C.muted, marginTop: 10}}>{m}</div>
              {highlight && (
                <div style={{fontFamily: sans, fontSize: 12, color: C.gold, letterSpacing: '.17em', textTransform: 'uppercase', marginTop: 26}}>new contribution</div>
              )}
            </div>
          );
        })}
      </div>

      <AbsoluteFill style={{background: `rgba(14,13,11,${dim})`}} />

      <div
        style={{
          position: 'absolute',
          left: 92,
          right: 92,
          top: 74,
          display: 'flex',
          justifyContent: 'space-between',
          opacity: fade(f, 26, 48),
        }}
      >
        <Eyebrow>05 · KEEP IT ALIVE</Eyebrow>
        <div style={{fontFamily: sans, fontSize: 17, color: C.muted, letterSpacing: '.17em'}}>community corrections · new words · sources</div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          translate: '-50% -50%',
          width: 1500,
          textAlign: 'center',
          opacity: fade(f, 58, 82),
          scale: interpolate(f, [58, 150], [.96, 1.03], clamp),
        }}
      >
        <div style={{fontFamily: serif, fontSize: 122, lineHeight: .93, letterSpacing: '-.055em', color: C.ink}}>
          A dictionary stays alive
          <br />
          <span style={{color: C.purple, fontStyle: 'italic'}}>when people add to it.</span>
        </div>
      </div>
      <Noise />
    </AbsoluteFill>
  );
};

const Scene07End: React.FC = () => {
  const f = useCurrentFrame();
  const reveal = interpolate(f, [0, 34], [3, 126], {...clamp, easing: ease});
  const title = spring({frame: f - 18, fps: 30, config: {damping: 110, stiffness: 95}});

  return (
    <AbsoluteFill style={{overflow: 'hidden', background: C.night}}>
      <div style={{position: 'absolute', inset: 0, clipPath: `circle(${reveal}% at 50% 50%)`}}>
        <Img
          src={mayon}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: '50% 35%',
            scale: interpolate(f, [0, 135], [1.14, 1.04], clamp),
            opacity: .78,
          }}
        />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, rgba(8,9,13,.16), rgba(8,9,13,.92) 78%)'}} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          top: 72,
          display: 'flex',
          justifyContent: 'space-between',
          opacity: fade(f, 20, 42),
        }}
      >
        <Eyebrow>THE BIKOL LANGUAGE ARCHIVE</Eyebrow>
        <div style={{fontFamily: sans, fontSize: 16, color: C.ink2, letterSpacing: '.17em'}}>free · open access · community-built</div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 284,
          textAlign: 'center',
          opacity: title,
          translate: `0 ${interpolate(title, [0, 1], [42, 0])}px`,
        }}
      >
        <div style={{fontFamily: serif, fontSize: 178, lineHeight: .86, letterSpacing: '-.065em', color: C.ink}}>
          Bikol <span style={{fontStyle: 'italic', fontWeight: 400, color: C.gold}}>Dictionary</span>
        </div>
        <div style={{fontFamily: serif, fontSize: 52, color: C.ink2, marginTop: 38}}>
          Search it. Learn it. Add to it.
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 250,
          right: 250,
          bottom: 112,
          height: 106,
          borderRadius: 28,
          background: 'rgba(16,15,13,.72)',
          border: '1px solid rgba(255,255,255,.15)',
          backdropFilter: 'blur(18px)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          opacity: fade(f, 54, 76),
          boxShadow: '0 28px 80px rgba(0,0,0,.3)',
        }}
      >
        <div style={{fontFamily: sans, fontSize: 30, color: C.muted, marginRight: 20}}>⌕</div>
        <div style={{fontFamily: sans, fontSize: 38, color: C.ink, fontWeight: 600}}>magayon</div>
        <div style={{marginLeft: 'auto', fontFamily: sans, fontSize: 15, letterSpacing: '.18em', textTransform: 'uppercase', color: C.gold}}>bikoldictionary.app</div>
      </div>
      <Noise opacity={0.05} />
    </AbsoluteFill>
  );
};

export const BikolArchive30: React.FC = () => {
  return (
    <AbsoluteFill style={{background: C.black}}>
      <Sequence from={0} durationInFrames={126}>
        <Scene01Hook />
      </Sequence>
      <Sequence from={96} durationInFrames={172}>
        <Scene02Search />
      </Sequence>
      <Sequence from={242} durationInFrames={152}>
        <Scene03Dialect />
      </Sequence>
      <Sequence from={368} durationInFrames={170}>
        <Scene04Conjugation />
      </Sequence>
      <Sequence from={510} durationInFrames={172}>
        <Scene05Practice />
      </Sequence>
      <Sequence from={652} durationInFrames={152}>
        <Scene06Archive />
      </Sequence>
      <Sequence from={770} durationInFrames={130}>
        <Scene07End />
      </Sequence>
    </AbsoluteFill>
  );
};
