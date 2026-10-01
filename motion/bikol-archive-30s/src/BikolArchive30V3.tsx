import React from 'react';
import {AbsoluteFill,Easing,Img,Sequence,interpolate,spring,useCurrentFrame,useVideoConfig} from 'remotion';

const C={dark:'#0E0D0B',dark2:'#171511',ink:'#F6F1E9',ink2:'#D9D2C7',muted:'#908A80',paper:'#F6F2E9',paper2:'#E9E2D5',black:'#191815',purple:'#A580C0',purple2:'#6E4C83',lilac:'#DCC7EA',gold:'#E4C274',rust:'#C6794D',line:'#3A352C'};
const serif="Georgia,'Times New Roman',serif";
const sans="Inter,ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif";
const mayon='https://raw.githubusercontent.com/Yahiro025/bicol-app/main/public/images/mayon-hero.png';
const clamp={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const ease=Easing.bezier(.16,1,.3,1);
const t=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{...clamp,easing:ease});

const Noise:React.FC<{light?:boolean}>=({light=false})=><AbsoluteFill style={{opacity:.035,mixBlendMode:light?'multiply':'screen',pointerEvents:'none',backgroundImage:'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 180 180\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.7\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'.7\'/%3E%3C/svg%3E")'}}/>;
const K:React.FC<{children:React.ReactNode;light?:boolean}>=({children,light=false})=><div style={{fontFamily:sans,fontSize:16,fontWeight:800,letterSpacing:'.22em',textTransform:'uppercase',color:light?C.purple2:C.gold}}>{children}</div>;

const Hook=()=>{
 const f=useCurrentFrame(),{fps}=useVideoConfig();
 const a=spring({frame:f,fps,config:{damping:110,stiffness:115,mass:.9}}),q=t(f,34,52),breakup=t(f,70,101);
 return <AbsoluteFill style={{background:'#05070B',overflow:'hidden'}}>
  <Img src={mayon} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'50% 33%',opacity:.68,scale:interpolate(f,[0,105],[1.08,1.16],clamp),translate:`0 ${interpolate(f,[0,105],[0,-18],clamp)}px`}}/>
  <AbsoluteFill style={{background:'linear-gradient(90deg,rgba(3,4,7,.91),rgba(3,4,7,.32) 55%,rgba(3,4,7,.86))'}}/>
  <AbsoluteFill style={{background:'linear-gradient(0deg,rgba(3,4,7,.96),transparent 48%,rgba(3,4,7,.68))'}}/>
  <div style={{position:'absolute',left:84,top:70,opacity:t(f,2,16)}}><K>The Bikol language archive</K></div>
  <div style={{position:'absolute',left:72,top:245,display:'flex',alignItems:'baseline',whiteSpace:'nowrap',opacity:1-breakup*.35,translate:`${-breakup*360}px 0`}}>
   <div style={{fontFamily:serif,fontSize:238,fontWeight:900,letterSpacing:'-.075em',lineHeight:.85,color:C.ink,opacity:a,translate:`${interpolate(a,[0,1],[-80,0])}px 0`}}>MAGAYON</div>
   <div style={{fontFamily:sans,fontSize:60,color:C.gold,margin:'0 38px',opacity:t(f,17,29)*(1-breakup)}}>→</div>
   <div style={{fontFamily:serif,fontSize:118,fontStyle:'italic',letterSpacing:'-.045em',color:C.lilac,opacity:t(f,24,39)*(1-breakup)}}>beautiful</div>
  </div>
  <div style={{position:'absolute',left:86,bottom:145,fontFamily:serif,fontSize:78,lineHeight:1.03,letterSpacing:'-.045em',color:C.ink,opacity:q*(1-breakup)}}>What gets lost when a word<br/>becomes <span style={{color:C.lilac}}>just a translation?</span></div>
  {['meaning','place','source','sound'].map((x,i)=>{const p=t(f,75+i*4,92+i*4);return <div key={x} style={{position:'absolute',left:[130,560,1030,1490][i],top:[280,660,245,690][i],fontFamily:sans,fontWeight:800,fontSize:44,letterSpacing:'.11em',textTransform:'uppercase',color:i===1?C.gold:C.ink,opacity:p,rotate:`${[-8,4,-3,7][i]}deg`,scale:interpolate(p,[0,1],[.75,1])}}>{x}</div>})}
  <div style={{position:'absolute',left:0,bottom:0,height:10,width:`${breakup*100}%`,background:C.purple}}/><Noise/>
 </AbsoluteFill>
};

const Entry=()=>{
 const f=useCurrentFrame(),enter=t(f,4,24),meta=t(f,20,46),tags=t(f,40,63),out=t(f,111,134);
 const rows=[['MEANING','beautiful'],['DIALECT','Central Bikol'],['PRONUNCIATION','/ma-ga-yon/'],['SOURCE','Mintz · Wiktionary']];
 return <AbsoluteFill style={{background:C.dark,overflow:'hidden'}}>
  <div style={{position:'absolute',left:78,right:78,top:54,height:88,borderBottom:`1px solid ${C.line}`,display:'flex',alignItems:'center',opacity:enter*(1-out)}}><K>Search result / 01</K><div style={{marginLeft:'auto',fontFamily:sans,fontSize:22,color:C.muted}}>⌕ &nbsp; magayon</div></div>
  <div style={{position:'absolute',left:76,top:180,width:1020,opacity:enter*(1-out),translate:`${interpolate(enter,[0,1],[-55,0])-out*260}px 0`}}>
   <div style={{fontFamily:serif,fontSize:244,fontWeight:900,letterSpacing:'-.075em',lineHeight:.84,color:C.lilac}}>magayon</div>
   <div style={{fontFamily:serif,fontSize:84,fontStyle:'italic',color:C.ink,marginTop:34}}>beautiful</div>
   <div style={{fontFamily:sans,fontSize:24,lineHeight:1.48,color:C.ink2,maxWidth:880,marginTop:28}}>A word is not one field. It carries usage, dialect, pronunciation, examples, and a trail back to its sources.</div>
  </div>
  <div style={{position:'absolute',left:1175,right:78,top:180,bottom:120,display:'grid',gridTemplateRows:'repeat(4,1fr)',opacity:meta*(1-out)}}>{rows.map(([l,v],i)=>{const p=t(f,23+i*7,40+i*7);return <div key={l} style={{borderTop:`1px solid ${C.line}`,paddingTop:20,opacity:p,translate:`${interpolate(p,[0,1],[90,0])}px 0`}}><div style={{fontFamily:sans,fontSize:15,fontWeight:800,letterSpacing:'.18em',color:i===3?C.gold:C.muted}}>{l}</div><div style={{fontFamily:serif,fontSize:44,color:C.ink,marginTop:12}}>{v}</div></div>})}</div>
  <div style={{position:'absolute',left:76,bottom:58,display:'flex',gap:13,opacity:tags*(1-out)}}>{['definition','examples','etymology','conjugation','community notes'].map((x,i)=><div key={x} style={{border:`1px solid ${i===0?C.purple:C.line}`,borderRadius:999,padding:'12px 18px',fontFamily:sans,fontSize:14,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:i===0?C.lilac:C.muted,background:i===0?'rgba(165,128,192,.11)':'transparent'}}>{x}</div>)}</div>
  {Array.from({length:5}).map((_,i)=><div key={i} style={{position:'absolute',left:0,right:0,top:`${i*20}%`,height:`${out*20}%`,background:i%2?C.paper2:C.paper,zIndex:20}}/>)}<Noise/>
 </AbsoluteFill>
};

const Dialects=()=>{
 const f=useCurrentFrame(),intro=t(f,0,18),collapse=t(f,94,118); const ds=['CENTRAL','RINCONADA','ALBAY','CATANDUANES','SORSOGON'];
 return <AbsoluteFill style={{background:C.paper,color:C.black,overflow:'hidden'}}>
  <div style={{position:'absolute',left:70,right:70,top:50,display:'flex',alignItems:'baseline',opacity:intro*(1-collapse)}}><K light>One word, many places</K><div style={{marginLeft:'auto',fontFamily:serif,fontSize:76,fontWeight:700,letterSpacing:'-.045em'}}>Five dialects. <span style={{color:C.purple2}}>Not one flat voice.</span></div></div>
  <div style={{position:'absolute',left:0,right:0,top:160,bottom:0}}>{ds.map((d,i)=>{const p=t(f,10+i*7,30+i*7),y=i*177;return <div key={d} style={{position:'absolute',left:0,right:0,top:y,height:178,borderTop:'1px solid rgba(25,24,21,.18)',display:'grid',gridTemplateColumns:'150px 520px 1fr 210px',alignItems:'center',padding:'0 76px',background:i===2?'rgba(165,128,192,.10)':'transparent',opacity:p*(1-collapse),translate:`${interpolate(p,[0,1],[i%2?-180:180,0])+interpolate(f,[0,110],[0,i%2?70:-70],clamp)}px ${collapse*(355-y)}px`,scale:interpolate(collapse,[0,1],[1,.15])}}><div style={{fontFamily:sans,fontSize:24,color:'#6B6760',fontWeight:700}}>0{i+1}</div><div style={{fontFamily:sans,fontWeight:800,fontSize:38,letterSpacing:'.09em'}}>{d}</div><div style={{fontFamily:serif,fontSize:92,fontStyle:'italic',letterSpacing:'-.05em',color:i===2?C.purple2:C.black}}>magayon</div><div style={{fontFamily:sans,fontSize:15,letterSpacing:'.15em',textTransform:'uppercase',color:'#6B6760'}}>dialect context</div></div>})}</div>
  <div style={{position:'absolute',left:'50%',top:'50%',translate:'-50% -50%',fontFamily:serif,fontSize:260,fontWeight:900,letterSpacing:'-.08em',color:C.black,opacity:collapse,scale:interpolate(collapse,[0,1],[.5,1]),zIndex:30}}>bakal</div><Noise light/>
 </AbsoluteFill>
};

const Grammar=()=>{
 const f=useCurrentFrame(),forms=[['ROOT','bakal'],['ACTOR','magbakal'],['PAST','nagbakal'],['ONGOING','nagbabakal'],['FUTURE','mababakal']],idx=Math.min(4,Math.max(0,Math.floor((f-12)/25))),local=((f-12)%25+25)%25,wi=t(local,0,9),wo=t(local,18,24),out=t(f,125,148),progress=interpolate(f,[12,125],[0,1],clamp);
 return <AbsoluteFill style={{background:C.dark,overflow:'hidden'}}>
  <div style={{position:'absolute',left:76,top:62,right:76,display:'flex',alignItems:'center',opacity:t(f,4,18)*(1-out)}}><K>Words move</K><div style={{marginLeft:'auto',fontFamily:sans,fontSize:20,color:C.muted}}>See the pattern, not just the answer.</div></div>
  <div style={{position:'absolute',left:70,right:70,top:205,height:430,display:'flex',alignItems:'center',overflow:'hidden',opacity:1-out}}><div style={{fontFamily:serif,fontSize:forms[idx][1].length>9?208:250,fontWeight:900,letterSpacing:'-.075em',color:idx===0?C.lilac:C.ink,whiteSpace:'nowrap',opacity:wi*(1-wo),translate:`${interpolate(wi,[0,1],[120,0])-wo*160}px 0`}}>{forms[idx][1]}</div></div>
  <div style={{position:'absolute',left:76,right:76,bottom:138,opacity:t(f,10,28)*(1-out)}}><div style={{height:3,background:C.line,position:'relative'}}><div style={{position:'absolute',inset:0,width:`${progress*100}%`,background:C.purple}}/></div><div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',marginTop:24}}>{forms.map(([l,w],i)=><div key={l} style={{opacity:idx===i?1:.38}}><div style={{fontFamily:sans,fontSize:14,fontWeight:800,letterSpacing:'.16em',color:idx===i?C.gold:C.muted}}>{l}</div><div style={{fontFamily:serif,fontSize:34,color:C.ink,marginTop:8}}>{w}</div></div>)}</div></div>
  <div style={{position:'absolute',left:0,right:0,bottom:0,height:`${out*100}%`,background:C.paper,zIndex:20}}/><Noise/>
 </AbsoluteFill>
};

const Practice=()=>{
 const f=useCurrentFrame(),intro=t(f,0,18),one=t(f,10,32),two=t(f,28,50),three=t(f,46,68),four=t(f,70,92),out=t(f,150,174);
 return <AbsoluteFill style={{background:C.paper,color:C.black,overflow:'hidden'}}>
  <div style={{position:'absolute',left:70,right:70,top:56,display:'flex',alignItems:'baseline',opacity:intro*(1-out)}}><K light>From lookup to fluency</K><div style={{marginLeft:'auto',fontFamily:serif,fontSize:74,fontWeight:700,letterSpacing:'-.045em'}}>Don’t stop at <span style={{fontStyle:'italic',color:C.purple2}}>“I know the meaning.”</span></div></div>
  <div style={{position:'absolute',left:64,right:64,top:188,bottom:86,display:'grid',gridTemplateColumns:'1.05fr .95fr',gap:24,opacity:1-out}}>
   <div style={{display:'grid',gridTemplateRows:'1fr 1fr',gap:24}}>
    <div style={{position:'relative',background:C.dark,color:C.ink,borderRadius:32,padding:42,opacity:one,translate:`${interpolate(one,[0,1],[-120,0])}px 0`}}><div style={{fontFamily:sans,fontSize:15,letterSpacing:'.17em',fontWeight:800,color:C.gold}}>01 / LOOK IT UP</div><div style={{fontFamily:serif,fontSize:92,fontWeight:700,letterSpacing:'-.05em',marginTop:18}}>magayon</div><div style={{fontFamily:serif,fontSize:44,color:C.lilac,fontStyle:'italic'}}>beautiful</div><div style={{position:'absolute',right:32,bottom:26,fontFamily:sans,fontSize:18,color:C.muted}}>definition · dialect · source</div></div>
    <div style={{background:'#E6DED0',borderRadius:32,padding:42,opacity:three,translate:`${interpolate(three,[0,1],[-110,0])}px 0`,display:'flex',flexDirection:'column',justifyContent:'space-between'}}><div style={{fontFamily:sans,fontSize:15,letterSpacing:'.17em',fontWeight:800,color:C.purple2}}>03 / TEST IT</div><div style={{fontFamily:serif,fontSize:62,lineHeight:1.04}}>Which form means<br/><span style={{color:C.purple2}}>“was buying”?</span></div><div style={{display:'flex',gap:12}}>{['magbakal','nagbakal','mababakal'].map((v,i)=><div key={v} style={{padding:'11px 17px',borderRadius:999,border:'1px solid rgba(25,24,21,.18)',fontFamily:sans,fontSize:16,background:i===1?'#fff':'transparent'}}>{v}</div>)}</div></div>
   </div>
   <div style={{display:'grid',gridTemplateRows:'.88fr 1.12fr',gap:24}}>
    <div style={{background:C.purple2,color:'#fff',borderRadius:32,padding:42,opacity:two,translate:`${interpolate(two,[0,1],[120,0])}px 0`}}><div style={{fontFamily:sans,fontSize:15,letterSpacing:'.17em',fontWeight:800,color:'#E9DDF1'}}>02 / BREAK IT DOWN</div><div style={{fontFamily:serif,fontSize:64,lineHeight:1.06,marginTop:24}}>bakal → magbakal<br/>→ nagbakal</div><div style={{fontFamily:sans,fontSize:18,opacity:.74,marginTop:22}}>See how the word changes, and why.</div></div>
    <div style={{position:'relative',background:'#FFFDF8',border:'1px solid rgba(25,24,21,.14)',borderRadius:32,padding:42,opacity:four,translate:`${interpolate(four,[0,1],[120,0])}px 0`}}><div style={{fontFamily:sans,fontSize:15,letterSpacing:'.17em',fontWeight:800,color:C.rust}}>04 / USE IT</div><div style={{fontFamily:serif,fontSize:58,lineHeight:1.05,marginTop:20}}>“Magayon an aldaw.”</div><div style={{fontFamily:sans,fontSize:20,color:'#6B6760',marginTop:14}}>Practice a real sentence. Then make your own.</div><div style={{position:'absolute',right:40,bottom:34,fontFamily:serif,fontStyle:'italic',fontSize:36,color:C.purple2}}>lookup → pattern → recall → use</div></div>
   </div>
  </div>
  <div style={{position:'absolute',left:0,right:0,bottom:0,height:10,background:C.purple,width:`${interpolate(f,[0,170],[0,100],clamp)}%`}}/><div style={{position:'absolute',inset:0,background:C.dark,opacity:out,zIndex:20}}/><Noise light/>
 </AbsoluteFill>
};

const Community=()=>{
 const f=useCurrentFrame(),intro=t(f,0,20),feed=t(f,14,48),out=t(f,94,118),items=[['NEW WORD','harubay'],['CORRECTION','source added to “uran”'],['EXAMPLE','new sentence for “padaba”'],['DIALECT NOTE','Rinconada usage added']];
 return <AbsoluteFill style={{background:C.dark,overflow:'hidden'}}>
  <div style={{position:'absolute',left:72,top:66,width:730,opacity:intro*(1-out)}}><K>Keep the archive living</K><div style={{fontFamily:serif,fontSize:88,lineHeight:1.02,letterSpacing:'-.05em',color:C.ink,marginTop:30}}>A dictionary should<br/>be able to <span style={{color:C.lilac,fontStyle:'italic'}}>change.</span></div><div style={{fontFamily:sans,fontSize:22,lineHeight:1.5,color:C.ink2,marginTop:28,maxWidth:620}}>Speakers can suggest words, correct definitions, add examples, and attach better sources.</div></div>
  <div style={{position:'absolute',left:890,right:70,top:68,bottom:72,display:'grid',gridTemplateRows:'repeat(4,1fr)',gap:14,opacity:feed*(1-out)}}>{items.map(([tag,text],i)=>{const p=t(f,18+i*8,38+i*8);return <div key={tag} style={{border:`1px solid ${C.line}`,borderRadius:22,background:i===0?'rgba(165,128,192,.10)':C.dark2,padding:'26px 32px',display:'grid',gridTemplateColumns:'180px 1fr 84px',alignItems:'center',opacity:p,translate:`${interpolate(p,[0,1],[110,0])}px 0`}}><div style={{fontFamily:sans,fontSize:14,fontWeight:800,letterSpacing:'.14em',color:i===0?C.lilac:C.gold}}>{tag}</div><div style={{fontFamily:serif,fontSize:36,color:C.ink}}>{text}</div><div style={{fontFamily:sans,fontSize:14,color:C.muted,textAlign:'right'}}>REVIEW</div></div>})}</div>
  <div style={{position:'absolute',left:0,right:0,bottom:0,height:`${out*100}%`,background:'#05070B',zIndex:20}}/><Noise/>
 </AbsoluteFill>
};

const End=()=>{const f=useCurrentFrame(),a=t(f,0,24),b=t(f,17,36);return <AbsoluteFill style={{background:'#05070B',overflow:'hidden'}}><Img src={mayon} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'50% 34%',opacity:.55,scale:interpolate(f,[0,90],[1.12,1.17],clamp)}}/><AbsoluteFill style={{background:'linear-gradient(90deg,rgba(2,3,6,.94),rgba(2,3,6,.56) 62%,rgba(2,3,6,.83))'}}/><div style={{position:'absolute',left:76,top:58,opacity:a}}><K>The Bikol language archive</K></div><div style={{position:'absolute',left:70,top:188,opacity:a,translate:`${interpolate(a,[0,1],[-70,0])}px 0`}}><div style={{fontFamily:serif,fontSize:230,fontWeight:900,letterSpacing:'-.075em',lineHeight:.78,color:C.ink}}>BIKOL</div><div style={{fontFamily:serif,fontSize:186,fontStyle:'italic',letterSpacing:'-.06em',lineHeight:.98,color:C.lilac}}>Dictionary</div></div><div style={{position:'absolute',right:82,bottom:96,width:590,opacity:b}}><div style={{fontFamily:serif,fontSize:62,lineHeight:1.04,color:C.ink}}>Search it.<br/>Study it.<br/><span style={{color:C.lilac}}>Add to it.</span></div><div style={{marginTop:32,borderTop:'1px solid rgba(246,241,233,.2)',paddingTop:20,fontFamily:sans,fontSize:18,color:C.ink2,display:'flex',justifyContent:'space-between'}}><span>bikoldictionary.app</span><span>FREE · OPEN ACCESS</span></div></div><Noise/></AbsoluteFill>};

export const BikolArchive30V3:React.FC=()=> <AbsoluteFill style={{background:C.dark}}><Sequence from={0} durationInFrames={105}><Hook/></Sequence><Sequence from={105} durationInFrames={135}><Entry/></Sequence><Sequence from={240} durationInFrames={120}><Dialects/></Sequence><Sequence from={360} durationInFrames={150}><Grammar/></Sequence><Sequence from={510} durationInFrames={180}><Practice/></Sequence><Sequence from={690} durationInFrames={120}><Community/></Sequence><Sequence from={810} durationInFrames={90}><End/></Sequence></AbsoluteFill>;
