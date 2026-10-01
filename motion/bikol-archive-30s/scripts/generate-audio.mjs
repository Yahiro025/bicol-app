import fs from 'node:fs';
import path from 'node:path';

const sampleRate = 48000;
const seconds = 30;
const channels = 2;
const frames = sampleRate * seconds;
const left = new Float32Array(frames);
const right = new Float32Array(frames);

let seed = 0x4b494b4f;
const rand = () => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return ((seed >>> 0) / 0xffffffff) * 2 - 1;
};

const addTone = (time, duration, hz, amp, pan = 0, overtone = 0) => {
  const start = Math.max(0, Math.floor(time * sampleRate));
  const end = Math.min(frames, Math.floor((time + duration) * sampleRate));
  const lGain = Math.sqrt((1 - pan) * 0.5);
  const rGain = Math.sqrt((1 + pan) * 0.5);
  for (let i = start; i < end; i++) {
    const t = (i - start) / sampleRate;
    const env = Math.pow(Math.max(0, 1 - t / duration), 2.2);
    const attack = Math.min(1, t / 0.012);
    let v = Math.sin(Math.PI * 2 * hz * t);
    if (overtone > 0) v += overtone * Math.sin(Math.PI * 2 * hz * 2.01 * t);
    v *= amp * env * attack;
    left[i] += v * lGain;
    right[i] += v * rGain;
  }
};

const addSubHit = (time, amp = 0.34) => {
  const duration = 0.62;
  const start = Math.floor(time * sampleRate);
  const end = Math.min(frames, Math.floor((time + duration) * sampleRate));
  for (let i = start; i < end; i++) {
    const t = (i - start) / sampleRate;
    const env = Math.exp(-6.8 * t);
    const hz = 74 - 28 * Math.min(1, t / duration);
    const v = Math.sin(Math.PI * 2 * hz * t) * env * amp;
    left[i] += v * 0.72;
    right[i] += v * 0.72;
  }
};

const addClick = (time, amp = 0.14, pan = 0) => {
  const duration = 0.055;
  const start = Math.floor(time * sampleRate);
  const end = Math.min(frames, Math.floor((time + duration) * sampleRate));
  const lGain = Math.sqrt((1 - pan) * 0.5);
  const rGain = Math.sqrt((1 + pan) * 0.5);
  let prev = 0;
  for (let i = start; i < end; i++) {
    const t = (i - start) / sampleRate;
    const n = rand();
    const hp = n - prev * 0.86;
    prev = n;
    const env = Math.pow(1 - t / duration, 5);
    const v = hp * env * amp;
    left[i] += v * lGain;
    right[i] += v * rGain;
  }
};

const addWhoosh = (time, duration = 0.42, amp = 0.085, panStart = -0.7, panEnd = 0.7) => {
  const start = Math.floor(time * sampleRate);
  const end = Math.min(frames, Math.floor((time + duration) * sampleRate));
  let smooth = 0;
  for (let i = start; i < end; i++) {
    const t = (i - start) / sampleRate;
    const p = t / duration;
    smooth = smooth * 0.84 + rand() * 0.16;
    const shaped = rand() - smooth;
    const env = Math.sin(Math.PI * Math.min(1, p));
    const pan = panStart + (panEnd - panStart) * p;
    const lGain = Math.sqrt((1 - pan) * 0.5);
    const rGain = Math.sqrt((1 + pan) * 0.5);
    const v = shaped * env * amp;
    left[i] += v * lGain;
    right[i] += v * rGain;
  }
};

// Barely audible nocturnal bed, keeping the piece from feeling digitally empty.
for (let i = 0; i < frames; i++) {
  const t = i / sampleRate;
  const fadeIn = Math.min(1, t / 1.8);
  const fadeOut = Math.min(1, (seconds - t) / 2.0);
  const env = Math.max(0, Math.min(fadeIn, fadeOut));
  const drone =
    Math.sin(Math.PI * 2 * 55 * t) * 0.010 +
    Math.sin(Math.PI * 2 * 82.5 * t + 0.9) * 0.006 +
    Math.sin(Math.PI * 2 * 110 * t + 2.1) * 0.003;
  left[i] += drone * env;
  right[i] += drone * env;
}

// Scene accents. These line up with the visual match-cuts.
const hits = [0.18, 2.55, 6.95, 10.95, 14.45, 18.45, 22.0, 26.05, 28.55];
hits.forEach((t, index) => {
  addSubHit(t, index === 0 ? 0.22 : index === hits.length - 1 ? 0.28 : 0.18);
  addClick(t + 0.018, 0.09, index % 2 === 0 ? -0.3 : 0.3);
});

// Kinetic edit clicks / typography accents.
[
  0.55, 0.92, 1.28, 1.72, 2.12,
  3.20, 3.72, 4.18, 4.72, 5.28, 5.92,
  7.55, 8.18, 8.72, 9.38, 10.0,
  11.42, 11.95, 12.48, 13.02, 13.58,
  15.05, 15.62, 16.22, 16.82, 17.42,
  19.08, 19.72, 20.32, 20.92, 21.48,
  22.58, 23.18, 23.78, 24.38, 25.02, 25.58,
  26.58, 27.12, 27.68,
].forEach((t, i) => addClick(t, 0.055 + (i % 4) * 0.01, (i % 5 - 2) * 0.16));

// Directional transitions.
addWhoosh(2.22, 0.52, 0.075, -0.8, 0.65);
addWhoosh(6.58, 0.58, 0.078, 0.7, -0.7);
addWhoosh(10.55, 0.55, 0.082, -0.75, 0.8);
addWhoosh(14.04, 0.56, 0.082, 0.8, -0.75);
addWhoosh(18.03, 0.52, 0.078, -0.8, 0.7);
addWhoosh(21.64, 0.52, 0.078, 0.7, -0.7);
addWhoosh(25.62, 0.62, 0.092, -0.8, 0.8);
addWhoosh(28.02, 0.72, 0.065, 0.4, -0.4);

// Final warm harmonic resolve.
addTone(28.58, 1.20, 440, 0.055, -0.18, 0.35);
addTone(28.66, 1.28, 659.25, 0.040, 0.12, 0.25);
addTone(28.75, 1.20, 880, 0.025, 0.26, 0.18);

// Gentle limiter.
for (let i = 0; i < frames; i++) {
  left[i] = Math.tanh(left[i] * 1.35) * 0.82;
  right[i] = Math.tanh(right[i] * 1.35) * 0.82;
}

const outDir = path.resolve('public/audio');
fs.mkdirSync(outDir, {recursive: true});
const outPath = path.join(outDir, 'bikol-motion.wav');

const bytesPerSample = 2;
const dataSize = frames * channels * bytesPerSample;
const buffer = Buffer.alloc(44 + dataSize);
let o = 0;
const str = (s) => { buffer.write(s, o, 'ascii'); o += s.length; };
const u32 = (n) => { buffer.writeUInt32LE(n, o); o += 4; };
const u16 = (n) => { buffer.writeUInt16LE(n, o); o += 2; };

str('RIFF');
u32(36 + dataSize);
str('WAVE');
str('fmt ');
u32(16);
u16(1);
u16(channels);
u32(sampleRate);
u32(sampleRate * channels * bytesPerSample);
u16(channels * bytesPerSample);
u16(bytesPerSample * 8);
str('data');
u32(dataSize);

for (let i = 0; i < frames; i++) {
  buffer.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(left[i] * 32767))), o); o += 2;
  buffer.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(right[i] * 32767))), o); o += 2;
}

fs.writeFileSync(outPath, buffer);
console.log(`Generated ${outPath}`);
