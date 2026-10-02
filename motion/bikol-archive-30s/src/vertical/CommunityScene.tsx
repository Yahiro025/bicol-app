import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, appear, clamp, sans, serif} from './theme';

export const CommunityScene: React.FC = () => {
  const frame = useCurrentFrame();
  const panel = appear(frame, 5, 28);
  const count = Math.floor(interpolate(frame,[30,66],[0,19],clamp));
  const typed = 'correction + source'.slice(0,count);
  const review = appear(frame, 66, 94);
  const exit = appear(frame, 101, 119);
  return (
    <AbsoluteFill style={{background:C.bg,color:C.ink,overflow:'hidden'}}>
      <div style={{position:'absolute',left:84,right:84,top:98}}>
        <div style={{fontFamily:sans,fontSize:16,fontWeight:800,letterSpacing:'.18em',color:C.gold}}>A LIVING ARCHIVE</div>
        <div style={{fontFamily:serif,fontSize:76,lineHeight:.98,letterSpacing:'-.04em',marginTop:26}}>Accuracy grows<br/><span style={{color:C.purpleLight}}>with the community.</span></div>
      </div>
      <div style={{position:'absolute',left:84,right:84,top:485,bottom:150,border:`1px solid ${C.line}`,borderRadius:30,background:C.bg2,padding:38,opacity:panel,translate:`0 ${interpolate(panel,[0,1],[40,0])}px`}}>
        <div style={{fontFamily:sans,fontSize:14,color:C.muted,letterSpacing:'.14em'}}>SUGGEST · CORRECT · CITE · REVIEW</div>
        <div style={{height:118,border:`1px solid ${C.line}`,borderRadius:20,marginTop:26,padding:'0 24px',display:'flex',alignItems:'center',fontFamily:serif,fontSize:38}}>{typed}<span style={{width:3,height:44,background:C.purple,marginLeft:5}} /></div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:24}}>{['attach source','identify dialect','review'].map((x)=><div key={x} style={{border:`1px solid ${C.line}`,borderRadius:999,padding:'10px 14px',fontFamily:sans,fontSize:13,color:C.inkDim}}>{x}</div>)}</div>
        <div style={{position:'absolute',left:38,right:38,bottom:40,display:'flex',alignItems:'center'}}>
          <div style={{fontFamily:sans,fontSize:16,color:C.muted}}>Maintained by people, not merely stored.</div>
          <div style={{marginLeft:'auto',border:`1px solid ${C.gold}`,padding:'13px 18px',fontFamily:sans,fontWeight:800,fontSize:14,letterSpacing:'.13em',color:C.gold,opacity:review,rotate:'-2deg'}}>REVIEWED</div>
        </div>
      </div>
      <div style={{position:'absolute',inset:0,background:C.purpleDeep,clipPath:`inset(0 0 ${(1-exit)*100}% 0)`}} />
    </AbsoluteFill>
  );
};
