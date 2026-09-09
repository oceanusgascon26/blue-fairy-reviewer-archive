// E6c: the stack with a final-line rule (addendum 3). Four arms in fresh processes on the E6 words and stores, three repetitions.
// Usage: node e6c.mjs (parent) | node e6c.mjs --arm neither|memory|repair|both --rep N
import { spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { DurableLearningOrgan, JsonFileStore, runConstraintRepair } from 'file:///../kit/dist/src/index.js';
import { makeBedrockBase, itemBootstrap, ppf } from './bedrock.mjs';

const DIR = '.';
const WORDS = ['harvest', 'pillow', 'canyon', 'whisper', 'timber', 'saddle', 'velvet', 'ember', 'quartz', 'ribbon', 'falcon', 'marble', 'pepper', 'tunnel', 'anchor', 'glacier', 'basket', 'copper', 'violin', 'oyster'];
const REPS = 3, SEED = 20260909, BUDGET = 4;
function mulberry(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const ALPHA = 'abcdefghijklmnopqrstuvwxyz'.split('');
function makeMap() { const rng = mulberry(SEED); const p = ALPHA.slice(); for (let i = p.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } const m = {}; ALPHA.forEach((c, i) => m[c] = p[i]); return m; }
const MAP = makeMap(); const enc = w => w.split('').map(c => MAP[c] ?? c).join('');
const prompt = c => `Decode the following word. It was encoded with a letter substitution cipher. Work through the substitution letter by letter, then write the decoded word by itself on the last line.\nEncoded word: ${c}`;
const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const lastLine = t => { const ls = t.trim().split('\n').map(l => l.trim()).filter(Boolean); return (ls.length ? ls[ls.length - 1] : '').replace(/^[*_`"']+|[*_`"'.]+$/g, '').trim(); };
const formatCheck = t => { const l = lastLine(t); const ok = /^[A-Za-z]+$/.test(l); return { ok, violation: ok ? '' : 'the last line of the reply must be the decoded word by itself, a single word of letters and nothing else' }; };
const grade = (resp, word) => ({ exact: norm(lastLine(resp)) === word, contains: norm(resp).includes(word), format: formatCheck(resp).ok });

const args = process.argv.slice(2); const arm = args.includes('--arm') ? args[args.indexOf('--arm') + 1] : 'parent'; const rep = args.includes('--rep') ? Number(args[args.indexOf('--rep') + 1]) : 0;

if (arm !== 'parent') {
  const base = makeBedrockBase('haiku', 'e6c-haiku'); const storePath = `${DIR}/raw/e6-store-rep${rep}.json`;
  if (!existsSync(storePath)) throw new Error('E6 store missing for rep ' + rep);
  let model = base;
  if (arm === 'memory' || arm === 'both') { const store = new JsonFileStore(storePath); if (store.size() !== 1) throw new Error('store must hold exactly one lesson'); model = new DurableLearningOrgan(store, { enabled: true }).wrap(base); }
  const rows = [];
  for (const w of WORDS) {
    base.ctx = { exp: 'E6c', rep, arm, item: w, fresh_process: process.pid };
    let text, calls = 1;
    if (arm === 'repair' || arm === 'both') { const r = await runConstraintRepair({ task: { id: w, prompt: prompt(enc(w)) }, check: formatCheck, generate: p => model.generate(p), config: { enabled: true, maxRetries: BUDGET - 1 } }); text = r.text; calls = 1 + r.retries; }
    else text = await model.generate(prompt(enc(w)));
    rows.push({ word: w, encoded: enc(w), response: text, lastLine: lastLine(text), calls, ...grade(text, w) });
  }
  writeFileSync(`${DIR}/raw/e6c-${arm}-rep${rep}.json`, JSON.stringify({ arm, rep, pid: process.pid, rows }, null, 2)); process.exit(0);
}

const ARMS = ['neither', 'memory', 'repair', 'both'];
const out = { experiment: 'E6c', model: 'us.anthropic.claude-haiku-4-5-20251001-v1:0', temperature: 0.7, budget: BUDGET, reps: REPS, words: WORDS, date: new Date().toISOString(), repetitions: [] };
const perItem = {};
for (let r = 1; r <= REPS; r++) {
  const res = {};
  for (const a of ARMS) {
    const p = spawnSync(process.execPath, [`${DIR}/e6c.mjs`, '--arm', a, '--rep', String(r)], { encoding: 'utf8', stdio: 'inherit' }); if (p.status !== 0) throw new Error(a + ' failed');
    res[a] = JSON.parse(readFileSync(`${DIR}/raw/e6c-${a}-rep${r}.json`, 'utf8')).rows;
  }
  const cnt = (rows, k) => rows.filter(x => x[k]).length;
  const summary = {}; for (const a of ARMS) summary[a] = { exact: cnt(res[a], 'exact'), contains: cnt(res[a], 'contains'), format: cnt(res[a], 'format'), meanCalls: res[a].reduce((s, x) => s + x.calls, 0) / res[a].length };
  out.repetitions.push({ rep: r, summary, rows: res });
  WORDS.forEach((w, i) => (perItem[w] ??= []).push(Object.fromEntries(ARMS.map(a => [a, res[a][i].exact]))));
  console.log(`E6c rep${r}: ` + ARMS.map(a => `${a} exact ${summary[a].exact}/20 contains ${summary[a].contains} format ${summary[a].format} calls ${summary[a].meanCalls.toFixed(2)}`).join(' | '));
  writeFileSync(`${DIR}/results-e6c.json`, JSON.stringify(out, null, 2));
}
const pool = f => itemBootstrap(Object.values(perItem).map(x => x.reduce((s, q) => s + f(q), 0) / x.length));
const bothMinusBest = pool(q => (q.both ? 1 : 0) - Math.max(q.memory ? 1 : 0, q.repair ? 1 : 0));
const interaction = pool(q => (q.both ? 1 : 0) - (q.memory ? 1 : 0) - (q.repair ? 1 : 0) + (q.neither ? 1 : 0));
out.pooled = { bothMinusBestSingle: bothMinusBest, interactionExact: interaction, both: pool(q => q.both ? 1 : 0), memory: pool(q => q.memory ? 1 : 0), repair: pool(q => q.repair ? 1 : 0), neither: pool(q => q.neither ? 1 : 0) };
const repairCorrect = out.repetitions.reduce((s, r) => s + r.summary.repair.contains, 0);
out.verdict = repairCorrect > 3 ? 'VOID PENDING INSPECTION: repair alone produced correct answers, which it should not be able to' : bothMinusBest.lo > 0 ? 'the redesigned stack delivered correct answers in the requested form that neither organ alone delivered' : 'the redesigned stack did not beat the better single organ on final-line exact match';
writeFileSync(`${DIR}/results-e6c.json`, JSON.stringify(out, null, 2));
console.log(`E6c DONE both-minus-best ${ppf(bothMinusBest.mean)} [${ppf(bothMinusBest.lo)}, ${ppf(bothMinusBest.hi)}] | interaction ${ppf(interaction.mean)} [${ppf(interaction.lo)}, ${ppf(interaction.hi)}] | ${out.verdict}`);
