// P4 core: budget-matched, held-out capability-per-dollar comparison.
// Arms: small one-shot | small + repair organ | big one-shot | big best-of-n (call-matched to repair).
// Machine-checkable axis only. Single exploratory run. Bedrock is not bit-deterministic.
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const PROFILE = '<AWS_PROFILE>', REGION = 'us-east-1';
const TMP = '../p4-2026-08-26';
const SMALL = 'us.meta.llama3-1-8b-instruct-v1:0';
const BIG = 'us.meta.llama3-3-70b-instruct-v1:0';
const K = 5; // repair budget and best-of-n budget (matched)
// illustrative blended $/1M tokens, VERIFY AT USE
const PRICE = { [SMALL]: 0.15, [BIG]: 0.72 };

function converse(modelId, user, { temperature = 0.5, maxTokens = 300 } = {}) {
  writeFileSync(`${TMP}/_m.json`, JSON.stringify([{ role: 'user', content: [{ text: user }] }]));
  const args = ['bedrock-runtime', 'converse', '--model-id', modelId, '--messages', `file://${TMP}/_m.json`,
    '--inference-config', `maxTokens=${maxTokens},temperature=${temperature}`,
    '--region', REGION, '--profile', PROFILE, '--output', 'json'];
  const r = spawnSync('aws', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' } });
  if (r.status !== 0) return { err: (r.stderr || '').trim().slice(0, 300), inTok: 0, outTok: 0, text: '' };
  try {
    const j = JSON.parse(r.stdout);
    const text = (j.output?.message?.content || []).filter(x => x.text).map(x => x.text).join('\n').trim();
    return { text, inTok: j.usage?.inputTokens || 0, outTok: j.usage?.outputTokens || 0 };
  } catch (e) { return { err: 'parse: ' + e.message, inTok: 0, outTok: 0, text: '' }; }
}
const clean = t => (t || '').replace(/```[a-z]*|```/g, '').trim();
const words = t => clean(t).split(/\s+/).filter(Boolean);
const sentences = t => (clean(t).match(/[^.!?]+[.!?]/g) || []);

// ---- held-out checkable tasks (fresh, not the kit's tuned set) ----
const T = [
  ['w20', 'Write a sentence about the tide that is exactly 20 words. Output only the sentence.', t => { const n = words(t).length; return { pass: n === 20, msg: `got ${n} words, need 20` }; }],
  ['w15', 'Describe a lighthouse in exactly 15 words. Output only the description.', t => { const n = words(t).length; return { pass: n === 15, msg: `got ${n} words, need 15` }; }],
  ['w33', 'Write exactly 33 words about rain. Output only the words.', t => { const n = words(t).length; return { pass: n === 33, msg: `got ${n} words, need 33` }; }],
  ['w42', 'Write exactly 42 words about a harbor at dawn. Output only the words.', t => { const n = words(t).length; return { pass: n === 42, msg: `got ${n} words, need 42` }; }],
  ['noE', 'Write two sentences about a boat that contain no letter e. Output only the sentences.', t => { const c = clean(t); return { pass: !/e/i.test(c) && sentences(c).length >= 2, msg: /e/i.test(c) ? 'contains the letter e' : 'need two sentences' }; }],
  ['noA', 'Write one sentence about the moon with no letter a. Output only the sentence.', t => ({ pass: !/a/i.test(clean(t)) && clean(t).length > 0, msg: 'contains the letter a' })],
  ['noS', 'Write one sentence about winter that uses no letter s. Output only the sentence.', t => ({ pass: !/s/i.test(clean(t)) && clean(t).length > 0, msg: 'contains the letter s' })],
  ['lower', 'Write a sentence about a river in all lowercase letters. Output only the sentence.', t => ({ pass: clean(t).length > 0 && !/[A-Z]/.test(clean(t)), msg: 'contains an uppercase letter' })],
  ['nocomma', 'Write two sentences about a forest with no commas anywhere. Output only the sentences.', t => ({ pass: !clean(t).includes(',') && sentences(t).length >= 2, msg: clean(t).includes(',') ? 'contains a comma' : 'need two sentences' })],
  ['nodigit', 'Write a sentence about the year ahead using no digit characters. Output only the sentence.', t => ({ pass: !/[0-9]/.test(clean(t)) && clean(t).length > 0, msg: 'contains a digit' })],
  ['jsonNAC', 'Output only valid JSON with exactly the keys name, age, and city. No prose.', t => { try { const o = JSON.parse(clean(t)); const k = Object.keys(o).sort().join(','); return { pass: k === 'age,city,name', msg: `keys were ${k}` }; } catch { return { pass: false, msg: 'not valid JSON' }; } }],
  ['jsonTAY', 'Output only valid JSON with exactly the keys title, author, and year. No prose.', t => { try { const o = JSON.parse(clean(t)); const k = Object.keys(o).sort().join(','); return { pass: k === 'author,title,year', msg: `keys were ${k}` }; } catch { return { pass: false, msg: 'not valid JSON' }; } }],
  ['jsonArr3', 'Output only a JSON array of exactly three strings, each a color. No prose.', t => { try { const a = JSON.parse(clean(t)); return { pass: Array.isArray(a) && a.length === 3 && a.every(x => typeof x === 'string'), msg: `array length ${Array.isArray(a) ? a.length : 'n/a'}` }; } catch { return { pass: false, msg: 'not a JSON array' }; } }],
  ['sent3', 'Write exactly three sentences about a garden. Output only the sentences.', t => { const n = sentences(t).length; return { pass: n === 3, msg: `got ${n} sentences, need 3` }; }],
  ['sent5', 'Write exactly five sentences about a train journey. Output only the sentences.', t => { const n = sentences(t).length; return { pass: n === 5, msg: `got ${n} sentences, need 5` }; }],
  ['startT', 'Write three sentences about tea, and every sentence must start with the word The. Output only the sentences.', t => { const s = sentences(t); return { pass: s.length === 3 && s.every(x => /^\s*The\b/.test(x)), msg: 'not every sentence starts with The, or not 3 sentences' }; }],
  ['dataX3', 'Write a short paragraph about analytics that uses the word data exactly three times. Output only the paragraph.', t => { const n = (clean(t).toLowerCase().match(/\bdata\b/g) || []).length; return { pass: n === 3, msg: `used data ${n} times, need 3` }; }],
  ['seaX2', 'Write a short paragraph that uses the word sea exactly twice. Output only the paragraph.', t => { const n = (clean(t).toLowerCase().match(/\bsea\b/g) || []).length; return { pass: n === 2, msg: `used sea ${n} times, need 2` }; }],
  ['title12', 'Write a 12-word book title in Title Case where every word is capitalized. Output only the title.', t => { const w = words(t); return { pass: w.length === 12 && w.every(x => /^[A-Z0-9]/.test(x)), msg: `got ${w.length} words, or a word not capitalized` }; }],
  ['qmark', 'Write a single sentence about the future that ends with a question mark. Output only the sentence.', t => ({ pass: /\?\s*$/.test(clean(t)) && sentences(t).length === 1, msg: 'does not end with a question mark, or not one sentence' })],
  ['lines3', 'Write exactly three lines about autumn, one per line. Output only the three lines.', t => { const n = clean(t).split(/\n+/).filter(x => x.trim()).length; return { pass: n === 3, msg: `got ${n} lines, need 3` }; }],
  ['w25low', 'Write exactly 25 words about a market, all in lowercase. Output only the words.', t => { const c = clean(t); const n = words(c).length; return { pass: n === 25 && !/[A-Z]/.test(c), msg: n !== 25 ? `got ${n} words, need 25` : 'contains uppercase' }; }],
  ['noEone', 'Write a single sentence about a clock with no letter e. Output only the sentence.', t => ({ pass: !/e/i.test(clean(t)) && sentences(t).length === 1, msg: /e/i.test(clean(t)) ? 'contains the letter e' : 'not exactly one sentence' })],
  ['w30', 'Write exactly 30 words about a mountain path. Output only the words.', t => { const n = words(t).length; return { pass: n === 30, msg: `got ${n} words, need 30` }; }],
];

function oneShot(model, task) {
  const r = converse(model, task[1], { temperature: 0.5 });
  return { pass: r.err ? false : task[2](r.text).pass, calls: 1, inTok: r.inTok, outTok: r.outTok, err: r.err };
}
function repair(model, task, budget) {
  let calls = 0, inTok = 0, outTok = 0, prompt = task[1], last = '';
  for (let i = 0; i < budget; i++) {
    const p = i === 0 ? prompt : `${task[1]}\nA previous attempt failed this exact check: ${last}. Produce a corrected answer that satisfies the rule. Output only the answer.`;
    const r = converse(model, p, { temperature: 0.5 });
    calls++; inTok += r.inTok; outTok += r.outTok;
    if (r.err) continue;
    const c = task[2](r.text);
    if (c.pass) return { pass: true, calls, inTok, outTok };
    last = c.msg;
  }
  return { pass: false, calls, inTok, outTok };
}
function bestOfN(model, task, n) {
  let calls = 0, inTok = 0, outTok = 0, any = false;
  for (let i = 0; i < n; i++) {
    const r = converse(model, task[1], { temperature: 0.8 });
    calls++; inTok += r.inTok; outTok += r.outTok;
    if (!r.err && task[2](r.text).pass) any = true;
  }
  return { pass: any, calls, inTok, outTok };
}

const arms = {
  small_oneShot: t => oneShot(SMALL, t),
  small_repair: t => repair(SMALL, t, K),
  big_oneShot: t => oneShot(BIG, t),
  big_bestOfN: t => bestOfN(BIG, t, K),
};
const cost = (model, inTok, outTok) => ((inTok + outTok) / 1e6) * PRICE[model];

const per = {}; // arm -> array of {pass, cost}
for (const a of Object.keys(arms)) per[a] = [];
for (const task of T) {
  for (const a of Object.keys(arms)) {
    const r = arms[a](task);
    const model = a.startsWith('small') ? SMALL : BIG;
    per[a].push({ id: task[0], pass: r.pass ? 1 : 0, cost: cost(model, r.inTok, r.outTok), calls: r.calls });
    process.stdout.write(`${task[0]}/${a}:${r.pass ? 'P' : 'F'} `);
  }
  process.stdout.write('\n');
}

const mean = xs => xs.reduce((s, x) => s + x, 0) / xs.length;
const summary = {};
for (const a of Object.keys(arms)) {
  const c = per[a];
  summary[a] = {
    compliance: +(mean(c.map(x => x.pass)) * 100).toFixed(1),
    totalCost: +c.reduce((s, x) => s + x.cost, 0).toFixed(6),
    meanCalls: +mean(c.map(x => x.calls)).toFixed(2),
    n: c.length,
  };
}
// paired bootstrap on compliance deltas vs small_repair
function bootDelta(aPass, bPass, iters = 2000) {
  const n = aPass.length, diffs = [];
  for (let it = 0; it < iters; it++) {
    let s = 0;
    for (let i = 0; i < n; i++) { const j = Math.floor(Math.random() * n); s += (aPass[j] - bPass[j]); }
    diffs.push((s / n) * 100);
  }
  diffs.sort((x, y) => x - y);
  return { lo: +diffs[Math.floor(0.025 * iters)].toFixed(1), hi: +diffs[Math.floor(0.975 * iters)].toFixed(1) };
}
const sr = per.small_repair.map(x => x.pass);
const deltas = {
  repair_minus_bigOneShot: { pp: +((summary.small_repair.compliance - summary.big_oneShot.compliance)).toFixed(1), ci: bootDelta(sr, per.big_oneShot.map(x => x.pass)) },
  repair_minus_bigBestOfN: { pp: +((summary.small_repair.compliance - summary.big_bestOfN.compliance)).toFixed(1), ci: bootDelta(sr, per.big_bestOfN.map(x => x.pass)) },
  repair_minus_smallOneShot: { pp: +((summary.small_repair.compliance - summary.small_oneShot.compliance)).toFixed(1), ci: bootDelta(sr, per.small_oneShot.map(x => x.pass)) },
};
const complPerDollar = {};
for (const a of Object.keys(arms)) complPerDollar[a] = summary[a].totalCost > 0 ? +(summary[a].compliance / summary[a].totalCost).toFixed(0) : null;

const out = { n: T.length, K, models: { SMALL, BIG }, priceNote: 'illustrative blended $/1M, verify at use', summary, deltas, compliancePerDollar: complPerDollar, per };
writeFileSync(`${TMP}/results-p4.json`, JSON.stringify(out, null, 2));
console.log('\n=== SUMMARY ===');
for (const a of Object.keys(arms)) console.log(`${a}: ${summary[a].compliance}%  cost ~$${summary[a].totalCost}  meanCalls ${summary[a].meanCalls}`);
console.log('deltas vs small+repair:', JSON.stringify(deltas));
console.log('DONE');
