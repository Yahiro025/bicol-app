import fs from 'node:fs';
import path from 'node:path';

const sampleRate = 48000;
const seconds = 30;
const channels = 2;
const frames = sampleRate * seconds;
const left = new Float32Array(frames);
const right = new Float32Array(frames);

let seed = 0x42494b4f;
const rand = () => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return ((seed >>> 0) / 0xffffffff) * 2 - 1;
};

const writeStereo = (i, v, pan = 0) => {
  if (i < 0 || i >= frames) return;
  const l = Math.sqrt((1 - pan) * 0.5);
  const r = Math.sqrt((1 + pan) * 0.5);
  left[i] += v * l;
  right[i] += v * r;
};

const hit = (time, amp = 0.18) => {
  const start = Math.floor(time * sampleRate);
  const duration = 0.62;
  for (let i = start; i < Math.min(frames, start + duration * sampleRate); i++) {
    const t = (i - start) / sampleRate;
    const env = Math.exp(-7.2 * t);
    const hz = 78 - 34 * Math.min(1, t / duration);
    writeStereo(i, Math.sin(Math.PI * 2 * hz * t) * env * amp, 0);
  }
};

const click = (time, amp = 0.06, pan = 0) => {
  const start = Math.floor(time * sampleRate);
  const duration = 0.045;
  let smooth = 0;
  for (let i = start; i < Math.min(frames, start + duration * sampleRate); i++) {
    const t = (i - start) / sampleRate;
    smooth = smooth * 0.72 + rand() * 0.28;
    const env = Math.pow(Math.max(0, 1 - t / duration), 4.2);
    writeStereo(i, (rand() - smooth) * env * amp, pan);
  }
};

const whoosh = (time, duration = 0.55, amp = 0.075, from = -0.75, to = 0.75) => {
  const start = Math.floor(time * sampleRate);
  let smooth = 0;
  for (let i = start; i < Math.min(frames, start + duration * sampleRate); i++) {
    const t = (i - start) / sampleRate;
    const p = t / duration;
    smooth = smooth * 0.9 + rand() * 0.1;
    const env = Math.sin(Math.PI * Math.min(1, p));
    const pan = from + (to - from) * p;
    writeStereo(i, (rand() - smooth) * env * amp, pan);
  }
};

const tone = (time, duration, hz, amp, pan = 0) => {
  const start = Math.floor(time * sampleRate);
  for (let i = start; i < Math.min(frames, start + duration * sampleRate); i++) {
    const t = (i - start) / sampleRate;
    const attack = Math.min(1, t / 0.02);
    const release = Math.pow(Math.max(0, 1 - t / duration), 2.2);
    const v = (Math.sin(Math.PI * 2 * hz * t) + 0.22 * Math.sin(Math.PI * 4 * hz * t)) * attack * release * amp;
    writeStereo(i, v, pan);
  }
};

// Quiet nocturnal bed. Enough to give the visuals weight without becoming music-first.
for (let i = 0; i < frames; i++) {
  const t = i / sampleRate;
  const inEnv = Math.min(1, t / 1.4);
  const outEnv = Math.min(1, (seconds - t) / 1.6);
  const env = Math.max(0, Math.min(inEnv, outEnv));
  const drone =
    Math.sin(Math.PI * 2 * 55 * t) * 0.008 +
    Math.sin(Math.PI * 2 * 82.5 * t + 0.8) * 0.005 +
    Math.sin(Math.PI * 2 * 110 * t + 2.2) * 0.0025;
  writeStereo(i, drone * env, 0);
}

// Major story beats: hook, search, dialects, conjugation, practice, community, end card.
[0.22, 3.20, 8.07, 12.27, 17.00, 21.73, 25.67, 28.45].forEach((t, i) => {
  hit(t, i === 0 ? 0.16 : i === 7 ? 0.22 : 0.15);
  click(t + 0.018, 0.075, i % 2 ? 0.25 : -0.25);
});

// Hook letter cadence.
[0.46, 0.57, 0.68, 0.79, 0.90, 1.01, 1.12].forEach((t, i) => click(t, 0.055, (i - 3) * 0.12));

// Search / metadata cadence.
[3.55, 4.12, 4.72, 5.36, 6.02, 6.68, 7.22].forEach((t, i) => click(t, 0.045 + (i % 3) * 0.009, i % 2 ? 0.28 : -0.28));

// Conjugation transformations.
[13.35, 14.10, 14.86, 15.62].forEach((t, i) => {
  click(t, 0.085, (i - 1.5) * 0.22);
  tone(t, 0.16, 330 + i * 55, 0.018, (i - 1.5) * 0.18);
});

// Practice carousel moves.
[18.05, 19.45, 20.85].forEach((t, i) => {
  whoosh(t - 0.18, 0.38, 0.048, i % 2 ? 0.55 : -0.55, i % 2 ? -0.55 : 0.55);
  click(t, 0.055, i === 1 ? 0 : i === 0 ? -0.3 : 0.3);
});

// Archive tile population.
[22.10, 22.42, 22.74, 23.06, 23.38, 23.70, 24.02, 24.34, 24.66].forEach((t, i) => click(t, 0.032, (i % 5 - 2) * 0.16));

// Directional transition sweeps.
whoosh(2.78, 0.62, 0.075, -0.85, 0.7);
whoosh(7.64, 0.66, 0.078, 0.75, -0.75);
whoosh(11.88, 0.62, 0.083, -0.8, 0.8);
whoosh(16.56, 0.66, 0.082, 0.8, -0.78);
whoosh(21.30, 0.58, 0.072, -0.8, 0.7);
whoosh(25.22, 0.70, 0.09, 0.75, -0.75);

// Warm resolve under the final lockup.
tone(28.40, 1.48, 440, 0.045, -0.16);
tone(28.52, 1.40, 659.25, 0.032, 0.10);
tone(28.64, 1.28, 880, 0.020, 0.22);

// Gentle limiter.
for (let i = 0; i < frames; i++) {
  left[i] = Math.tanh(left[i] * 1.4) * 0.84;
  right[i] = Math.tanh(right[i] * 1.4) * 0.84;
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

str('RIFF'); u32(36 + dataSize); str('WAVE'); str('fmt '); u32(16); u16(1); u16(channels);
u32(sampleRate); u32(sampleRate * channels * bytesPerSample); u16(channels * bytesPerSample); u16(16);
str('data'); u32(dataSize);

for (let i = 0; i < frames; i++) {
  buffer.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(left[i] * 32767))), o); o += 2;
  buffer.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(right[i] * 32767))), o); o += 2;
}

fs.writeFileSync(outPath, buffer);
console.log(`Generated ${outPath}`);
