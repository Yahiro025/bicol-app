import React from 'react';
import {AbsoluteFill,interpolate,useCurrentFrame} from 'remotion';
import {C,Edge,Noise,clamp,out,p,sans,serif} from './shared';

export const Entry:React.FC=()=>{
  const f=useCurrentFrame();
  const enter=p(f,0,12), body=p(f,12,32), meta=p(f,28,48), emphasis=p(f,50,68), exit=out(f,118,138);
  const typed='magayon'.slice(0,Math.max(0,Math.min(7,Math.floor(interpolate(f,[5,24],[0,7],clamp)))));
  return <AbsoluteFill style={{background:C.night,overflow:'hidden',opacity:enter}}>
    <Edge>01 — Search past the translation</Edge>

    <div style={{position:'absolute',left:58,right:58,top:86,height:92,borderTop:`1px solid ${C.line}`,borderBottom:`1px solid ${C.line}`,display:'grid',gridTemplateColumns:'70px 1fr 220px',alignItems:'center',opacity:exit}}>
      <div style={{fontFamily:sans,fontSize:31,color:C.muted}}>⌕</div>
      <div style={{display:'flex',alignItems:'center',gap:9}}>
        <span style={{fontFamily:sans,fontSize:34,fontWeight:700,color:C.cream}}>{typed}</span>
        <span style={{display:'block',height:40,width:2,background:C.purple,opacity:f%18<10?1:.25}}/>
      </div>
      <div style={{fontFamily:sans,fontSize:13,color:C.muted,letterSpacing:'.16em',textTransform:'uppercase',textAlign:'right'}}>Search Bikol</div>
    </div>

    <div style={{position:'absolute',left:58,right:58,top:210,bottom:54,display:'grid',gridTemplateColumns:'1.28fr .72fr',opacity:body*exit}}>
      <div style={{position:'relative',padding:'34px 56px 0 0',overflow:'hidden'}}>
        <div style={{fontFamily:sans,fontSize:14,color:C.gold,fontWeight:700,letterSpacing:'.18em',textTransform:'uppercase'}}>Entry / adjective</div>
        <div style={{fontFamily:serif,fontSize:188,lineHeight:.82,letterSpacing:'-.072em',fontWeight:700,color:'#D9BFEA',marginTop:36,translate:`${interpolate(body,[0,1],[-48,0])}px 0`}}>magayon</div>
        <div style={{fontFamily:serif,fontSize:72,color:C.cream,fontStyle:'italic',letterSpacing:'-.035em',marginTop:22}}>beautiful</div>

        <div style={{position:'absolute',left:0,right:58,bottom:0,borderTop:`1px solid ${C.line}`,paddingTop:24,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:30,opacity:meta}}>
          {[
            ['PRONUNCIATION','ma-ga-YON'],
            ['USAGE','meaning stays in context'],
            ['EVIDENCE','definition keeps its source'],
          ].map(([k,v])=><div key={k}>
            <div style={{fontFamily:sans,fontSize:12,color:C.muted,letterSpacing:'.17em',fontWeight:700}}>{k}</div>
            <div style={{fontFamily:serif,fontSize:26,color:C.cream2,marginTop:8,lineHeight:1.1}}>{v}</div>
          </div>)}
        </div>
      </div>

      <div style={{borderLeft:`1px solid ${C.line}`,display:'grid',gridTemplateRows:'1fr 1fr',minWidth:0}}>
        <div style={{padding:'34px 0 30px 42px',borderBottom:`1px solid ${C.line}`,position:'relative',overflow:'hidden'}}>
          <div style={{fontFamily:sans,fontSize:12,color:C.gold,letterSpacing:'.18em',fontWeight:700,textTransform:'uppercase'}}>Context</div>
          <div style={{fontFamily:serif,fontSize:62,lineHeight:.98,letterSpacing:'-.045em',color:C.cream,marginTop:22}}>A word belongs<br/>to a <span style={{color:'#D9BFEA',fontStyle:'italic'}}>place.</span></div>
          <div style={{position:'absolute',bottom:26,left:42,fontFamily:sans,fontSize:14,color:C.muted}}>dialect · usage · example</div>
        </div>
        <div style={{padding:'34px 0 20px 42px',position:'relative',overflow:'hidden'}}>
          <div style={{fontFamily:sans,fontSize:12,color:C.gold,letterSpacing:'.18em',fontWeight:700,textTransform:'uppercase'}}>Source trail</div>
          <div style={{fontFamily:serif,fontSize:50,lineHeight:1,letterSpacing:'-.04em',color:C.cream,marginTop:22}}>Know where the<br/>definition came from.</div>
          <div style={{position:'absolute',left:42,bottom:25,display:'flex',gap:26,fontFamily:sans,fontSize:13,color:C.muted,letterSpacing:'.08em',textTransform:'uppercase'}}>
            <span>Mintz</span><span>Wiktionary</span><span>Community</span>
          </div>
        </div>
      </div>
    </div>

    <div style={{position:'absolute',right:58,top:184,fontFamily:serif,fontSize:34,color:C.cream2,opacity:emphasis*exit,translate:`${interpolate(emphasis,[0,1],[35,0])}px 0`}}>
      Meaning <span style={{color:C.muted}}>→</span> context <span style={{color:C.muted}}>→</span> source.
    </div>
    <Noise/>
  </AbsoluteFill>;
};
