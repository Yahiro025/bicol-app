import fs from 'node:fs';
import path from 'node:path';
const sr=48000,dur=30,n=sr*dur,channels=2;
let seed=0xB1C01; const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return ((seed>>>0)/4294967296)*2-1};
const hits=[3.17,7.50,11.83,16.67,21.00,25.33];
const chimes=[0.15,1.05,4.0,17.0,17.32,17.64,26.0];
let lp=0; const data=Buffer.alloc(n*channels*2);
for(let i=0;i<n;i++){
  const t=i/sr; lp=lp*.997+rand()*.003;
  const breath=.55+.45*Math.sin(2*Math.PI*.055*t+.3);
  let x=(.011*Math.sin(2*Math.PI*55*t)+.005*Math.sin(2*Math.PI*82.5*t+.4))*breath + lp*.025;
  for(const h of hits){const d=t-h;if(d>=0&&d<1.3){const e=Math.exp(-d*4.2);x+=.055*e*Math.sin(2*Math.PI*(78*d-15*d*d));if(d<.055)x+=rand()*.025*(1-d/.055);}}
  for(const c of chimes){const d=t-c;if(d>=0&&d<1.1){const e=Math.exp(-d*5);x+=.018*e*Math.sin(2*Math.PI*220*d)+.011*e*Math.sin(2*Math.PI*330*d+.2);}}
  if(t>3.35&&t<4.15){const q=(t-3.35)%0.16;if(q<.018)x+=rand()*.009*(1-q/.018);}
  const fadeIn=Math.min(1,t/.7),fadeOut=Math.min(1,(dur-t)/1.2);x*=fadeIn*fadeOut;
  x=Math.tanh(x*1.8)*.72;
  const l=x*(.98+.02*Math.sin(t*.7)),r=x*(.98-.02*Math.sin(t*.7));
  data.writeInt16LE(Math.max(-32767,Math.min(32767,Math.round(l*32767))),i*4);
  data.writeInt16LE(Math.max(-32767,Math.min(32767,Math.round(r*32767))),i*4+2);
}
const header=Buffer.alloc(44),bytes=data.length;
header.write('RIFF',0);header.writeUInt32LE(36+bytes,4);header.write('WAVE',8);header.write('fmt ',12);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(channels,22);header.writeUInt32LE(sr,24);header.writeUInt32LE(sr*channels*2,28);header.writeUInt16LE(channels*2,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(bytes,40);
const out=path.resolve('public/soundtrack.wav');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,Buffer.concat([header,data]));console.log(out,bytes+44);
