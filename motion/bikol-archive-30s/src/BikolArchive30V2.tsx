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
  bg: '#0E0D0B',
  bg2: '#15130F',
  surface: '#1E1C18',
  surface2: '#28241E',
  ink: '#F5F2EC',
  inkDim: '#D4CFC3',
  muted: '#8A8780',
  border: '#353228',
  purple: '#A580C0',
  purpleDeep: '#715187',
  purpleLight: '#DCCAE8',
  gold: '#E9C988',
  rust: '#C07A50',
  paper: '#FAFAF8',
  paper2: '#EFEAE0',
  darkInk: '#1C1B19',
  darkMuted: '#6B6760',
};

const serif = "Georgia, 'Times New Roman', serif";
const sans = "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const mayon = 'https://raw.githubusercontent.com/Yahiro025/bicol-app/main/public/images/mayon-hero.png';
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const M = 96;

const p = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], {...clamp, easing: ease});

const Noise: React.FC<{opacity?: number}> = ({opacity = 0.035}) => (
  <AbsoluteFill
    style={{
      opacity,
      pointerEvents: 'none',
      mixBlendMode: 'soft-light',
      backgroundImage:
        'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 180 180\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.72\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'.75\'/%3E%3C/svg%3E")',
    }}
  />
);

const Rule: React.FC<{light?: boolean}> = ({light = false}) => (
  <div style={{height: 1, width: '100%', background: light ? 'rgba(28,27,25,.16)' : 'rgba(245,242,236,.16)'}} />
);

const Eyebrow: React.FC<{children: React.ReactNode; dark?: boolean}> = ({children, dark = false}) => (
  <div
    style={{
      fontFamily: sans,
      fontSize: 18,
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '.24em',
      color: dark ? C.purpleDeep : C.gold,
    }}
  >
    {children}
  </div>
);

const SearchBar: React.FC<{query?: string; compact?: boolean}> = ({query = 'magayon', compact = false}) => (
  <div
    style={{
      width: '100%',
      height: compact ? 94 : 112,
      borderRadius: compact ? 24 : 30,
      border: `1px solid ${C.border}`,
      background: 'rgba(30,28,24,.96)',
      display: 'flex',
      alignItems: 'center',
      padding: compact ? '0 30px' : '0 38px',
      boxShadow: '0 26px 70px rgba(0,0,0,.32)',
    }}
  >
    <div style={{fontFamily: sans, fontSize: compact ? 28 : 34, color: C.muted, marginRight: 20}}>⌕</div>
    <div style={{fontFamily: sans, fontSize: compact ? 29 : 36, fontWeight: 700, color: C.ink}}>{query}</div>
    <div style={{width: 3, height: compact ? 36 : 44, background: C.purple, marginLeft: 8}} />
    <div style={{marginLeft: 'auto', fontFamily: sans, fontSize: compact ? 17 : 19, color: C.muted, letterSpacing: '.04em'}}>Search Bikol</div>
  </div>
);

const Pill: React.FC<{children: React.ReactNode; accent?: boolean; light?: boolean}> = ({children, accent = false, light = false}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 38,
      padding: '0 16px',
      borderRadius: 999,
      fontFamily: sans,
      fontSize: 15,
      fontWeight: 750,
      letterSpacing: '.1em',
      textTransform: 'uppercase',
      border: `1px solid ${light ? 'rgba(28,27,25,.16)' : C.border}`,
      background: accent ? C.purple : light ? 'rgba(28,27,25,.04)' : C.surface2,
      color: accent ? '#fff' : light ? C.darkMuted : C.inkDim,
    }}
  >
    {children}
  </div>
);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const intro = spring({frame, fps, config: {damping: 120, stiffness: 105, mass: 1.05}});
  const thesis = p(frame, 35, 58);
  const compress = p(frame, 90, 119);

  return (
    <AbsoluteFill style={{background: '#05070D', overflow: 'hidden'}}>
      <Img
        src={mayon}
        style={{
          width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 38%',
          scale: interpolate(frame, [0, 120], [1.06, 1.14], clamp),
          opacity: interpolate(compress, [0, 1], [.9, .18]),
        }}
      />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(5,7,13,.84) 0%, rgba(5,7,13,.46) 55%, rgba(5,7,13,.73) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,7,13,.05) 0%, rgba(5,7,13,.2) 48%, #0E0D0B 100%)'}} />
      <div style={{position: 'absolute', left: M, top: 70, opacity: interpolate(frame, [10, 28], [0, 1], clamp)}}><Eyebrow>One Bikol word</Eyebrow></div>
      <div
        style={{
          position: 'absolute',
          left: interpolate(compress, [0, 1], [M, 170]),
          top: interpolate(compress, [0, 1], [210, 114]),
          fontFamily: serif,
          fontSize: interpolate(compress, [0, 1], [282, 36]),
          lineHeight: .85,
          letterSpacing: interpolate(compress, [0, 1], [-13, -1]),
          fontWeight: 700,
          color: C.ink,
          opacity: intro,
          scale: interpolate(intro, [0, 1], [.91, 1]),
          transformOrigin: 'left top',
          zIndex: 4,
        }}
      >MAGAYON</div>
      <div style={{position: 'absolute', left: M + 10, top: 520, opacity: interpolate(frame, [20, 42, 90, 112], [0, 1, 1, 0], clamp), display: 'flex', alignItems: 'center', gap: 18}}>
        <div style={{fontFamily: serif, fontSize: 62, color: C.inkDim}}>beautiful</div>
        <div style={{height: 2, width: 120, background: C.gold}} />
        <div style={{fontFamily: sans, fontSize: 20, textTransform: 'uppercase', letterSpacing: '.18em', color: C.gold}}>translation</div>
      </div>
      <div style={{position: 'absolute', left: M, bottom: 110, fontFamily: serif, fontSize: 78, letterSpacing: '-.035em', color: C.ink, opacity: thesis, translate: `0 ${interpolate(thesis, [0, 1], [30, 0])}px`}}>
        One translation is not the whole story.
      </div>
      <div style={{position: 'absolute', left: M, right: M, top: 88, opacity: compress, scale: interpolate(compress, [0, 1], [.96, 1]), transformOrigin: 'left top', zIndex: 3}}>
        <SearchBar query="magayon" />
      </div>
      <Noise opacity={.06} />
    </AbsoluteFill>
  );
};

const SearchScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const result = spring({frame: frame - 10, fps, config: {damping: 110, stiffness: 110}});
  const side = spring({frame: frame - 20, fps, config: {damping: 110, stiffness: 100}});
  const exit = p(frame, 135, 164);

  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: M, right: M, top: 88}}><SearchBar query="magayon" /></div>
      <div style={{position: 'absolute', left: M, right: M, top: 238, bottom: 92, display: 'grid', gridTemplateColumns: '1.65fr .85fr', gap: 30}}>
        <div style={{position: 'relative', border: `1px solid ${C.border}`, borderRadius: 30, background: C.surface, padding: '56px 62px', opacity: result, translate: `0 ${interpolate(result, [0, 1], [60, 0])}px`, overflow: 'hidden'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <div><Eyebrow>Dictionary entry</Eyebrow><div style={{fontFamily: serif, fontSize: 142, letterSpacing: '-.05em', color: C.purpleLight, marginTop: 14}}>magayon</div></div>
            <Pill accent>adjective</Pill>
          </div>
          <div style={{fontFamily: serif, fontSize: 64, color: C.ink, marginTop: 18}}>beautiful · lovely</div>
          <div style={{marginTop: 40}}><Rule /></div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginTop: 40}}>
            <div>
              <div style={{fontFamily: sans, color: C.muted, fontSize: 16, textTransform: 'uppercase', letterSpacing: '.16em'}}>Example</div>
              <div style={{fontFamily: serif, color: C.ink, fontSize: 39, lineHeight: 1.24, marginTop: 12}}>“Magayon an aldaw.”</div>
              <div style={{fontFamily: sans, color: C.muted, fontSize: 20, marginTop: 9}}>A beautiful day.</div>
            </div>
            <div>
              <div style={{fontFamily: sans, color: C.muted, fontSize: 16, textTransform: 'uppercase', letterSpacing: '.16em'}}>Available detail</div>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14}}><Pill>pronunciation</Pill><Pill>etymology</Pill><Pill>examples</Pill><Pill>sources</Pill></div>
            </div>
          </div>
          <div style={{position: 'absolute', left: 62, bottom: 46, right: 62, display: 'flex', gap: 22, alignItems: 'center'}}>
            <div style={{fontFamily: sans, fontSize: 16, color: C.muted, textTransform: 'uppercase', letterSpacing: '.15em'}}>Source trail</div>
            <div style={{flex: 1}}><Rule /></div>
            <div style={{fontFamily: sans, fontSize: 18, color: C.inkDim}}>Mintz · Wiktionary · LearnBikol.com</div>
          </div>
        </div>
        <div style={{border: `1px solid ${C.border}`, borderRadius: 30, background: C.surface2, padding: 38, opacity: side, translate: `${interpolate(side, [0, 1], [70, 0])}px 0`, display: 'flex', flexDirection: 'column'}}>
          <Eyebrow>Context</Eyebrow>
          <div style={{fontFamily: serif, fontSize: 58, color: C.ink, lineHeight: 1.02, marginTop: 20}}>A word lives in layers.</div>
          <div style={{marginTop: 28}}><Rule /></div>
          {['Dialect', 'Pronunciation', 'Etymology', 'Source'].map((label, i) => (
            <div key={label} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '27px 0', borderBottom: `1px solid ${C.border}`}}>
              <div style={{fontFamily: sans, fontSize: 19, color: C.inkDim}}>{label}</div>
              <div style={{fontFamily: serif, fontSize: 29, color: i === 0 ? C.purpleLight : C.ink}}>{['Central Bikol', '/ma.ga.jon/', 'available', 'attached'][i]}</div>
            </div>
          ))}
          <div style={{marginTop: 'auto', fontFamily: sans, fontSize: 19, lineHeight: 1.5, color: C.muted}}>Context stays attached to the entry instead of being flattened into one translation.</div>
        </div>
      </div>
      <div style={{position: 'absolute', right: interpolate(exit, [0, 1], [135, -80]), top: interpolate(exit, [0, 1], [455, -230]), width: interpolate(exit, [0, 1], [250, 2200]), height: interpolate(exit, [0, 1], [80, 1500]), borderRadius: 999, background: C.purple, opacity: exit, zIndex: 8}} />
      <Noise />
    </AbsoluteFill>
  );
};

const DIALECTS = ['CENTRAL', 'RINCONADA', 'ALBAY', 'CATANDUANES', 'SORSOGON'];

const DialectScene: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = p(frame, 0, 24);
  const compress = p(frame, 128, 164);

  return (
    <AbsoluteFill style={{background: C.paper, color: C.darkInk, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, background: C.purple, clipPath: `circle(${interpolate(reveal, [0, 1], [150, 0])}% at 100% 45%)`, zIndex: 5}} />
      <div style={{position: 'absolute', left: M, top: 72, right: M, display: 'flex', alignItems: 'center', gap: 28}}>
        <Eyebrow dark>Context is not decoration</Eyebrow><div style={{flex: 1}}><Rule light /></div><div style={{fontFamily: sans, fontSize: 16, color: C.darkMuted, letterSpacing: '.13em', textTransform: 'uppercase'}}>Dialect · source · pronunciation</div>
      </div>
      <div style={{position: 'absolute', left: M, top: 158, width: 500}}>
        <div style={{fontFamily: serif, fontSize: 390, lineHeight: .78, letterSpacing: '-.08em', color: C.purpleDeep}}>5</div>
        <div style={{fontFamily: serif, fontSize: 68, lineHeight: .97, letterSpacing: '-.035em', marginTop: 28}}>historical Bikol<br/>dialects.</div>
      </div>
      <div style={{position: 'absolute', left: 650, right: M, top: 165, bottom: 88, overflow: 'hidden'}}>
        {DIALECTS.map((name, i) => {
          const rowIn = p(frame, 12 + i * 7, 35 + i * 7);
          const x = interpolate(frame, [0, 165], [i % 2 === 0 ? 110 : -40, i % 2 === 0 ? -35 : 70], clamp);
          return (
            <div key={name} style={{height: 148, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(28,27,25,.15)', opacity: rowIn, translate: `${x}px 0`}}>
              <div style={{fontFamily: serif, fontSize: 104, lineHeight: 1, letterSpacing: '-.045em', color: i === 0 ? C.purpleDeep : C.darkInk}}>{name}</div>
              <div style={{marginLeft: 'auto', fontFamily: sans, fontSize: 17, color: C.darkMuted, letterSpacing: '.14em', textTransform: 'uppercase'}}>preserve the difference</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: M, right: M, top: interpolate(compress, [0, 1], [1030, 535]), height: interpolate(compress, [0, 1], [1, 4]), background: C.purpleDeep, opacity: compress, zIndex: 7}} />
      <Noise opacity={.028} />
    </AbsoluteFill>
  );
};

const VerbState: React.FC<{word: string; sub: string; x: number; active: number}> = ({word, sub, x, active}) => (
  <div style={{position: 'absolute', left: x, top: 470, width: 390, opacity: .35 + active * .65}}>
    <div style={{fontFamily: serif, fontSize: 76, letterSpacing: '-.045em', color: active > .4 ? C.purpleLight : C.ink}}>{word}</div>
    <div style={{fontFamily: sans, fontSize: 15, color: C.muted, textTransform: 'uppercase', letterSpacing: '.17em', marginTop: 10}}>{sub}</div>
  </div>
);

const VerbScene: React.FC = () => {
  const frame = useCurrentFrame();
  const phase = interpolate(frame, [0, 149], [0, 3], clamp);
  const exit = p(frame, 118, 149);
  const active = (i: number) => Math.max(0, 1 - Math.abs(phase - i));

  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: M, top: 74, right: M, display: 'flex', alignItems: 'center', gap: 26}}><Eyebrow>Grammar in motion</Eyebrow><div style={{flex: 1}}><Rule /></div></div>
      <div style={{position: 'absolute', left: M, top: 158, fontFamily: serif, fontSize: 98, letterSpacing: '-.045em', color: C.ink}}>Words don’t sit still.</div>
      <div style={{position: 'absolute', left: M, top: 320, right: M, height: 4, background: C.purpleDeep}} />
      <VerbState word="bakal" sub="root · buy" x={M} active={active(0)} />
      <VerbState word="magbakal" sub="intent / actor focus" x={485} active={active(1)} />
      <VerbState word="nagbakal" sub="completed" x={930} active={active(2)} />
      <VerbState word="mabakal" sub="contemplated" x={1375} active={active(3)} />
      <div style={{position: 'absolute', left: interpolate(phase, [0, 3], [M, 1375], clamp), top: 438, width: 390, height: 184, borderRadius: 24, border: `1px solid ${C.purple}`, boxShadow: '0 0 55px rgba(165,128,192,.13)'}} />
      <div style={{position: 'absolute', left: M, bottom: 110, width: 920, fontFamily: sans, fontSize: 27, lineHeight: 1.45, color: C.inkDim}}>The conjugator keeps the root visible while tense and focus transform around it.</div>
      <div style={{position: 'absolute', right: M, bottom: 108, fontFamily: serif, fontSize: 40, color: C.gold}}>bakal → meaning in motion</div>
      {[0,1,2].map((i) => <div key={i} style={{position: 'absolute', left: M + i * 578, top: interpolate(exit, [0,1], [1080, 246]), width: 546, height: 760, borderRadius: 28, background: i === 1 ? C.paper2 : C.paper, opacity: exit, zIndex: 10}} />)}
      <Noise />
    </AbsoluteFill>
  );
};

const LearnPanel: React.FC<{title: string; kicker: string; index: number}> = ({title, kicker, index}) => {
  const frame = useCurrentFrame();
  const t = p(frame, 6 + index * 6, 30 + index * 6);
  const flip = Math.sin(Math.max(0, frame - 35 - index * 8) / 18) * .5 + .5;

  return (
    <div style={{height: '100%', borderRadius: 28, background: index === 1 ? C.paper2 : C.paper, border: '1px solid rgba(28,27,25,.12)', padding: 36, color: C.darkInk, opacity: t, translate: `0 ${interpolate(t,[0,1],[35,0])}px`, overflow: 'hidden'}}>
      <div style={{fontFamily: sans, fontSize: 15, color: C.purpleDeep, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '.2em'}}>{kicker}</div>
      <div style={{fontFamily: serif, fontSize: 54, letterSpacing: '-.04em', marginTop: 8}}>{title}</div>
      <div style={{marginTop: 26}}><Rule light /></div>
      {index === 0 && <div style={{position: 'relative', marginTop: 52, height: 360}}><div style={{position: 'absolute', inset: 0, borderRadius: 26, background: C.darkInk, color: C.paper, padding: 38, rotate: `${interpolate(flip,[0,1],[-2,2])}deg`, translate: `0 ${interpolate(flip,[0,1],[8,-8])}px`}}><div style={{fontFamily: sans, fontSize: 15, letterSpacing: '.18em', textTransform: 'uppercase', color: C.gold}}>Bikol → English</div><div style={{fontFamily: serif, fontSize: 86, marginTop: 55}}>magayon</div><div style={{fontFamily: serif, fontSize: 42, color: C.purpleLight, marginTop: 18}}>beautiful</div></div></div>}
      {index === 1 && <div style={{marginTop: 58}}><div style={{fontFamily: sans, fontSize: 18, color: C.darkMuted}}>Transform the sentence</div><div style={{fontFamily: serif, fontSize: 46, lineHeight: 1.3, marginTop: 26}}>Nagbakal <span style={{color: C.purpleDeep}}>ako</span> nin tinapay.</div><div style={{height: 2, background: C.purpleDeep, width: interpolate(frame,[35,85],[0,360],clamp), marginTop: 24}} /><div style={{display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 34}}><Pill light>root</Pill><Pill light>focus</Pill><Pill light>tense</Pill></div></div>}
      {index === 2 && <div style={{marginTop: 46}}><div style={{display: 'flex', justifyContent: 'flex-start'}}><div style={{maxWidth: 340, borderRadius: '24px 24px 24px 6px', background: C.darkInk, color: C.paper, padding: '22px 26px', fontFamily: sans, fontSize: 21, lineHeight: 1.35}}>Dios mabalos. Kumusta?</div></div><div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 18}}><div style={{maxWidth: 330, borderRadius: '24px 24px 6px 24px', background: C.purpleDeep, color: '#fff', padding: '22px 26px', fontFamily: sans, fontSize: 21, lineHeight: 1.35}}>Marhay man. Ikaw?</div></div><div style={{fontFamily: sans, fontSize: 17, color: C.darkMuted, marginTop: 30}}>Practice in context, not isolation.</div></div>}
    </div>
  );
};

const LearnScene: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = p(frame, 120, 149);
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: M, right: M, top: 66, height: 132, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'}}>
        <div style={{fontFamily: serif, fontSize: 78, letterSpacing: '-.045em', color: C.darkInk}}>Don’t just look it up. <span style={{color: C.purpleDeep}}>Use it.</span></div>
        <div style={{fontFamily: sans, fontSize: 17, color: C.darkMuted, textTransform: 'uppercase', letterSpacing: '.16em', paddingBottom: 14}}>Recall · transform · speak</div>
      </div>
      <div style={{position: 'absolute', left: M, right: M, top: 228, bottom: 64, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28}}>
        <LearnPanel title="Flashcards" kicker="01 · Recall" index={0} />
        <LearnPanel title="Grammar" kicker="02 · Transform" index={1} />
        <LearnPanel title="Dialogue" kicker="03 · Use" index={2} />
      </div>
      <div style={{position: 'absolute', left: interpolate(exit,[0,1],[M,220]), right: interpolate(exit,[0,1],[M,220]), top: interpolate(exit,[0,1],[1080,310]), height: interpolate(exit,[0,1],[760,440]), borderRadius: 34, background: C.surface, opacity: exit, zIndex: 10}} />
      <Noise opacity={.025} />
    </AbsoluteFill>
  );
};

const CommunityScene: React.FC = () => {
  const frame = useCurrentFrame();
  const form = p(frame, 0, 24);
  const type = Math.floor(interpolate(frame, [28, 58], [0, 19], clamp));
  const text = 'correction + source'.slice(0, type);
  const submit = p(frame, 60, 86);

  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: M, top: 74, right: M, display: 'flex', alignItems: 'center', gap: 26}}><Eyebrow>A living archive</Eyebrow><div style={{flex: 1}}><Rule /></div></div>
      <div style={{position: 'absolute', left: M, top: 154, fontFamily: serif, fontSize: 92, lineHeight: .98, letterSpacing: '-.045em', color: C.ink, width: 1100}}>Accuracy grows<br/><span style={{color: C.purpleLight}}>with the community.</span></div>
      <div style={{position: 'absolute', left: 220, right: 220, top: 405, height: 440, borderRadius: 34, background: C.surface, border: `1px solid ${C.border}`, padding: 42, opacity: form, translate: `0 ${interpolate(form,[0,1],[50,0])}px`}}>
        <div style={{fontFamily: sans, fontSize: 16, color: C.gold, textTransform: 'uppercase', letterSpacing: '.19em', fontWeight: 800}}>Suggest a word · correction · definition · source</div>
        <div style={{marginTop: 28, height: 122, borderRadius: 22, background: C.surface2, border: `1px solid ${C.border}`, padding: '0 30px', display: 'flex', alignItems: 'center'}}><div style={{fontFamily: serif, fontSize: 44, color: C.ink}}>{text}</div><div style={{height: 50, width: 3, background: C.purple, marginLeft: 5}} /></div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 26}}><Pill>attach source</Pill><Pill>identify dialect</Pill><Pill>review</Pill><div style={{marginLeft: 'auto', width: 250, height: 66, borderRadius: 18, background: C.purple, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: sans, fontWeight: 800, fontSize: 18, letterSpacing: '.06em', scale: interpolate(submit,[0,1],[1,.96])}}>SUBMIT →</div></div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: interpolate(submit,[0,1],[0,1080]), background: C.purpleDeep, zIndex: 20}} />
      <Noise />
    </AbsoluteFill>
  );
};

const EndScene: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = p(frame, 0, 22);
  return (
    <AbsoluteFill style={{background: '#05070D', overflow: 'hidden'}}>
      <Img src={mayon} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '65% 39%', opacity: interpolate(reveal,[0,1],[.15,.8]), scale: interpolate(frame,[0,60],[1.08,1.03],clamp)}} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(5,7,13,.97) 0%, rgba(5,7,13,.78) 45%, rgba(5,7,13,.18) 100%)'}} />
      <div style={{position: 'absolute', left: M, top: 88}}><Eyebrow>The Bikol language archive</Eyebrow></div>
      <div style={{position: 'absolute', left: M, top: 205, width: 1030, opacity: reveal, translate: `${interpolate(reveal,[0,1],[-42,0])}px 0`}}>
        <div style={{fontFamily: serif, fontSize: 148, lineHeight: .88, letterSpacing: '-.055em', color: C.ink}}>BIKOL<br/><span style={{fontWeight: 400, fontStyle: 'italic', color: C.purpleLight}}>Dictionary</span></div>
        <div style={{fontFamily: sans, fontSize: 34, color: C.inkDim, marginTop: 56, letterSpacing: '-.01em'}}>Search it. Learn it. Keep it alive.</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 24, marginTop: 44}}><div style={{width: 82, height: 3, background: C.gold}} /><div style={{fontFamily: sans, fontSize: 20, color: C.gold, fontWeight: 750, letterSpacing: '.12em'}}>BIKOLDICTIONARY.APP</div></div>
      </div>
      <Noise opacity={.055} />
    </AbsoluteFill>
  );
};

export const BikolArchive30V2: React.FC = () => {
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Sequence from={0} durationInFrames={120}><HookScene /></Sequence>
      <Sequence from={120} durationInFrames={165}><SearchScene /></Sequence>
      <Sequence from={285} durationInFrames={165}><DialectScene /></Sequence>
      <Sequence from={450} durationInFrames={150}><VerbScene /></Sequence>
      <Sequence from={600} durationInFrames={150}><LearnScene /></Sequence>
      <Sequence from={750} durationInFrames={90}><CommunityScene /></Sequence>
      <Sequence from={840} durationInFrames={60}><EndScene /></Sequence>
    </AbsoluteFill>
  );
};
