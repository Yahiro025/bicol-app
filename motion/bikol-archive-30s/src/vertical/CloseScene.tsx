import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {MayonMark} from './MayonMark';
import {C, appear, sans, serif} from './theme';

export const CloseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const bg = appear(frame, 0, 20);
  const title = appear(frame, 14, 38);
  const cta = appear(frame, 42, 68);
  return (
    <AbsoluteFill style={{background:C.bg,overflow:'hidden',color:C.ink}}>
      <AbsoluteFill style={{background:`linear-gradient(180deg, ${C.purpleDeep} 0%, ${C.bg} 48%)`,opacity:interpolate(bg,[0,1],[1,.48])}} />
      <div style={{position:'absolute',left:-35,right:-35,bottom:40}}><MayonMark opacity={0.52} /></div>
      <div style={{position:'absolute',left:84,right:84,top:130,opacity:title,translate:`0 ${interpolate(title,[0,1],[32,0])}px`}}>
        <div style={{fontFamily:sans,fontSize:16,fontWeight:800,letterSpacing:'.2em',color:C.gold}}>THE BIKOL LANGUAGE ARCHIVE</div>
        <div style={{fontFamily:serif,fontSize:118,lineHeight:.88,letterSpacing:'-.055em',marginTop:34}}>BIKOL<br/><span style={{fontStyle:'italic',fontWeight:400,color:C.purpleLight}}>Dictionary</span></div>
        <div style={{fontFamily:serif,fontSize:48,lineHeight:1.08,marginTop:42,color:C.inkDim}}>A language kept<br/>in motion.</div>
      </div>
      <div style={{position:'absolute',left:84,right:84,bottom:125,opacity:cta}}>
        <div style={{height:2,width:90,background:C.gold,marginBottom:26}} />
        <div style={{fontFamily:sans,fontSize:30,fontWeight:750,letterSpacing:'-.01em'}}>Search it. Study it. Add to it.</div>
      </div>
    </AbsoluteFill>
  );
};
