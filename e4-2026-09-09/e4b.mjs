// E4b: the three word-frequency constraints whose E4 grammars the server's parser rejected, rerun with the parser-safe grammars of
// grammars-e4b.json under preregistration addendum 6. Same base, server, settings and four arms as E4; new seed base; reported separately.
//   node e4b.mjs --parse-check   one-token generation on a neutral prompt under each grammar, to confirm the server parses them (before the freeze, disclosed)
//   node e4b.mjs --smoke         one bare and one constrained call on the first selected task, logged to raw/smoke-e4b.jsonl
//   node e4b.mjs                 the run: 3 tasks x 3 repetitions x 4 arms, raw/e4b-llama8b-q4.jsonl and results-e4b.json
import { readFileSync, writeFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { TASKS as ALL, runConstraintRepair, DEFAULT_FIRST_SHOT_SUFFIX } from '../kit/dist/src/index.js';

const DIR = '.';
const URL = 'http://127.0.0.1:18080';
const MODEL = 'Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf (bartowski) on llama.cpp b10883, CPU only';
const TEMP = 0.7, MAXTOK = 400, BUDGET = 4, REPS = 3, SEED0 = 20260910;
const ITEMS = ['word-twice', 'water-3', 'time-2'];
const TASKS = ALL.filter(t => ITEMS.includes(t.id));
const G = JSON.parse(readFileSync(`${DIR}/grammars-e4b.json`, 'utf8')).grammars;
const KEYWORDS = JSON.parse(readFileSync(`${DIR}/keywords.json`, 'utf8'));
const mode = process.argv.includes('--parse-check') ? 'parse' : process.argv.includes('--smoke') ? 'smoke' : 'run';
mkdirSync(`${DIR}/raw`, { recursive: true });
const LOG = mode === 'parse' ? `${DIR}/raw/parse-check-e4b.jsonl` : mode === 'smoke' ? `${DIR}/raw/smoke-e4b.jsonl` : `${DIR}/raw/e4b-llama8b-q4.jsonl`;

let genSettings = null, ctx = {};
async function applyTemplate(content) {
  const r = await fetch(`${URL}/apply-template`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content }] }) });
  if (!r.ok) throw new Error('apply-template HTTP ' + r.status);
  return (await r.json()).prompt;
}
async function gen(userPrompt, seed, grammar, opts = {}) {
  const t0 = Date.now(); let text = '', tin = 0, tout = 0, stop = null, err = null;
  try {
    const prompt = opts.raw ? userPrompt : await applyTemplate(userPrompt);
    const body = { prompt, temperature: TEMP, n_predict: opts.nPredict ?? MAXTOK, seed, cache_prompt: false, stream: false };
    if (grammar) body.grammar = grammar;
    const r = await fetch(`${URL}/completion`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json();
    if (!r.ok || j.error) err = JSON.stringify(j.error || j).slice(0, 300);
    else {
      text = (j.content || '').trim(); tin = j.tokens_evaluated || 0; tout = j.tokens_predicted || 0;
      stop = j.stop_type || (j.stopped_limit ? 'limit' : j.stopped_eos ? 'eos' : j.stopped_word ? 'word' : null);
      if (!genSettings && j.generation_settings) genSettings = j.generation_settings;
    }
  } catch (e) { err = String(e).slice(0, 300); }
  const ms = Date.now() - t0;
  appendFileSync(LOG, JSON.stringify({ ts: new Date().toISOString(), exp: 'E4b', ...ctx, model: MODEL, temperature: TEMP, seed, grammar: !!grammar, prompt: userPrompt, text, tokensIn: tin, tokensOut: tout, ms, stop, error: err }) + '\n');
  return { text, tin, tout, ms, stop, err };
}
const seed = (rep, idx, arm, k) => (SEED0 + rep * 100000 + idx * 100 + arm * 10 + k) >>> 0;
const hit = (task, text) => KEYWORDS[task.id] == null ? null : text.toLowerCase().includes(KEYWORDS[task.id]);
const sum = a => a.reduce((x, y) => x + y, 0);

if (mode === 'parse') {
  for (const t of TASKS) { ctx = { item: t.id, arm: 'parse-check' }; const r = await gen('Hello', 1, G[t.id], { raw: true, nPredict: 1 }); console.log(`parse-check ${t.id}: ${r.err ? 'REJECTED ' + r.err : 'parsed (' + r.tout + ' token)'}`); }
  process.exit(0);
}
if (mode === 'smoke') {
  const t = TASKS[0]; ctx = { rep: 0, item: t.id, arm: 'smoke-first' };
  const f = await gen(t.prompt + DEFAULT_FIRST_SHOT_SUFFIX, 1, null); console.log('bare:', JSON.stringify(f.text), t.check(f.text), f.tout, 'tokens', f.ms, 'ms', f.err);
  ctx = { rep: 0, item: t.id, arm: 'smoke-constrained' };
  const c = await gen(t.prompt + DEFAULT_FIRST_SHOT_SUFFIX, 2, G[t.id]); console.log('constrained:', JSON.stringify(c.text), t.check(c.text), c.tout, 'tokens', c.ms, 'ms', c.stop, c.err);
  process.exit(0);
}

const out = { experiment: 'E4b', items: ITEMS, model: MODEL, temperature: TEMP, maxTokens: MAXTOK, budget: BUDGET, reps: REPS, seed0: SEED0, date: new Date().toISOString(), generationSettings: null, repetitions: [] };
const per = new Map();
for (let rep = 1; rep <= REPS; rep++) {
  const rows = [];
  for (const [idx, task] of TASKS.entries()) {
    const base = task.prompt + DEFAULT_FIRST_SHOT_SUFFIX;
    ctx = { rep, item: task.id, arm: 'first' };
    const f = await gen(base, seed(rep, idx, 0, 0), null); const ok1 = !f.err && task.check(f.text).ok;
    let calls = 0; const rTok = [f.tout], rMs = [f.ms];
    const res = await runConstraintRepair({ task: { prompt: task.prompt }, check: task.check,
      generate: async (p) => { calls++; if (calls === 1) return f.text; ctx = { rep, item: task.id, arm: 'repair', retry: calls - 1 }; const g = await gen(p, seed(rep, idx, 1, calls), null); rTok.push(g.tout); rMs.push(g.ms); return g.text; },
      config: { enabled: true, maxRetries: BUDGET - 1 } });
    const okr = !!res.ok;
    let okb = ok1; const bTok = [f.tout], bMs = [f.ms]; let bestB = f.text;
    for (let k = 2; k <= BUDGET; k++) { ctx = { rep, item: task.id, arm: 'resample', draw: k }; const d = await gen(base, seed(rep, idx, 2, k), null); bTok.push(d.tout); bMs.push(d.ms); if (!okb && !d.err && task.check(d.text).ok) { okb = true; bestB = d.text; } }
    ctx = { rep, item: task.id, arm: 'constrained' };
    const c = await gen(base, seed(rep, idx, 3, 0), G[task.id]); const okc = !c.err && task.check(c.text).ok;
    rows.push({ id: task.id, class: 'word frequency', oneShot: ok1, repair: okr, repairCalls: calls, resample: okb, constrained: okc, constrainedStop: c.stop, constrainedError: c.err,
      constrainedViolation: okc ? null : (c.err ? 'error' : task.check(c.text).violation), topic: { first: hit(task, f.text), repair: hit(task, res.text || f.text), resample: hit(task, bestB), constrained: hit(task, c.text) },
      tokensOut: { first: f.tout, repair: sum(rTok), resample: sum(bTok), constrained: c.tout }, ms: { first: f.ms, repair: sum(rMs), resample: sum(bMs), constrained: c.ms }, constrainedText: c.text.slice(0, 400) });
    if (!per.has(task.id)) per.set(task.id, []); per.get(task.id).push(rows[rows.length - 1]);
    console.log(`E4b rep${rep} ${task.id.padEnd(12)} one=${ok1 ? 'P' : 'f'} repair=${okr ? 'P' : 'f'}(${calls}) resample=${okb ? 'P' : 'f'} constrained=${okc ? 'P' : 'f'}${c.stop === 'limit' ? ' LIMIT' : ''}${c.err ? ' ERR' : ''} | ${JSON.stringify(c.text.slice(0, 80))}`);
  }
  const n = rows.length, rate = k => sum(rows.map(r => r[k] ? 1 : 0)) / n;
  out.repetitions.push({ rep, rates: { oneShot: rate('oneShot'), repair: rate('repair'), resample: rate('resample'), constrained: rate('constrained') }, rows });
  out.generationSettings = genSettings; writeFileSync(`${DIR}/results-e4b.json`, JSON.stringify(out, null, 1));
}
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function boot(values, iters = 2000, s = 12345) { const rnd = mulberry32(s); const n = values.length; const means = []; for (let i = 0; i < iters; i++) { let acc = 0; for (let k = 0; k < n; k++) acc += values[Math.floor(rnd() * n)]; means.push(acc / n); } means.sort((a, b) => a - b); return { mean: sum(values) / n, lo: means[Math.floor(iters * 0.025)], hi: means[Math.floor(iters * 0.975) - 1], n }; }
const contrast = (a, b) => boot([...per.values()].map(rs => sum(rs.map(r => (r[a] ? 1 : 0) - (r[b] ? 1 : 0))) / rs.length));
const allRows = out.repetitions.flatMap(r => r.rows);
out.counts = {}; for (const k of ['oneShot', 'repair', 'resample', 'constrained']) out.counts[k] = { passed: sum(allRows.map(r => r[k] ? 1 : 0)), of: allRows.length };
out.pooled = { constrainedMinusRepair: contrast('constrained', 'repair'), constrainedMinusResample: contrast('constrained', 'resample'), constrainedMinusOneShot: contrast('constrained', 'oneShot') };
out.cost = {}; for (const k of ['first', 'repair', 'resample', 'constrained']) out.cost[k] = { generations: k === 'first' ? allRows.length : k === 'repair' ? sum(allRows.map(r => r.repairCalls)) : k === 'resample' ? allRows.length * BUDGET : allRows.length, tokensOut: sum(allRows.map(r => r.tokensOut[k])), ms: sum(allRows.map(r => r.ms[k])) };
out.topic = {}; for (const k of ['first', 'repair', 'resample', 'constrained']) { const v = allRows.map(r => r.topic[k]).filter(x => x !== null); out.topic[k] = { applicable: v.length, hits: v.filter(Boolean).length }; }
out.constrainedLimitHits = allRows.filter(r => r.constrainedStop === 'limit').length; out.constrainedErrors = allRows.filter(r => r.constrainedError).length;
writeFileSync(`${DIR}/results-e4b.json`, JSON.stringify(out, null, 1));
console.log(`E4b DONE: ${JSON.stringify(out.counts)} | constrained-repair ${(100 * out.pooled.constrainedMinusRepair.mean).toFixed(1)} [${(100 * out.pooled.constrainedMinusRepair.lo).toFixed(1)}, ${(100 * out.pooled.constrainedMinusRepair.hi).toFixed(1)}] over three item clusters (descriptive)`);
