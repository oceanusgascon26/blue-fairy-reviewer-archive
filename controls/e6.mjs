// E6: durable learning rerun with the isolation recorded. Haiku 4.5, twenty new words, one seeded substitution cipher.
// Session one (cold, feedback, consolidation, store) and session two (fresh process, store loaded from disk, organ wraps the
// base) are separate operating-system processes; so are the supplied-key control (A) and the cold repeat (B).
// Usage: node e6.mjs                       runs all repetitions (the parent), spawning one child process per session
//        node e6.mjs --phase s2|A|B --rep N  a child session
import { spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { DurableLearningOrgan, JsonFileStore } from 'file:///../kit/dist/src/index.js';
import { makeBedrockBase, itemBootstrap, ppf, pct } from './bedrock.mjs';

const DIR = '.';
const WORDS = ['harvest', 'pillow', 'canyon', 'whisper', 'timber', 'saddle', 'velvet', 'ember', 'quartz', 'ribbon', 'falcon', 'marble', 'pepper', 'tunnel', 'anchor', 'glacier', 'basket', 'copper', 'violin', 'oyster'];
const REPS = 3, SEED = 20260909;
function mulberry(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const ALPHA = 'abcdefghijklmnopqrstuvwxyz'.split('');
function makeMap() { const rng = mulberry(SEED); const p = ALPHA.slice(); for (let i = p.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } const m = {}; ALPHA.forEach((c, i) => m[c] = p[i]); return m; }
const MAP = makeMap(); const enc = w => w.split('').map(c => MAP[c] ?? c).join('');
const prompt = c => `Decode the following word. It was encoded with a letter substitution cipher. Reply with only the decoded word.\nEncoded word: ${c}`;
const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const score = (resp, word) => ({ contains: norm(resp).includes(word), exact: norm(resp) === word });
const lessonText = pairs => {
  const m = {}; for (const [c, p] of pairs) for (let i = 0; i < c.length; i++) m[c[i]] = p[i];
  return 'In the letter substitution cipher used in this task, each encoded letter stands for a plain letter as follows: ' + Object.keys(m).sort().map(k => `${k} means ${m[k]}`).join(', ') + '. To decode a word, replace every encoded letter with its plain letter.';
};

const args = process.argv.slice(2); const phase = args.includes('--phase') ? args[args.indexOf('--phase') + 1] : 'parent'; const rep = args.includes('--rep') ? Number(args[args.indexOf('--rep') + 1]) : 0;

if (phase !== 'parent') {
  // a child session: a fresh process. s2 loads the store from disk and lets the organ wrap the base; A supplies the key in the prompt; B is a cold repeat.
  const base = makeBedrockBase('haiku', `e6-haiku`);
  const storePath = `${DIR}/raw/e6-store-rep${rep}.json`;
  let gen, promptOf;
  if (phase === 's2') { const store = new JsonFileStore(storePath); const organ = new DurableLearningOrgan(store, { enabled: true }); const wrapped = organ.wrap(base); gen = p => wrapped.generate(p); promptOf = c => prompt(c); }
  else if (phase === 'A') { const lesson = JSON.parse(readFileSync(storePath, 'utf8'))[0].content; gen = p => base.generate(p); promptOf = c => `You have learned the following in earlier sessions. Apply it:\n- ${lesson}\n\n${prompt(c)}`; }
  else { gen = p => base.generate(p); promptOf = c => prompt(c); }
  const rows = [];
  for (const w of WORDS) { base.ctx = { exp: 'E6', rep, phase, item: w, fresh_process: process.pid }; const r = await gen(promptOf(enc(w))); rows.push({ word: w, encoded: enc(w), response: r, ...score(r, w) }); }
  writeFileSync(`${DIR}/raw/e6-${phase}-rep${rep}.json`, JSON.stringify({ phase, rep, pid: process.pid, storeLoaded: phase === 's2' ? existsSync(storePath) : false, rows }, null, 2));
  process.exit(0);
}

// parent: run the sequence for each repetition
const out = { experiment: 'E6', model: 'us.anthropic.claude-haiku-4-5-20251001-v1:0', temperature: 0.7, words: WORDS, seed: SEED, mapping: MAP, reps: REPS, date: new Date().toISOString(), repetitions: [] };
const perItem = {};
for (let r = 1; r <= REPS; r++) {
  const storePath = `${DIR}/raw/e6-store-rep${r}.json`; if (existsSync(storePath)) rmSync(storePath);
  // session one, this process, empty store
  const base = makeBedrockBase('haiku', 'e6-haiku'); const store = new JsonFileStore(storePath); const organ = new DurableLearningOrgan(store, { enabled: true });
  const cold = []; const pairs = [];
  for (const w of WORDS) { base.ctx = { exp: 'E6', rep: r, phase: 's1-cold', item: w }; const resp = await base.generate(prompt(enc(w))); cold.push({ word: w, encoded: enc(w), response: resp, ...score(resp, w) }); pairs.push([enc(w), w]); }
  organ.learn({ id: `substitution-rule-rep${r}`, cue: 'decode', content: lessonText(pairs), createdAt: new Date().toISOString() });
  console.log(`E6 rep${r} session one: cold contains ${cold.filter(x => x.contains).length}/20, lesson stored (${store.size()} lesson in store)`);
  // sessions two, A, B: fresh processes
  const run = ph => { const res = spawnSync(process.execPath, [`${DIR}/e6.mjs`, '--phase', ph, '--rep', String(r)], { encoding: 'utf8', stdio: 'inherit' }); if (res.status !== 0) throw new Error(`${ph} failed`); return JSON.parse(readFileSync(`${DIR}/raw/e6-${ph}-rep${r}.json`, 'utf8')); };
  const s2 = run('s2'), A = run('A'), B = run('B');
  const cnt = (rows, k) => rows.filter(x => x[k]).length;
  const repOut = { rep: r, cold: { contains: cnt(cold, 'contains'), exact: cnt(cold, 'exact') }, warm: { contains: cnt(s2.rows, 'contains'), exact: cnt(s2.rows, 'exact'), storeLoaded: s2.storeLoaded },
    suppliedKey: { contains: cnt(A.rows, 'contains'), exact: cnt(A.rows, 'exact') }, coldRepeat: { contains: cnt(B.rows, 'contains'), exact: cnt(B.rows, 'exact') }, rows: { cold, warm: s2.rows, suppliedKey: A.rows, coldRepeat: B.rows } };
  out.repetitions.push(repOut);
  WORDS.forEach((w, i) => (perItem[w] ??= []).push({ rep: r, cold: cold[i].contains, warm: s2.rows[i].contains, key: A.rows[i].contains, coldB: B.rows[i].contains, warmExact: s2.rows[i].exact, keyExact: A.rows[i].exact }));
  console.log(`E6 rep${r}: cold ${repOut.cold.contains}/20 warm ${repOut.warm.contains}/20 (exact ${repOut.warm.exact}) supplied-key ${repOut.suppliedKey.contains}/20 (exact ${repOut.suppliedKey.exact}) cold-repeat ${repOut.coldRepeat.contains}/20`);
  writeFileSync(`${DIR}/results-e6.json`, JSON.stringify(out, null, 2));
}
const pool = (a, b) => itemBootstrap(Object.values(perItem).map(x => x.reduce((s, q) => s + (q[a] ? 1 : 0) - (q[b] ? 1 : 0), 0) / x.length));
out.pooled = { warmMinusCold: pool('warm', 'cold'), warmMinusKey: pool('warm', 'key'), keyMinusCold: pool('key', 'cold'), warmExactMinusKeyExact: pool('warmExact', 'keyExact') };
const p = out.pooled.warmMinusCold;
out.verdict = p.lo > 0 ? 'the stored rule changed behaviour on a real base (warm above cold)' : 'warm did not separate from cold: persistence through the public mechanism did not change behaviour';
writeFileSync(`${DIR}/results-e6.json`, JSON.stringify(out, null, 2));
console.log(`E6 DONE warm-cold ${ppf(p.mean)} [${ppf(p.lo)}, ${ppf(p.hi)}] | warm-key ${ppf(out.pooled.warmMinusKey.mean)} | ${out.verdict}`);
