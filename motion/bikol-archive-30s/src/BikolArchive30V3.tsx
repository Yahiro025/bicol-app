import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {BikolArchive30V2} from './BikolArchive30V2';

const serif = "Georgia, 'Times New Roman', serif";
const sans = "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const purple = '#A580C0';
const purpleDeep = '#715187';
const paper = '#FAFAF8';
const ink = '#F5F2EC';
const dark = '#0E0D0B';
const raised = '#1E1C18';
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = Easing.bezier(0.16, 1, 0.3, 1);

const HookQueryBridge: React.FC = () => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [0, 15], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{position:'absolute', left:126, top:90, width:430, height:108, background:raised, borderRadius:27, opacity:a}}>
      <div style={{position:'absolute', left:44, top:31, fontFamily:sans, fontSize:36, fontWeight:700, color:ink}}>magayon</div>
      <div style={{position:'absolute', left:196, top:30, width:3, height:46, background:purple}} />
    </div>
  );
};

const DialectBridge: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 10], [0, 1], {...clamp, easing: ease});
  const leave = interpolate(frame, [18, 33], [1, 0], {...clamp, easing: ease});
  const s = interpolate(frame, [0, 18, 33], [.78, 1.08, .58], clamp);
  const y = interpolate(frame, [18, 33], [0, -300], {...clamp, easing: ease});
  return (
    <AbsoluteFill style={{pointerEvents:'none', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{fontFamily:serif, fontSize:190, fontWeight:700, letterSpacing:'-.055em', color:ink, opacity:Math.min(enter, leave), scale:s, translate:`0 ${y}px`}}>DIALECT</div>
      <div style={{position:'absolute', bottom:170, fontFamily:sans, fontSize:18, fontWeight:800, letterSpacing:'.22em', textTransform:'uppercase', color:'rgba(255,255,255,.75)', opacity:Math.min(enter, leave)}}>context changes the reading</div>
    </AbsoluteFill>
  );
};

const LearnBridge: React.FC = () => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [0, 12, 24, 32], [0, 1, 1, 0], clamp);
  const labels = ['RECALL', 'TRANSFORM', 'SPEAK'];
  return (
    <AbsoluteFill style={{pointerEvents:'none'}}>
      {labels.map((label, i) => (
        <div key={label} style={{position:'absolute', left:96 + i*578, top:545, width:546, textAlign:'center', fontFamily:serif, fontSize:56, letterSpacing:'-.04em', color:'#1C1B19', opacity:a}}>{label}</div>
      ))}
    </AbsoluteFill>
  );
};

const ContributionBridge: React.FC = () => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [0, 10, 26, 38], [0, 1, 1, 0], clamp);
  return (
    <div style={{position:'absolute', left:220, right:220, top:405, height:440, borderRadius:34, background:'#1E1C18', border:'1px solid #353228', opacity:a, pointerEvents:'none'}}>
      <div style={{position:'absolute', left:42, top:38, fontFamily:sans, fontSize:16, color:'#E9C988', textTransform:'uppercase', letterSpacing:'.19em', fontWeight:800}}>CONTRIBUTE TO THE ARCHIVE</div>
      <div style={{position:'absolute', left:42, right:42, top:92, height:1, background:'rgba(245,242,236,.14)'}} />
    </div>
  );
};

const EndBridge: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 25, 40], [0, 0, 1], {...clamp, easing: ease});
  const wordX = interpolate(frame, [0, 25, 40], [0, 0, -555], {...clamp, easing: ease});
  const wordY = interpolate(frame, [0, 25, 40], [0, 0, -135], {...clamp, easing: ease});
  const wordScale = interpolate(frame, [0, 25, 40], [1, 1.08, .6], {...clamp, easing: ease});
  const fade = interpolate(frame, [34, 43], [1, 0], clamp);
  return (
    <AbsoluteFill style={{pointerEvents:'none'}}>
      <div style={{position:'absolute', inset:0, background:purpleDeep, clipPath:`inset(0 ${t*100}% 0 0)`, zIndex:2}} />
      <div style={{position:'absolute', left:0, right:0, top:350, textAlign:'center', fontFamily:serif, fontSize:230, lineHeight:.82, fontWeight:700, letterSpacing:'-.06em', color:paper, translate:`${wordX}px ${wordY}px`, scale:wordScale, opacity:fade, zIndex:3}}>BIKOL</div>
      <div style={{position:'absolute', left:0, right:0, top:615, textAlign:'center', fontFamily:sans, fontSize:18, fontWeight:800, textTransform:'uppercase', letterSpacing:'.24em', color:'#E9C988', opacity:interpolate(frame,[5,16,28,36],[0,1,1,0],clamp), zIndex:3}}>a language kept in motion</div>
    </AbsoluteFill>
  );
};

export const BikolArchive30V3: React.FC = () => (
  <AbsoluteFill style={{background:dark}}>
    <BikolArchive30V2 />
    <Sequence from={105} durationInFrames={15}><HookQueryBridge /></Sequence>
    <Sequence from={267} durationInFrames={33}><DialectBridge /></Sequence>
    <Sequence from={580} durationInFrames={32}><LearnBridge /></Sequence>
    <Sequence from={735} durationInFrames={38}><ContributionBridge /></Sequence>
    <Sequence from={815} durationInFrames={43}><EndBridge /></Sequence>
  </AbsoluteFill>
);
