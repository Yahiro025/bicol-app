import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const main = path.join(root, 'src', 'BikolArchiveVertical30.tsx');
if (!fs.existsSync(main)) throw new Error('Missing src/BikolArchiveVertical30.tsx');
const source = fs.readFileSync(main, 'utf8');
const expected = [['HookScene',120],['EntryScene',120],['DialectScene',120],['GrammarScene',150],['PracticeScene',150],['CommunityScene',120],['CloseScene',120]];
for (const [name, frames] of expected) {
  if (!source.includes(`<${name} />`)) throw new Error(`Missing scene ${name}`);
  if (!source.includes(`durationInFrames={${frames}}`)) throw new Error(`Missing duration ${frames}`);
  if (!fs.existsSync(path.join(root,'src','vertical',`${name}.tsx`))) throw new Error(`Missing scene file ${name}.tsx`);
}
if (expected.reduce((s,[,f])=>s+f,0) !== 900) throw new Error('Scene duration total must equal 900');
const rootSource = fs.readFileSync(path.join(root,'src','Root.tsx'),'utf8');
for (const needle of ['id="BikolArchiveVertical30"','width={1080}','height={1920}','durationInFrames={900}']) {
  if (!rootSource.includes(needle)) throw new Error(`Root missing ${needle}`);
}
for (const file of fs.readdirSync(path.join(root,'src','vertical'))) {
  if (!file.endsWith('.tsx')) continue;
  const text = fs.readFileSync(path.join(root,'src','vertical',file),'utf8');
  if (/animation\s*:|transition\s*:/.test(text)) throw new Error(`${file} uses CSS animation/transition`);
}
console.log('vertical-remotion-contract: PASS');
