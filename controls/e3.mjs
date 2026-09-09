// E3: the large base inside the same loop. T39 (primary) and the 24-item cost set (secondary), 3 repetitions.
// Arms: 8B one-shot, 8B + repair, 70B one-shot, 70B + repair, 70B verifier-selected resampling; budget 4 generations each.
import { writeFileSync } from 'node:fs';
import { TASKS, DEFAULT_FIRST_SHOT_SUFFIX, runConstraintRepair, pairedDeltaCI } from 'file:///../kit/dist/src/index.js';
import { makeBedrockBase, itemBootstrap, PRICE_PER_M, pct, ppf } from './bedrock.mjs';

const REPS = 3, BUDGET = 4;
const small = makeBedrockBase('llama8b', 'e3-llama8b'), big = makeBedrockBase('llama70b', 'e3-llama70b');
// The 2026-08-25 cost pilot's script holds a 15-item HELD array (keys id, p, c), not the 24 items its readout reports, so the
// secondary set could not be recovered as one array; per the addendum, T39 stands alone and this is recorded.
const sets = [
  { name: 'T39', items: TASKS.map(t => ({ id: t.id, prompt: t.prompt, suffix: DEFAULT_FIRST_SHOT_SUFFIX, check: r => t.check(r) })) },
];
const out = { experiment: 'E3', models: { small: small.modelId, big: big.modelId }, temperature: 0.7, budget: BUDGET, reps: REPS, pricePerM: PRICE_PER_M, date: new Date().toISOString(), sets: {} };
for (const set of sets) {
  const perItem = {}; const reps = [];
  for (let rep = 1; rep <= REPS; rep++) {
    const arms = { s1: [], sR: [], b1: [], bR: [], bN: [] }; const rows = [];
    for (const it of set.items) {
      const tok = {}; const meter = (b, arm, f) => async () => { const i0 = b.inputTokens, o0 = b.outputTokens; const v = await f(); tok[arm] = (b.inputTokens - i0) + (b.outputTokens - o0); return v; };
      small.ctx = { exp: 'E3', set: set.name, rep, item: it.id, arm: 's-first' };
      const sFirst = await meter(small, 's1', () => small.generate(it.prompt + it.suffix))(); const s1 = it.check(sFirst).ok;
      small.ctx = { exp: 'E3', set: set.name, rep, item: it.id, arm: 's-repair' };
      const sRep = await meter(small, 'sR', () => runConstraintRepair({ task: { id: it.id, prompt: it.prompt }, check: it.check, generate: p => small.generate(p), config: { enabled: true, maxRetries: BUDGET - 1 }, firstText: sFirst }))();
      tok.sR += tok.s1;
      big.ctx = { exp: 'E3', set: set.name, rep, item: it.id, arm: 'b-first' };
      const bFirst = await meter(big, 'b1', () => big.generate(it.prompt + it.suffix))(); const b1 = it.check(bFirst).ok;
      big.ctx = { exp: 'E3', set: set.name, rep, item: it.id, arm: 'b-repair' };
      const bRep = await meter(big, 'bR', () => runConstraintRepair({ task: { id: it.id, prompt: it.prompt }, check: it.check, generate: p => big.generate(p), config: { enabled: true, maxRetries: BUDGET - 1 }, firstText: bFirst }))();
      tok.bR += tok.b1;
      let bN = b1; const i0 = big.inputTokens, o0 = big.outputTokens;
      for (let k = 1; k < BUDGET; k++) { big.ctx = { exp: 'E3', set: set.name, rep, item: it.id, arm: 'b-resample', draw: k + 1 }; const d = await big.generate(it.prompt + it.suffix); if (it.check(d).ok) bN = true; }
      tok.bN = (big.inputTokens - i0) + (big.outputTokens - o0) + tok.b1;
      arms.s1.push({ id: it.id, passed: s1 }); arms.sR.push({ id: it.id, passed: sRep.ok }); arms.b1.push({ id: it.id, passed: b1 }); arms.bR.push({ id: it.id, passed: bRep.ok }); arms.bN.push({ id: it.id, passed: bN });
      rows.push({ id: it.id, s1, sR: sRep.ok, sRcalls: 1 + sRep.retries, b1, bR: bRep.ok, bRcalls: 1 + bRep.retries, bN, tokens: tok });
      (perItem[it.id] ??= []).push({ rep, s1, sR: sRep.ok, b1, bR: bRep.ok, bN });
      console.log(`E3 ${set.name} rep${rep} ${it.id.padEnd(22)} 8B ${s1 ? 'P' : 'f'}->${sRep.ok ? 'P' : 'f'}  70B ${b1 ? 'P' : 'f'}->${bRep.ok ? 'P' : 'f'} bon ${bN ? 'P' : 'f'}`);
    }
    const rate = a => a.filter(x => x.passed).length / a.length;
    const tokens = k => rows.reduce((s, r) => s + (r.tokens[k] || 0), 0);
    const cost = (k, m) => tokens(k) / 1e6 * PRICE_PER_M[m];
    const passes = k => arms[k].filter(x => x.passed).length;
    reps.push({ rep, rates: { s1: rate(arms.s1), sR: rate(arms.sR), b1: rate(arms.b1), bR: rate(arms.bR), bN: rate(arms.bN) },
      sRminusbR: pairedDeltaCI(arms.bR, arms.sR, { seed: 12345 }), bRminusb1: pairedDeltaCI(arms.b1, arms.bR, { seed: 12345 }), bRminusbN: pairedDeltaCI(arms.bN, arms.bR, { seed: 12345 }), sRminusb1: pairedDeltaCI(arms.b1, arms.sR, { seed: 12345 }),
      tokens: { s1: tokens('s1'), sR: tokens('sR'), b1: tokens('b1'), bR: tokens('bR'), bN: tokens('bN') },
      illustrativeCostPerPass: { s1: cost('s1', 'llama8b') / Math.max(1, passes('s1')), sR: cost('sR', 'llama8b') / Math.max(1, passes('sR')), b1: cost('b1', 'llama70b') / Math.max(1, passes('b1')), bR: cost('bR', 'llama70b') / Math.max(1, passes('bR')), bN: cost('bN', 'llama70b') / Math.max(1, passes('bN')) }, rows });
    console.log(`E3 ${set.name} rep${rep}: 8B ${pct(rate(arms.s1))}->${pct(rate(arms.sR))} | 70B ${pct(rate(arms.b1))}->${pct(rate(arms.bR))} resample ${pct(rate(arms.bN))}`);
    out.sets[set.name] = { repetitions: reps }; writeFileSync('./results-e3.json', JSON.stringify(out, null, 2));
  }
  const pool = (a, b) => itemBootstrap(Object.values(perItem).map(x => x.reduce((s, r) => s + (r[a] ? 1 : 0) - (r[b] ? 1 : 0), 0) / x.length));
  const p = pool('sR', 'bR');
  out.sets[set.name].pooled = { sRminusbR: p, bRminusb1: pool('bR', 'b1'), bRminusbN: pool('bR', 'bN'), sRminusb1: pool('sR', 'b1'), sRminuss1: pool('sR', 's1') };
  out.sets[set.name].verdict = p.lo > 0 ? '8B+repair beat 70B+repair at the same budget' : p.hi < 0 ? '70B+repair beat 8B+repair at the same budget' : 'no separation between 8B+repair and 70B+repair: interval includes zero';
  console.log(`E3 ${set.name} pooled 8B+repair minus 70B+repair ${ppf(p.mean)} [${ppf(p.lo)}, ${ppf(p.hi)}] | ${out.sets[set.name].verdict}`);
  writeFileSync('./results-e3.json', JSON.stringify(out, null, 2));
}
out.calls = { small: small.calls, big: big.calls }; out.tokens = { small: small.inputTokens + small.outputTokens, big: big.inputTokens + big.outputTokens }; out.errors = { small: small.errors, big: big.errors };
writeFileSync('./results-e3.json', JSON.stringify(out, null, 2));
console.log('E3 DONE', JSON.stringify(out.calls), 'errors', JSON.stringify(out.errors));
