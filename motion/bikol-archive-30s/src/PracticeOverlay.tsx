import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

const C = {
  paper: '#FAFAF8',
  paper2: '#EFEAE0',
  ink: '#1C1B19',
  muted: '#6B6760',
  purple: '#715187',
  purpleLight: '#DCCAE8',
  rust: '#A85E3B',
  gold: '#A9823C',
  line: '#D4CFC5',
};

const serif = "Georgia, 'Times New Roman', serif";
const sans = "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = Easing.bezier(0.16, 1, 0.3, 1);

const Label: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{fontFamily: sans, fontSize: 16, fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', color: C.purple}}>{children}</div>
);

const Token: React.FC<{text: string; active?: boolean}> = ({text, active = false}) => (
  <div style={{padding: '14px 22px', border: `1px solid ${active ? C.purple : C.line}`, background: active ? '#F0E7F6' : '#FFFDF9', fontFamily: serif, fontSize: 34, color: C.ink, boxShadow: active ? '0 12px 32px rgba(113,81,135,.12)' : 'none'}}>{text}</div>
);

const FeatureLine: React.FC<{frame:number; start:number; index:string; verb:string; detail:string; accent:string}> = ({frame,start,index,verb,detail,accent}) => {
  const {fps} = useVideoConfig();
  const s = spring({frame: frame-start, fps, config:{damping:100, stiffness:120}});
  return (
    <div style={{display:'grid',gridTemplateColumns:'140px 470px 1fr',alignItems:'center',height:176,borderTop:`1px solid ${C.line}`,opacity:s,translate:`${interpolate(s,[0,1],[120,0])}px 0`}}>
      <div style={{fontFamily:sans,fontSize:14,fontWeight:800,letterSpacing:'.18em',color:C.muted}}>{index}</div>
      <div style={{fontFamily:sans,fontSize:82,fontWeight:900,letterSpacing:'-.055em',textTransform:'uppercase',color:accent}}>{verb}</div>
      <div style={{fontFamily:serif,fontSize:43,lineHeight:1.05,color:C.ink}}>{detail}</div>
    </div>
  );
};

export const PracticeOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const reveal = interpolate(frame,[0,18],[100,0],{...clamp,easing:ease});
  const exit = interpolate(frame,[142,172],[0,100],{...clamp,easing:Easing.bezier(.7,0,.3,1)});
  const wordProgress = spring({frame:frame-14,fps,config:{damping:100,stiffness:100}});
  const chipIn = spring({frame:frame-38,fps,config:{damping:105,stiffness:120}});
  const rootShift = interpolate(frame,[62,108],[0,1],{...clamp,easing:ease});
  const chatIn = spring({frame:frame-94,fps,config:{damping:100,stiffness:120}});

  return (
    <AbsoluteFill style={{clipPath:`inset(0 ${exit}% 0 ${reveal}%)`,background:C.paper,color:C.ink,overflow:'hidden'}}>
      <div style={{position:'absolute',left:72,right:72,top:54,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <Label>04 · PRACTICE</Label>
        <div style={{fontFamily:sans,fontSize:15,fontWeight:750,letterSpacing:'.14em',textTransform:'uppercase',color:C.muted}}>lookup → pattern → context</div>
      </div>

      <div style={{position:'absolute',left:70,top:130,width:540,opacity:wordProgress,translate:`${interpolate(wordProgress,[0,1],[-70,0])}px 0`}}>
        <div style={{fontFamily:serif,fontSize:74,lineHeight:.94,letterSpacing:'-.045em'}}>Don’t just remember it.</div>
        <div style={{fontFamily:serif,fontSize:94,lineHeight:.9,letterSpacing:'-.055em',fontStyle:'italic',color:C.purple,marginTop:14}}>Use it.</div>
      </div>

      <div style={{position:'absolute',left:690,right:70,top:120,bottom:58}}>
        <FeatureLine frame={frame} start={20} index="01" verb="LOOK" detail="Find the word and its source trail." accent={C.ink}/>
        <FeatureLine frame={frame} start={46} index="02" verb="MOVE" detail="See the root stay while the form changes." accent={C.purple}/>
        <FeatureLine frame={frame} start={76} index="03" verb="SAY" detail="Put the word into a real exchange." accent={C.rust}/>
        <FeatureLine frame={frame} start={108} index="04" verb="USE" detail="Repeat the pattern until it becomes familiar." accent={C.gold}/>
      </div>

      <div style={{position:'absolute',left:76,bottom:76,width:520,height:220,borderTop:`1px solid ${C.line}`,paddingTop:26,opacity:chipIn}}>
        <div style={{fontFamily:sans,fontSize:13,fontWeight:800,letterSpacing:'.18em',textTransform:'uppercase',color:C.muted}}>A word moves through the system</div>
        <div style={{display:'flex',gap:10,alignItems:'center',marginTop:20,translate:`${interpolate(rootShift,[0,1],[0,54])}px 0`}}>
          <Token text="bakal" active/>
          <div style={{fontFamily:sans,fontSize:28,color:C.muted}}>→</div>
          <Token text={rootShift < .48 ? 'mag + bakal' : 'nag + bakal'} active/>
        </div>
        <div style={{position:'absolute',left:0,bottom:0,display:'flex',gap:10,opacity:chatIn,translate:`0 ${interpolate(chatIn,[0,1],[28,0])}px`}}>
          <div style={{padding:'11px 17px',background:C.paper2,border:`1px solid ${C.line}`,fontFamily:sans,fontSize:15,color:C.muted}}>flashcard</div>
          <div style={{padding:'11px 17px',background:'#F0E7F6',border:'1px solid #D5C3E1',fontFamily:sans,fontSize:15,color:C.purple}}>grammar drill</div>
          <div style={{padding:'11px 17px',background:'#F4E4DA',border:'1px solid #E4C6B5',fontFamily:sans,fontSize:15,color:C.rust}}>dialogue</div>
        </div>
      </div>

      <div style={{position:'absolute',left:0,bottom:0,width:'100%',height:12,background:`linear-gradient(90deg, ${C.purple}, ${C.rust}, ${C.gold})`,scaleX:interpolate(frame,[8,154],[0,1],clamp),transformOrigin:'left'}}/>
    </AbsoluteFill>
  );
};
