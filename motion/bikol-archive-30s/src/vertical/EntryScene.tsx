import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, appear, sans, serif} from './theme';

const chips = ['ADJECTIVE', 'PRONUNCIATION', 'DIALECT', 'EXAMPLES'];

export const EntryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const panel = appear(frame, 6, 26);
  const details = appear(frame, 30, 58);
  const trail = appear(frame, 55, 84);
  const wipe = appear(frame, 102, 119);
  return (
    <AbsoluteFill style={{background:C.bg2,overflow:'hidden',color:C.ink}}>
      <div style={{position:'absolute',left:84,right:84,top:92,height:88,border:`1px solid ${C.line}`,borderRadius:22,display:'flex',alignItems:'center',padding:'0 26px',fontFamily:sans,fontSize:28,color:C.inkDim}}>
        <span style={{color:C.purpleLight,marginRight:18}}>⌕</span> magayon
        <span style={{marginLeft:'auto',fontSize:14,letterSpacing:'.18em',color:C.muted}}>SEARCH BIKOL</span>
      </div>
      <div style={{position:'absolute',left:84,right:84,top:225,bottom:105,border:`1px solid ${C.line}`,borderRadius:32,background:'#141210',padding:'54px 48px',opacity:panel,translate:`0 ${interpolate(panel,[0,1],[42,0])}px`}}>
        <div style={{fontFamily:sans,fontSize:16,color:C.gold,fontWeight:800,letterSpacing:'.18em'}}>AN ENTRY IS MORE THAN A TRANSLATION</div>
        <div style={{fontFamily:serif,fontSize:112,lineHeight:.9,letterSpacing:'-.055em',color:C.purpleLight,marginTop:28}}>magayon</div>
        <div style={{fontFamily:serif,fontSize:68,fontStyle:'italic',color:C.ink,marginTop:20}}>beautiful</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:10,marginTop:42,opacity:details}}>
          {chips.map((chip)=><div key={chip} style={{border:`1px solid ${C.line}`,borderRadius:999,padding:'10px 14px',fontFamily:sans,fontSize:13,letterSpacing:'.1em',color:C.inkDim}}>{chip}</div>)}
        </div>
        <div style={{position:'absolute',left:48,right:48,bottom:52,opacity:trail}}>
          <div style={{height:1,background:C.line,marginBottom:26}} />
          <div style={{fontFamily:sans,fontSize:14,fontWeight:800,letterSpacing:'.16em',color:C.muted}}>SOURCE TRAIL</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr auto',rowGap:17,marginTop:22,fontFamily:sans,fontSize:19,color:C.inkDim}}>
            <span>Dictionary record</span><span style={{color:C.gold}}>verified</span>
            <span>Dialect context</span><span style={{color:C.purpleLight}}>preserved</span>
            <span>Community note</span><span style={{color:C.ink}}>reviewed</span>
          </div>
        </div>
      </div>
      <div style={{position:'absolute',inset:0,background:C.paper,clipPath:`inset(${(1-wipe)*100}% 0 0 0)`}} />
    </AbsoluteFill>
  );
};
