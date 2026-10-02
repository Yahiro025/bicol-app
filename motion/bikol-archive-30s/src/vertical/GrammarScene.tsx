import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, appear, clamp, sans, serif} from './theme';

const forms = [['bakal','ROOT · BUY'],['magbakal','ACTOR FOCUS'],['nagbakal','COMPLETED'],['mabakal','CONTEMPLATED']];

export const GrammarScene: React.FC = () => {
  const frame = useCurrentFrame();
  const intro = appear(frame, 0, 22);
  const phase = interpolate(frame, [24, 126], [0, 3], clamp);
  const exit = appear(frame, 126, 149);
  return (
    <AbsoluteFill style={{background:C.bg,color:C.ink,overflow:'hidden'}}>
      <div style={{position:'absolute',left:84,top:94,fontFamily:sans,fontSize:16,fontWeight:800,letterSpacing:'.18em',color:C.gold}}>GRAMMAR IN MOTION</div>
      <div style={{position:'absolute',left:84,right:84,top:158,fontFamily:serif,fontSize:78,lineHeight:.98,letterSpacing:'-.04em',opacity:intro}}>Words don’t<br/><span style={{color:C.purpleLight}}>sit still.</span></div>
      <div style={{position:'absolute',left:84,right:84,top:430,height:1,background:C.line}} />
      <div style={{position:'absolute',left:84,right:84,top:505}}>
        {forms.map(([word,note],i)=>{const active=Math.max(0,1-Math.abs(phase-i));return <div key={word} style={{height:220,borderBottom:`1px solid ${C.line}`,display:'grid',gridTemplateColumns:'1fr 240px',alignItems:'center',opacity:.26+active*.74,translate:`${interpolate(active,[0,1],[18,0])}px 0`}}>
          <div style={{fontFamily:serif,fontSize:76,letterSpacing:'-.045em',color:active>.5?C.purpleLight:C.ink}}>{word}</div>
          <div style={{fontFamily:sans,fontSize:14,color:active>.5?C.gold:C.muted,textAlign:'right',letterSpacing:'.12em'}}>{note}</div>
        </div>;})}
      </div>
      <div style={{position:'absolute',left:84,right:84,bottom:88,fontFamily:sans,fontSize:25,lineHeight:1.4,color:C.inkDim}}>Keep the root visible. Let tense and focus move around it.</div>
      <div style={{position:'absolute',left:0,right:0,bottom:0,height:`${exit*100}%`,background:C.paper}} />
    </AbsoluteFill>
  );
};
