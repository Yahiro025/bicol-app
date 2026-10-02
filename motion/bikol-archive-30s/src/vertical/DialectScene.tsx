import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, appear, sans, serif} from './theme';

const dialects = ['CENTRAL', 'RINCONADA', 'ALBAY', 'CATANDUANES', 'SORSOGON'];

export const DialectScene: React.FC = () => {
  const frame = useCurrentFrame();
  const heading = appear(frame, 5, 24);
  const rows = appear(frame, 20, 76);
  const exit = appear(frame, 100, 119);
  return (
    <AbsoluteFill style={{background:C.paper,color:C.darkInk,overflow:'hidden'}}>
      <div style={{position:'absolute',left:66,top:78,fontFamily:serif,fontSize:420,lineHeight:.8,color:'#E7DDD0',fontWeight:700}}>5</div>
      <div style={{position:'absolute',left:330,right:82,top:118,opacity:heading}}>
        <div style={{fontFamily:sans,fontSize:16,fontWeight:800,letterSpacing:'.18em',color:C.purpleDeep}}>CONTEXT CHANGES THE READING</div>
        <div style={{fontFamily:serif,fontSize:72,lineHeight:.97,letterSpacing:'-.04em',marginTop:24}}>Meaning lives<br/><span style={{color:C.purpleDeep}}>in place.</span></div>
      </div>
      <div style={{position:'absolute',left:84,right:84,top:575,bottom:110,opacity:rows}}>
        {dialects.map((d,i)=>{const local=appear(frame,20+i*8,40+i*8);return <div key={d} style={{height:190,borderTop:`1px solid ${C.paperLine}`,display:'grid',gridTemplateColumns:'70px 1fr',alignItems:'center',opacity:local,translate:`${interpolate(local,[0,1],[i%2===0?44:-44,0])}px 0`}}>
          <div style={{fontFamily:sans,fontSize:15,color:C.darkMuted}}>0{i+1}</div>
          <div><div style={{fontFamily:serif,fontSize:58,letterSpacing:'-.03em',color:i===0?C.purpleDeep:C.darkInk}}>{d}</div><div style={{fontFamily:sans,fontSize:15,color:C.darkMuted,marginTop:7,letterSpacing:'.08em'}}>preserve the difference</div></div>
        </div>;})}
      </div>
      <div style={{position:'absolute',left:'50%',top:'52%',width:1250,height:1250,borderRadius:'50%',background:C.bg,translate:'-50% -50%',scale:exit}} />
    </AbsoluteFill>
  );
};
