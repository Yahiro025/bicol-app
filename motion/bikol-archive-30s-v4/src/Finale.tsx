import React from 'react';
import {AbsoluteFill,Img,interpolate,useCurrentFrame} from 'remotion';
import {C,Noise,clamp,mayon,p,sans,serif} from './shared';

export const Finale:React.FC=()=>{
  const f=useCurrentFrame();
  const enter=p(f,0,18), brand=p(f,2,24), line=p(f,20,42), close=p(f,43,64);
  return <AbsoluteFill style={{background:'#050609',overflow:'hidden',opacity:enter}}>
    <Img src={mayon} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'54% 34%',opacity:.7,scale:interpolate(f,[0,140],[1.13,1.07],clamp)}}/>
    <AbsoluteFill style={{background:'linear-gradient(90deg,rgba(5,6,9,.96) 0%,rgba(5,6,9,.72) 43%,rgba(5,6,9,.2) 72%,rgba(5,6,9,.58) 100%)'}}/>
    <AbsoluteFill style={{background:'linear-gradient(0deg,rgba(5,6,9,.9) 0%,transparent 56%,rgba(5,6,9,.28) 100%)'}}/>

    <div style={{position:'absolute',left:76,top:54,fontFamily:sans,fontSize:14,color:C.gold,letterSpacing:'.23em',textTransform:'uppercase',fontWeight:700,opacity:brand}}>The Bikol Language Archive</div>

    <div style={{position:'absolute',left:72,top:228,right:60,opacity:brand,translate:`${interpolate(brand,[0,1],[-70,0])}px 0`}}>
      <div style={{fontFamily:serif,fontSize:186,lineHeight:.82,letterSpacing:'-.07em',fontWeight:700,color:C.cream}}>Bikol</div>
      <div style={{fontFamily:serif,fontSize:194,lineHeight:.86,letterSpacing:'-.07em',fontStyle:'italic',fontWeight:400,color:'#E3D0EF',marginLeft:160}}>Dictionary</div>
    </div>

    <div style={{position:'absolute',left:76,right:76,bottom:150,borderTop:'1px solid rgba(255,255,255,.18)',paddingTop:27,display:'grid',gridTemplateColumns:'1fr auto',alignItems:'end',opacity:line}}>
      <div style={{fontFamily:serif,fontSize:48,color:C.cream2,letterSpacing:'-.025em'}}>Search it. Study it. Correct it.</div>
      <div style={{fontFamily:serif,fontSize:64,color:C.gold,fontStyle:'italic',letterSpacing:'-.04em'}}>Keep it moving.</div>
    </div>

    <div style={{position:'absolute',left:76,right:76,bottom:58,display:'flex',justifyContent:'space-between',alignItems:'center',opacity:close}}>
      <div style={{fontFamily:sans,fontSize:14,color:C.cream,fontWeight:700,letterSpacing:'.14em'}}>BIKOLDICTIONARY.APP</div>
      <div style={{fontFamily:sans,fontSize:13,color:C.muted,letterSpacing:'.14em',textTransform:'uppercase'}}>Free & open access</div>
    </div>
    <Noise opacity={.055}/>
  </AbsoluteFill>;
};
