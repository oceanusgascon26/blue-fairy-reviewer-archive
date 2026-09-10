// E7: what the free-text constraint parser reads. Deterministic, no model calls. Runs the kit's deriveConstraintCheckers
// (commit 3d20393) over IFEval's 541 labeled prompts and over 300 hand-labeled natural prompts from Dolly 15k, and reports
// recall on the instruction types the parser is built to read, unsupported fires, false triggers and precision.
import { readFileSync, writeFileSync } from 'node:fs';
import { deriveConstraintCheckers } from '../kit/dist/src/organs/instruction-following/checkers.js';

const DIR = '.';
const IFEVAL = './ifeval/input_data.jsonl';
// frozen coverage map: the IFEval instruction types the parser has a kind for, and the kind it should emit
const COVER = {
  'change_case:english_lowercase': 'all-lowercase', 'change_case:english_capital': 'all-uppercase', 'punctuation:no_comma': 'no-comma',
  'detectable_format:json_format': 'json', 'startend:end_checker': 'ends-with', 'detectable_format:number_bullet_lists': 'line-count',
};
const KINDS = ['word-count', 'sentence-count', 'no-letter', 'all-lowercase', 'all-uppercase', 'comma-count', 'no-comma', 'json', 'line-count', 'ends-with', 'sentence-start', 'word-times', 'word-caps'];
const kindsOf = text => [...new Set(deriveConstraintCheckers(text).map(c => c.id))];
function wilson(k, n, z = 1.96) { if (!n) return { p: null, lo: null, hi: null, k, n }; const p = k / n, d = 1 + z * z / n, c = (p + z * z / (2 * n)) / d, h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d; return { p, lo: c - h, hi: c + h, k, n }; }

// IFEval
const ife = readFileSync(IFEVAL, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
const perType = {}; let coverablePrompts = 0, coverableHit = 0; const unsupported = {}; const unsupportedExamples = {}; let promptsWithFire = 0;
for (const r of ife) {
  const kinds = kindsOf(r.prompt); if (kinds.length) promptsWithFire++;
  const expected = new Set(r.instruction_id_list.filter(t => COVER[t]).map(t => COVER[t]));
  if (expected.size) { coverablePrompts++; if ([...expected].some(k => kinds.includes(k))) coverableHit++; }
  for (const t of r.instruction_id_list) if (COVER[t]) { const s = (perType[t] ||= { n: 0, hit: 0 }); s.n++; if (kinds.includes(COVER[t])) s.hit++; }
  for (const k of kinds) if (!expected.has(k)) { unsupported[k] = (unsupported[k] || 0) + 1; (unsupportedExamples[k] ||= []).length < 3 && unsupportedExamples[k].push({ key: r.key, types: r.instruction_id_list, prompt: r.prompt.slice(0, 220) }); }
}
const typeCounts = {}; for (const r of ife) for (const t of r.instruction_id_list) typeCounts[t] = (typeCounts[t] || 0) + 1;
const ifevalOut = { prompts: ife.length, instructionTypes: Object.keys(typeCounts).length, typesCovered: Object.keys(COVER).length, coverableInstructions: Object.values(perType).reduce((s, x) => s + x.n, 0),
  recallByType: Object.fromEntries(Object.entries(perType).map(([t, s]) => [t, wilson(s.hit, s.n)])), recallCoverableInstructions: wilson(Object.values(perType).reduce((s, x) => s + x.hit, 0), Object.values(perType).reduce((s, x) => s + x.n, 0)),
  coverablePrompts, promptRecall: wilson(coverableHit, coverablePrompts), promptsWithAnyFire: promptsWithFire, unsupportedFiresByKind: unsupported, unsupportedFires: Object.values(unsupported).reduce((s, x) => s + x, 0), unsupportedExamples };

// Dolly, hand-labeled before this script ran
const sample = JSON.parse(readFileSync(`${DIR}/dolly-sample-300.json`, 'utf8'));
const labels = JSON.parse(readFileSync(`${DIR}/dolly-labels-300.json`, 'utf8')); const lab = Object.fromEntries(labels.map(x => [x.i, x]));
let no = 0, noFired = 0, yes = 0, yesHit = 0, fires = 0, firesRight = 0; const falseTriggers = [], misses = [], hits = [], wrongKind = [];
for (const r of sample) {
  const L = lab[r.i]; if (!L) throw new Error('unlabeled ' + r.i);
  const kinds = kindsOf(r.instruction);
  if (L.label === 'no') { no++; if (kinds.length) { noFired++; fires += kinds.length; falseTriggers.push({ i: r.i, kinds, instruction: r.instruction.slice(0, 200) }); } }
  else { yes++; const want = Array.isArray(L.kind) ? L.kind : [L.kind]; if (kinds.length) { fires += kinds.length; const right = kinds.filter(k => want.includes(k)).length; firesRight += right; if (right) { yesHit++; hits.push({ i: r.i, kinds, want }); } else wrongKind.push({ i: r.i, kinds, want, instruction: r.instruction.slice(0, 200) }); } else misses.push({ i: r.i, want, instruction: r.instruction.slice(0, 200) }); }
}
const dollyOut = { prompts: sample.length, labeledNo: no, labeledYes: yes, falseTriggerRate: wilson(noFired, no), recallOnLabeledYes: wilson(yesHit, yes), precisionOfFires: wilson(firesRight, fires), fires, falseTriggers, misses, wrongKind, hits: hits.length,
  labelKinds: Object.fromEntries(KINDS.map(k => [k, labels.filter(x => x.label === 'yes' && (Array.isArray(x.kind) ? x.kind : [x.kind]).includes(k)).length])) };

const out = { experiment: 'E7', parser: 'deriveConstraintCheckers, cognitive-middleware 3d20393', date: new Date().toISOString(), kinds: KINDS, coverageMap: COVER, ifeval: ifevalOut, dolly: dollyOut };
writeFileSync(`${DIR}/results-e7.json`, JSON.stringify(out, null, 1));
const P = w => w.p === null ? 'n/a' : `${(100 * w.p).toFixed(1)}% [${(100 * w.lo).toFixed(1)}, ${(100 * w.hi).toFixed(1)}] (${w.k}/${w.n})`;
console.log(`IFEval: ${ife.length} prompts, ${ifevalOut.instructionTypes} instruction types, parser covers ${ifevalOut.typesCovered}; coverable instructions ${ifevalOut.coverableInstructions}, recall ${P(ifevalOut.recallCoverableInstructions)}; coverable prompts ${coverablePrompts}, prompt recall ${P(ifevalOut.promptRecall)}; prompts with any fire ${promptsWithFire}; unsupported fires ${ifevalOut.unsupportedFires} ${JSON.stringify(unsupported)}`);
for (const [t, w] of Object.entries(ifevalOut.recallByType)) console.log(`  ${t.padEnd(42)} ${P(w)}`);
console.log(`Dolly: ${no} labeled no, ${yes} labeled yes; false-trigger rate ${P(dollyOut.falseTriggerRate)}; recall on yes ${P(dollyOut.recallOnLabeledYes)}; precision of fires ${P(dollyOut.precisionOfFires)}; misses ${misses.length}, wrong kind ${wrongKind.length}`);
for (const x of falseTriggers) console.log('  FALSE TRIGGER', x.i, x.kinds, '|', x.instruction.slice(0, 120));
for (const x of misses.slice(0, 12)) console.log('  MISS', x.i, x.want, '|', x.instruction.slice(0, 120));
for (const x of wrongKind) console.log('  WRONG KIND', x.i, x.kinds, 'wanted', x.want, '|', x.instruction.slice(0, 120));
