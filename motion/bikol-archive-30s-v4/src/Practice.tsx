import React from 'react';
import {AbsoluteFill,interpolate,useCurrentFrame} from 'remotion';
import {C,Noise,out,p,sans,serif} from './shared';

export const Practice:React.FC=()=>{
  const f=useCurrentFrame();
  const enter=p(f,0,16), title=p(f,0,12), exit=out(f,118,138);
  const rows=[
    {n:'01',label:'FLASHCARD',big:'magayon',sub:'beautiful',note:'recognize it',bg:'#EFE6D9',ink:C.ink,accent:C.purpleDeep,dir:-1},
    {n:'02',label:'TRANSFORM',big:'bakal → nagbakal',sub:'change the form',note:'retrieve it',bg:C.night,ink:C.cream,accent:C.gold,dir:1},
    {n:'03',label:'DIALOGUE',big:'Dios mabalos.',sub:'reply in context',note:'use it',bg:'#D8C1E6',ink:'#241F25',accent:'#6D4B83',dir:-1},
  ];
  return <AbsoluteFill style={{background:C.paper,overflow:'hidden',clipPath:`inset(0 ${100*(1-enter)}% 0 0)`}}>
    <div style={{position:'absolute',left:58,top:42,fontFamily:sans,fontSize:14,fontWeight:700,letterSpacing:'.22em',color:C.purpleDeep,textTransform:'uppercase'}}>04 — Lookup is not learning</div>
    <div style={{position:'absolute',left:58,right:58,top:86,height:190,display:'grid',gridTemplateColumns:'1.3fr .7fr',alignItems:'end',borderBottom:'1px solid #CFC4B5',paddingBottom:24,opacity:title*exit}}>
      <div style={{fontFamily:serif,fontSize:92,lineHeight:.88,letterSpacing:'-.06em',color:C.ink}}>Don’t just remember it. <span style={{color:C.purpleDeep,fontStyle:'italic'}}>Use it.</span></div>
      <div style={{fontFamily:sans,fontSize:15,lineHeight:1.5,color:'#736A60',justifySelf:'end',maxWidth:390}}>Recognition is only step one. Retrieval and context are what make the word usable.</div>
    </div>

    <div style={{position:'absolute',left:0,right:0,top:300,bottom:0}}>
      {rows.map((row,i)=>{
        const ri=p(f,4+i*8,20+i*8);
        const h=(1080-300)/3;
        return <div key={row.label} style={{position:'absolute',left:0,right:0,top:i*h,height:h,background:row.bg,borderTop:i===0?'none':`1px solid ${i===2?'rgba(39,31,40,.16)':C.line}`,display:'grid',gridTemplateColumns:'250px 1fr 300px',alignItems:'center',padding:'0 58px',opacity:ri*exit,translate:`${interpolate(ri,[0,1],[row.dir*130,0])}px 0`}}>
          <div>
            <div style={{fontFamily:sans,fontSize:13,fontWeight:700,letterSpacing:'.17em',color:row.accent}}>{row.n} / {row.label}</div>
            <div style={{fontFamily:sans,fontSize:13,color:i===1?C.muted:'#776E63',marginTop:12}}>{row.sub}</div>
          </div>
          <div style={{fontFamily:serif,fontSize:i===1?82:96,lineHeight:.92,letterSpacing:'-.055em',color:row.ink,fontWeight:600}}>{row.big}</div>
          <div style={{justifySelf:'end',fontFamily:serif,fontSize:34,fontStyle:'italic',color:row.accent}}>{row.note} →</div>
        </div>;
      })}
    </div>
    <Noise light/>
  </AbsoluteFill>;
};
