// E1: failure probabilities behind the failing-subset rule. Bare Haiku 4.5, 8 draws per item, T39 and T20.
import { writeFileSync } from 'node:fs';
import { TASKS, DEFAULT_FIRST_SHOT_SUFFIX } from '../kit/dist/src/index.js';
import { C20 } from './c20.mjs';
import { makeBedrockBase } from './bedrock.mjs';

const DRAWS = 8;
const base = makeBedrockBase('haiku', 'e1-haiku');
const sets = [
  { name: 'T39', items: TASKS.map(t => ({ id: t.id, prompt: t.prompt + DEFAULT_FIRST_SHOT_SUFFIX, ok: r => t.check(r).ok })) },
  { name: 'T20', items: C20.map(c => ({ id: c.id, prompt: c.prompt, ok: r => c.check(r).pass })) },
];
const out = { experiment: 'E1', model: base.modelId, temperature: 0.7, draws: DRAWS, date: new Date().toISOString(), sets: {} };
for (const set of sets) {
  const rows = [];
  for (const it of set.items) {
    const passes = [];
    for (let d = 0; d < DRAWS; d++) {
      base.ctx = { exp: 'E1', set: set.name, item: it.id, draw: d + 1 };
      const r = await base.generate(it.prompt);
      passes.push(it.ok(r));
    }
    const fails = passes.filter(p => !p).length;
    rows.push({ id: it.id, passes, pFail: fails / DRAWS, firstDrawFail: !passes[0], majorityFail: fails > DRAWS / 2 });
    console.log(`E1 ${set.name} ${it.id.padEnd(20)} fails ${fails}/${DRAWS}`);
  }
  const single = rows.filter(r => r.firstDrawFail).length, majority = rows.filter(r => r.majorityFail).length;
  const disagree = rows.filter(r => r.firstDrawFail !== r.majorityFail).length;
  const expectedHeadroom = rows.reduce((s, r) => s + r.pFail, 0) / rows.length;
  out.sets[set.name] = { n: rows.length, rows, singleDrawFailures: single, majorityFailures: majority, disagreements: disagree, singleDrawHeadroom: single / rows.length, expectedHeadroom };
  console.log(`E1 ${set.name}: single-draw failures ${single}, majority failures ${majority}, disagreements ${disagree}, expected headroom ${(100 * expectedHeadroom).toFixed(1)}%`);
  writeFileSync('./results-e1.json', JSON.stringify(out, null, 2));
}
out.calls = base.calls; out.inputTokens = base.inputTokens; out.outputTokens = base.outputTokens; out.errors = base.errors;
writeFileSync('./results-e1.json', JSON.stringify(out, null, 2));
console.log('E1 DONE', base.calls, 'calls', base.errors, 'errors');
