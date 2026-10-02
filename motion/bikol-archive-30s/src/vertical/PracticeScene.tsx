import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, appear, clamp, sans, serif} from './theme';

const steps = [['01','LOOK','Find the word and its source trail.'],['02','MOVE','See the root stay while the form changes.'],['03','SAY','Put the word into a real exchange.'],['04','USE','Repeat until the pattern becomes familiar.']];

export const PracticeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const title = appear(frame, 0, 18);
  const progress = interpolate(frame, [18, 125], [0, 1], clamp);
  const exit = appear(frame, 126, 149);
  return (
    <AbsoluteFill style={{background:C.paper,color:C.darkInk,overflow:'hidden'}}>
      <div style={{position:'absolute',left:84,right:84,top:98,opacity:title}}>
        <div style={{fontFamily:sans,fontSize:16,fontWeight:800,letterSpacing:'.18em',color:C.purpleDeep}}>PRACTICE</div>
        <div style={{fontFamily:serif,fontSize:74,lineHeight:1,letterSpacing:'-.04em',marginTop:24}}>Don’t just look it up.<br/><span style={{fontStyle:'italic',color:C.purpleDeep}}>Use it.</span></div>
      </div>
      <div style={{position:'absolute',left:112,top:472,bottom:145,width:3,background:C.paperLine}}>
        <div style={{width:3,height:`${progress*100}%`,background:C.purpleDeep}} />
        <div style={{position:'absolute',left:-10,top:`${progress*100}%`,width:23,height:23,borderRadius:'50%',background:C.purpleDeep,translate:'0 -50%'}} />
      </div>
      <div style={{position:'absolute',left:170,right:84,top:450}}>
        {steps.map(([n,verb,detail],i)=>{const local=appear(frame,18+i*20,38+i*20);return <div key={verb} style={{height:270,display:'grid',gridTemplateColumns:'90px 250px 1fr',alignItems:'center',borderTop:`1px solid ${C.paperLine}`,opacity:local,translate:`0 ${interpolate(local,[0,1],[30,0])}px`}}>
          <div style={{fontFamily:sans,fontSize:14,color:C.darkMuted}}>{n}</div>
          <div style={{fontFamily:sans,fontSize:44,fontWeight:900,letterSpacing:'-.03em',color:i===1?C.purpleDeep:i===2?C.rust:i===3?C.gold:C.darkInk}}>{verb}</div>
          <div style={{fontFamily:serif,fontSize:34,lineHeight:1.15}}>{detail}</div>
        </div>;})}
      </div>
      <div style={{position:'absolute',left:0,right:0,bottom:0,height:`${exit*100}%`,background:C.bg}} />
    </AbsoluteFill>
  );
};
