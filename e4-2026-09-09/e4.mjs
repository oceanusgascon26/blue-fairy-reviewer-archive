// E4: grammar-constrained decoding against the repair loop and verifier-selected resampling, on a local CPU llama.cpp build
// (Llama 3.1 8B Instruct Q4_K_M), under preregistration addendum 5. Never touches her GPU or her llama-server ports.
//   node e4.mjs --keywords   print the frozen topic-keyword map and exit (no model calls)
//   node e4.mjs --smoke      one bare and one constrained call on the first task, logged to raw/smoke.jsonl
//   node e4.mjs              the full run: 39 tasks x 3 repetitions x 4 arms, raw log + results-e4.json
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { TASKS, runConstraintRepair, DEFAULT_FIRST_SHOT_SUFFIX } from 'file:///../kit/dist/src/index.js';

const DIR = '.';
const URL = 'http://127.0.0.1:18080';
const MODEL = 'Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf (bartowski) on llama.cpp b10883, CPU only';
const TEMP = 0.7, MAXTOK = 400, BUDGET = 4, REPS = 3, SEED0 = 20260909;
const G = JSON.parse(readFileSync(`${DIR}/grammars.json`, 'utf8')).grammars;
const smoke = process.argv.includes('--smoke');
mkdirSync(`${DIR}/raw`, { recursive: true });
const LOG = smoke ? `${DIR}/raw/smoke.jsonl` : `${DIR}/raw/e4-llama8b-q4.jsonl`;

// frozen topic-keyword rule: the noun phrase after "about" or "of" in the prompt, its last word, a trailing s dropped on words longer than three letters;
// not applicable to the JSON tasks and the bullet lists, whose prompts name no topic the answer must repeat
function keyword(task) {
  if (/^json-|^bullets-/.test(task.id)) return null;
  const m = task.prompt.match(/(?:about|of) (?:the |a |an )?([A-Za-z ]+?)(?=[.,]| in exactly| that | using | containing | where | with | in ALL)/);
  if (!m) return null;
  const w = m[1].trim().split(/\s+/).pop().toLowerCase();
  return w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w;
}
const KEYWORDS = Object.fromEntries(TASKS.map(t => [t.id, keyword(t)]));
if (process.argv.includes('--keywords')) { for (const t of TASKS) console.log(`${t.id.padEnd(20)} ${String(KEYWORDS[t.id]).padEnd(14)} ${t.prompt}`); writeFileSync(`${DIR}/keywords.json`, JSON.stringify(KEYWORDS, null, 1) + '\n'); console.log('keywords.json written; first-shot suffix =', JSON.stringify(DEFAULT_FIRST_SHOT_SUFFIX)); process.exit(0); }

const CLASS = id => /^wordcount-|^wc-/.test(id) ? 'word count' : /^no-/.test(id) ? 'forbidden letter' : /^sentences-|^sent-/.test(id) ? 'sentence count' : /^json-/.test(id) ? 'JSON shape' : /^bullets-/.test(id) ? 'bullet lines'
  : /^lowercase|^uppercase|^title-/.test(id) ? 'casing' : /^startswith-|^start-/.test(id) ? 'sentence-initial letter' : /commas/.test(id) ? 'comma count' : /^word-twice|^water-|^time-/.test(id) ? 'word frequency' : 'ending';

let genSettings = null, ctx = {};
async function applyTemplate(content) {
  const r = await fetch(`${URL}/apply-template`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content }] }) });
  if (!r.ok) throw new Error('apply-template HTTP ' + r.status);
  return (await r.json()).prompt;
}
async function gen(userPrompt, seed, grammar) {
  const t0 = Date.now(); let text = '', tin = 0, tout = 0, stop = null, err = null;
  try {
    const prompt = await applyTemplate(userPrompt);
    const body = { prompt, temperature: TEMP, n_predict: MAXTOK, seed, cache_prompt: false, stream: false };
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
  appendFileSync(LOG, JSON.stringify({ ts: new Date().toISOString(), exp: 'E4', ...ctx, model: MODEL, temperature: TEMP, seed, grammar: !!grammar, prompt: userPrompt, text, tokensIn: tin, tokensOut: tout, ms, stop, error: err }) + '\n');
  return { text, tin, tout, ms, stop, err };
}
const seed = (rep, idx, arm, k) => (SEED0 + rep * 100000 + idx * 100 + arm * 10 + k) >>> 0;
const hit = (task, text) => KEYWORDS[task.id] == null ? null : text.toLowerCase().includes(KEYWORDS[task.id]);
const sum = a => a.reduce((x, y) => x + y, 0);

if (smoke) {
  const t = TASKS[0]; ctx = { rep: 0, item: t.id, arm: 'smoke-first' };
  const f = await gen(t.prompt + DEFAULT_FIRST_SHOT_SUFFIX, 1, null); console.log('bare:', JSON.stringify(f.text), t.check(f.text), f.tout, 'tokens', f.ms, 'ms', f.stop, f.err);
  ctx = { rep: 0, item: t.id, arm: 'smoke-constrained' };
  const c = await gen(t.prompt + DEFAULT_FIRST_SHOT_SUFFIX, 2, G[t.id]); console.log('constrained:', JSON.stringify(c.text), t.check(c.text), c.tout, 'tokens', c.ms, 'ms', c.stop, c.err);
  console.log('generation settings:', JSON.stringify(genSettings)); process.exit(0);
}

const out = { experiment: 'E4', model: MODEL, temperature: TEMP, maxTokens: MAXTOK, budget: BUDGET, reps: REPS, seed0: SEED0, date: new Date().toISOString(), generationSettings: null, repetitions: [] };
const per = new Map();  // id -> list of rows across reps
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
    rows.push({ id: task.id, class: CLASS(task.id), oneShot: ok1, repair: okr, repairCalls: calls, resample: okb, constrained: okc, constrainedStop: c.stop, constrainedError: c.err,
      constrainedViolation: okc ? null : (c.err ? 'error' : task.check(c.text).violation), topic: { first: hit(task, f.text), repair: hit(task, res.text || f.text), resample: hit(task, bestB), constrained: hit(task, c.text) },
      tokensOut: { first: f.tout, repair: sum(rTok), resample: sum(bTok), constrained: c.tout }, ms: { first: f.ms, repair: sum(rMs), resample: sum(bMs), constrained: c.ms }, constrainedText: c.text.slice(0, 400) });
    if (!per.has(task.id)) per.set(task.id, []); per.get(task.id).push(rows[rows.length - 1]);
    console.log(`E4 rep${rep} ${task.id.padEnd(20)} one=${ok1 ? 'P' : 'f'} repair=${okr ? 'P' : 'f'}(${calls}) resample=${okb ? 'P' : 'f'} constrained=${okc ? 'P' : 'f'}${c.stop === 'limit' ? ' LIMIT' : ''}${c.err ? ' ERR' : ''}`);
  }
  const n = rows.length, rate = k => sum(rows.map(r => r[k] ? 1 : 0)) / n;
  out.repetitions.push({ rep, rates: { oneShot: rate('oneShot'), repair: rate('repair'), resample: rate('resample'), constrained: rate('constrained') }, rows });
  out.generationSettings = genSettings; writeFileSync(`${DIR}/results-e4.json`, JSON.stringify(out, null, 1));
  console.log(`E4 rep${rep}: one-shot ${(100 * rate('oneShot')).toFixed(1)}% repair ${(100 * rate('repair')).toFixed(1)}% resample ${(100 * rate('resample')).toFixed(1)}% constrained ${(100 * rate('constrained')).toFixed(1)}%`);
}
// cluster bootstrap over the 39 items, carrying their repetitions; 2,000 resamples, seed 12345
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function boot(values, iters = 2000, s = 12345) { const rnd = mulberry32(s); const n = values.length; const means = []; for (let i = 0; i < iters; i++) { let acc = 0; for (let k = 0; k < n; k++) acc += values[Math.floor(rnd() * n)]; means.push(acc / n); } means.sort((a, b) => a - b); return { mean: sum(values) / n, lo: means[Math.floor(iters * 0.025)], hi: means[Math.floor(iters * 0.975) - 1], n }; }
const contrast = (a, b) => boot([...per.values()].map(rs => sum(rs.map(r => (r[a] ? 1 : 0) - (r[b] ? 1 : 0))) / rs.length));
const arm = a => boot([...per.values()].map(rs => sum(rs.map(r => (r[a] ? 1 : 0))) / rs.length));
out.pooled = { constrainedMinusRepair: contrast('constrained', 'repair'), constrainedMinusResample: contrast('constrained', 'resample'), constrainedMinusOneShot: contrast('constrained', 'oneShot'),
  repairMinusOneShot: contrast('repair', 'oneShot'), repairMinusResample: contrast('repair', 'resample'), oneShot: arm('oneShot'), repair: arm('repair'), resample: arm('resample'), constrained: arm('constrained') };
const allRows = out.repetitions.flatMap(r => r.rows);
out.byClass = {}; for (const r of allRows) { const c = out.byClass[r.class] ||= { n: 0, oneShot: 0, repair: 0, resample: 0, constrained: 0 }; c.n++; for (const k of ['oneShot', 'repair', 'resample', 'constrained']) c[k] += r[k] ? 1 : 0; }
out.cost = {}; for (const k of ['first', 'repair', 'resample', 'constrained']) out.cost[k] = { generations: k === 'first' ? allRows.length : k === 'repair' ? sum(allRows.map(r => r.repairCalls)) : k === 'resample' ? allRows.length * BUDGET : allRows.length, tokensOut: sum(allRows.map(r => r.tokensOut[k])), ms: sum(allRows.map(r => r.ms[k])) };
out.topic = {}; for (const k of ['first', 'repair', 'resample', 'constrained']) { const v = allRows.map(r => r.topic[k]).filter(x => x !== null); out.topic[k] = { applicable: v.length, hits: v.filter(Boolean).length }; }
out.constrainedLimitHits = allRows.filter(r => r.constrainedStop === 'limit').length; out.constrainedErrors = allRows.filter(r => r.constrainedError).length;
const p = out.pooled.constrainedMinusRepair;
out.verdict = p.lo > 0 ? 'grammar-constrained decoding beat the repair loop on the self-authored set at one generation against up to four' : p.hi < 0 ? 'the repair loop beat grammar-constrained decoding on the self-authored set' : 'no separation on the self-authored set between grammar-constrained decoding and the repair loop';
writeFileSync(`${DIR}/results-e4.json`, JSON.stringify(out, null, 1));
const P = x => (100 * x).toFixed(1);
console.log(`E4 DONE: one-shot ${P(out.pooled.oneShot.mean)} repair ${P(out.pooled.repair.mean)} resample ${P(out.pooled.resample.mean)} constrained ${P(out.pooled.constrained.mean)} | constrained-repair ${P(p.mean)} [${P(p.lo)}, ${P(p.hi)}] | verdict: ${out.verdict}`);
