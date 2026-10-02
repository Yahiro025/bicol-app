import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {MayonMark} from './MayonMark';
import {C, appear, sans, serif} from './theme';

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const word = appear(frame, 8, 28);
  const meaning = appear(frame, 28, 48);
  const punch = appear(frame, 55, 78);
  const wipe = appear(frame, 98, 119);
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 38%, #23202A 0%, #0D0C0B 63%)'}} />
      <div style={{position:'absolute',left:84,top:94,fontFamily:sans,fontSize:21,fontWeight:800,letterSpacing:'.2em',color:C.gold,textTransform:'uppercase'}}>THE BIKOL LANGUAGE ARCHIVE</div>
      <div style={{position:'absolute',left:78,right:78,top:275}}>
        <div style={{fontFamily:serif,fontSize:154,fontWeight:700,lineHeight:.88,letterSpacing:'-.065em',color:C.ink,opacity:word,translate:`0 ${interpolate(word,[0,1],[46,0])}px`}}>magayon</div>
        <div style={{display:'flex',alignItems:'center',gap:24,marginTop:35,opacity:meaning}}>
          <div style={{width:92,height:2,background:C.gold}} />
          <div style={{fontFamily:serif,fontSize:92,fontStyle:'italic',letterSpacing:'-.045em',color:C.purpleLight}}>beautiful</div>
        </div>
      </div>
      <div style={{position:'absolute',left:84,right:84,top:640,fontFamily:serif,fontSize:74,lineHeight:1.02,letterSpacing:'-.035em',color:C.ink,opacity:punch}}>That’s only<br/><span style={{color:C.purpleLight}}>the surface.</span></div>
      <div style={{position:'absolute',left:-35,right:-35,bottom:70}}><MayonMark opacity={0.34} /></div>
      <div style={{position:'absolute',left:84,bottom:86,fontFamily:sans,fontSize:18,color:C.muted,letterSpacing:'.08em'}}>meaning · source · place · use</div>
      <div style={{position:'absolute',left:0,right:0,bottom:0,height:`${wipe*100}%`,background:C.bg2}} />
    </AbsoluteFill>
  );
};
