// E2: repair against verifier-selected resampling at a budget of 4 generations fixed in advance. Haiku 4.5, T39, 5 repetitions.
import { writeFileSync } from 'node:fs';
import { TASKS, DEFAULT_FIRST_SHOT_SUFFIX, runConstraintRepair, pairedDeltaCI } from 'file:///../kit/dist/src/index.js';
import { makeBedrockBase, itemBootstrap, pct, ppf } from './bedrock.mjs';

const REPS = 5, BUDGET = 4;
const base = makeBedrockBase('haiku', 'e2-haiku');
const out = { experiment: 'E2', model: base.modelId, temperature: 0.7, budget: BUDGET, reps: REPS, date: new Date().toISOString(), repetitions: [] };
const perItem = {};   // id -> arrays over reps
for (let rep = 1; rep <= REPS; rep++) {
  const one = [], rp = [], bon = [], rows = [];
  for (const t of TASKS) {
    base.ctx = { exp: 'E2', rep, item: t.id, arm: 'first' };
    const first = await base.generate(t.prompt + DEFAULT_FIRST_SHOT_SUFFIX);
    const firstOk = t.check(first).ok;
    base.ctx = { exp: 'E2', rep, item: t.id, arm: 'repair' };
    const r = await runConstraintRepair({ task: { id: t.id, prompt: t.prompt }, check: t.check, generate: p => base.generate(p), config: { enabled: true, maxRetries: BUDGET - 1 }, firstText: first });
    const draws = [first]; let bonOk = firstOk;
    for (let k = 1; k < BUDGET; k++) {
      base.ctx = { exp: 'E2', rep, item: t.id, arm: 'resample', draw: k + 1 };
      const d = await base.generate(t.prompt + DEFAULT_FIRST_SHOT_SUFFIX); draws.push(d); if (t.check(d).ok) bonOk = true;
    }
    one.push({ id: t.id, passed: firstOk }); rp.push({ id: t.id, passed: r.ok }); bon.push({ id: t.id, passed: bonOk });
    rows.push({ id: t.id, firstOk, repairOk: r.ok, repairCalls: 1 + r.retries, resampleOk: bonOk, resamplePasses: draws.filter(d => t.check(d).ok).length });
    (perItem[t.id] ??= []).push({ rep, firstOk, repairOk: r.ok, resampleOk: bonOk });
    console.log(`E2 rep${rep} ${t.id.padEnd(20)} one=${firstOk ? 'P' : 'f'} repair=${r.ok ? 'P' : 'f'}(${1 + r.retries}) resample=${bonOk ? 'P' : 'f'}`);
  }
  const rvb = pairedDeltaCI(bon, rp, { seed: 12345 }), rvo = pairedDeltaCI(one, rp, { seed: 12345 }), bvo = pairedDeltaCI(one, bon, { seed: 12345 });
  out.repetitions.push({ rep, oneShot: rvo.baseRate, repair: rvo.organRate, resample: bvo.organRate, repairMinusResample: rvb, repairMinusOneShot: rvo, resampleMinusOneShot: bvo, rows });
  console.log(`E2 rep${rep}: one-shot ${pct(rvo.baseRate)} repair ${pct(rvo.organRate)} resample ${pct(bvo.organRate)} | repair-resample ${ppf(rvb.delta)} [${ppf(rvb.lo)}, ${ppf(rvb.hi)}]`);
  writeFileSync('./results-e2.json', JSON.stringify(out, null, 2));
}
// pooled: per-item mean delta over repetitions, cluster bootstrap over items
const pool = k => itemBootstrap(Object.values(perItem).map(a => a.reduce((s, x) => s + (x[k[0]] ? 1 : 0) - (x[k[1]] ? 1 : 0), 0) / a.length));
out.pooled = { repairMinusResample: pool(['repairOk', 'resampleOk']), repairMinusOneShot: pool(['repairOk', 'firstOk']), resampleMinusOneShot: pool(['resampleOk', 'firstOk']),
  meanRepairCalls: out.repetitions.flatMap(r => r.rows.map(x => x.repairCalls)).reduce((s, v) => s + v, 0) / (REPS * TASKS.length) };
out.calls = base.calls; out.inputTokens = base.inputTokens; out.outputTokens = base.outputTokens; out.errors = base.errors;
const p = out.pooled.repairMinusResample;
out.verdict = p.lo > 0 ? 'repair beat verifier-selected resampling at the fixed budget' : p.hi < 0 ? 'resampling beat repair at the fixed budget' : 'no separation at the fixed budget: interval includes zero';
writeFileSync('./results-e2.json', JSON.stringify(out, null, 2));
console.log(`E2 DONE pooled repair-resample ${ppf(p.mean)} [${ppf(p.lo)}, ${ppf(p.hi)}] | ${out.verdict} | ${base.calls} calls, ${base.errors} errors`);
