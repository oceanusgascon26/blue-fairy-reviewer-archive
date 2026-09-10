// E9: the lesson-design follow-up to E8. Six arms in fresh processes over one fixed 120-prompt sequence, three repetitions,
// Haiku 4.5 on Bedrock. Parent: node e9.mjs [--mock]. Child: node e9.mjs --arm <arm> --rep <n> [--mock].
// --mock replaces the Bedrock base with a scripted fake so the whole pipeline runs without a network call (smoke test; its
// outputs go to smoke/ and are not data).
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { DurableLearningOrgan, JsonFileStore, runConstraintRepair, DEFAULT_FIRST_SHOT_SUFFIX } from '../kit/dist/src/index.js';
import { makeBedrockBase, itemBootstrap, benjaminiHochberg, ppf, pct, DIR } from './bedrock-e9.mjs';
import { buildTasks, check, selfCheck, CLASS_IDS, CLASSES, SUPPLIED_RULES, TOPICS, mulberry } from './e9-tasks.mjs';

export const ARMS = ['base', 'repair', 'wireA', 'wireB', 'wireC', 'supplied'];
const REPS = 3, BUDGET = 4, CONCURRENCY = 3;
const args = process.argv.slice(2);
const mock = args.includes('--mock');
const arm = args.includes('--arm') ? args[args.indexOf('--arm') + 1] : 'parent';
const rep = args.includes('--rep') ? Number(args[args.indexOf('--rep') + 1]) : 0;
const OUT = mock ? `${DIR}/smoke` : DIR;
mkdirSync(`${OUT}/raw`, { recursive: true }); mkdirSync(`${OUT}/stores`, { recursive: true });
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const sha = s => createHash('sha256').update(s).digest('hex');
const times = n => `${n} time${n === 1 ? '' : 's'}`;

// Scripted fake for the smoke test: varied canned texts so every checker sees passes and failures.
function makeMockBase(seed) {
  const rng = mulberry(seed);
  const canned = ['a quiet paragraph with no commas at all and a window and a window and a window.', 'The river runs past the window, past the ladder, and past the mirror. That is all.',
    'Short. Very short! Is it? Yes. Five. Six.', 'One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty.',
    'A plain paragraph without any commas that goes on for a while so that the word count lands somewhere in the middle of what the tasks ask for today and then a bit more.', 'river river river'];
  return { id: 'mock', ctx: {}, calls: 0, inputTokens: 0, outputTokens: 0, errors: 0, async generate() { this.calls += 1; return canned[Math.floor(rng() * canned.length)]; } };
}

const TASKS = buildTasks();

// Wire B summary of the misses of one class so far: direction and mean size, no task parameter.
function summarize(cls, misses) {
  const unit = CLASSES[cls].unit;
  if (cls === 'noletter') { const m = misses.reduce((s, x) => s + x, 0) / misses.length; return `the banned letter appeared ${m.toFixed(1)} times on average`; }
  const signed = misses; const over = signed.filter(x => x > 0).length, under = signed.filter(x => x < 0).length;
  const mean = signed.reduce((s, x) => s + Math.abs(x), 0) / signed.length;
  if (over && !under) return `the answers ran over by ${mean.toFixed(1)} ${unit} on average`;
  if (under && !over) return `the answers fell short by ${mean.toFixed(1)} ${unit} on average`;
  return `the answers missed in both directions, by ${mean.toFixed(1)} ${unit} on average`;
}

if (arm !== 'parent') {
  if (!ARMS.includes(arm)) throw new Error('unknown arm ' + arm);
  const base = mock ? makeMockBase(rep * 100 + ARMS.indexOf(arm)) : makeBedrockBase('haiku', `e9-${arm}-rep${rep}`);
  const withMemory = arm !== 'base';
  let organ = null, model = base;
  if (withMemory) {
    const storePath = `${OUT}/stores/e9-${arm}-rep${rep}.json`; if (existsSync(storePath)) rmSync(storePath);
    const store = new JsonFileStore(storePath);
    if (arm === 'supplied') { for (const c of CLASS_IDS) store.put({ id: `e9-${c}`, cue: CLASSES[c].cue, content: SUPPLIED_RULES[c] }); store.save(); }
    organ = new DurableLearningOrgan(store, { enabled: true }); model = organ.wrap(base);
  }
  const failCount = {}, misses = {}; const rows = [], lessonLog = [];
  for (const t of TASKS) {
    base.ctx = { exp: 'E9', arm, rep, pos: t.pos, item: t.id, cls: t.cls, param: t.paramKey, fresh_process: process.pid };
    const recalled = organ ? organ.recall(t.prompt).map(l => l.id) : [];
    const r = await runConstraintRepair({ task: { id: t.id, prompt: t.prompt }, check: txt => check(t, txt), generate: p => model.generate(p), config: { enabled: withMemory, maxRetries: BUDGET - 1 } });
    const row = { pos: t.pos, id: t.id, cls: t.cls, param: t.paramKey, recalled, firstOk: r.firstOk, ok: r.ok, calls: 1 + r.retries, text: r.text, firstText: r.firstText, storeSize: organ ? organ.store.size() : 0 };
    if ((arm === 'wireA' || arm === 'wireB' || arm === 'wireC') && !r.firstOk) {
      const first = check(t, r.firstText);
      let id, cue, content;
      if (arm === 'wireA') {
        failCount[t.cls] = (failCount[t.cls] || 0) + 1; id = `e9-${t.cls}`; cue = CLASSES[t.cls].cue;
        content = `${cap(CLASSES[t.cls].desc)} tasks have failed the check ${times(failCount[t.cls])} so far. Latest failure: ${first.lesson}. Satisfy the ${CLASSES[t.cls].desc} rule before finishing.`;
      } else if (arm === 'wireB') {
        failCount[t.cls] = (failCount[t.cls] || 0) + 1; (misses[t.cls] ??= []).push(first.measured - first.target); id = `e9-${t.cls}`; cue = CLASSES[t.cls].cue;
        content = `${cap(CLASSES[t.cls].desc)} tasks have failed the check ${times(failCount[t.cls])} so far: ${summarize(t.cls, misses[t.cls])}. Check this task's own ${CLASSES[t.cls].desc} requirement before finishing.`;
      } else {
        const k = `${t.cls}-${t.paramKey}`; failCount[k] = (failCount[k] || 0) + 1; id = `e9-${k}`; cue = t.paramCue;
        content = `${cap(CLASSES[t.cls].desc)} tasks have failed the check ${times(failCount[k])} so far. Latest failure: ${first.lesson}. Satisfy the ${CLASSES[t.cls].desc} rule before finishing.`;
      }
      organ.learn({ id, cue, content }); lessonLog.push({ pos: t.pos, item: t.id, cls: t.cls, param: t.paramKey, id, cue, content });
    }
    rows.push(row);
    if (t.pos % 20 === 0) console.log(`  ${arm} rep${rep} pos ${t.pos}: pass so far ${rows.filter(x => x.ok).length}/${rows.length}, calls ${base.calls}`);
  }
  writeFileSync(`${OUT}/raw/e9-${arm}-rep${rep}.json`, JSON.stringify({ arm, rep, pid: process.pid, model: base.id, calls: base.calls, inputTokens: base.inputTokens, outputTokens: base.outputTokens, errors: base.errors,
    lessons: organ ? organ.store.all() : [], lessonLog, rows }, null, 2));
  process.exit(0);
}

// Parent: guards, frozen task list, children, statistics.
const problems = selfCheck(TASKS); if (problems.length) throw new Error('selfCheck: ' + problems.join('; '));
const taskJson = JSON.stringify(TASKS, null, 2);
if (!mock) {
  if (!existsSync(`${DIR}/tasks-e9.json`)) throw new Error('tasks-e9.json missing: freeze first');
  if (readFileSync(`${DIR}/tasks-e9.json`, 'utf8') !== taskJson) throw new Error('task list differs from the frozen tasks-e9.json');
}
function runChild(a, r) {
  return new Promise((res, rej) => {
    const p = spawn(process.execPath, [`${DIR}/e9.mjs`, '--arm', a, '--rep', String(r), ...(mock ? ['--mock'] : [])], { stdio: 'inherit' });
    p.on('exit', code => code === 0 ? res() : rej(new Error(`${a} rep${r} exited ${code}`)));
  });
}
async function pool(jobs, n) { const q = jobs.slice(); const workers = Array.from({ length: n }, async () => { while (q.length) { const j = q.shift(); await j(); } }); await Promise.all(workers); }

const out = { experiment: 'E9', mock, model: mock ? 'mock' : 'us.anthropic.claude-haiku-4-5-20251001-v1:0', temperature: 0.7, maxTokens: 400, budget: BUDGET, reps: REPS, arms: ARMS,
  taskSha256: sha(taskJson), date: new Date().toISOString(), repetitions: [] };
const raw = {};
for (let r = 1; r <= REPS; r++) {
  await pool(ARMS.map(a => () => runChild(a, r)), CONCURRENCY);
  raw[r] = {}; for (const a of ARMS) raw[r][a] = JSON.parse(readFileSync(`${OUT}/raw/e9-${a}-rep${r}.json`, 'utf8'));
  const summary = {};
  for (const a of ARMS) {
    const rows = raw[r][a].rows; const rate = (xs, k = 'ok') => xs.length ? xs.filter(x => x[k]).length / xs.length : null;
    const fails = rows.filter(x => x.pos > 60 && !x.firstOk);
    summary[a] = { pass: rate(rows), firstHalf: rate(rows.filter(x => x.pos <= 60)), secondHalf: rate(rows.filter(x => x.pos > 60)), firstAttemptSecondHalf: rate(rows.filter(x => x.pos > 60), 'firstOk'),
      recoverySecondHalf: fails.length ? fails.filter(x => x.ok).length / fails.length : null,
      byClass: Object.fromEntries(CLASS_IDS.map(c => [c, rate(rows.filter(x => x.cls === c))])),
      byBlock: [1, 2, 3, 4, 5, 6].map(b => rate(rows.filter(x => x.pos > (b - 1) * 20 && x.pos <= b * 20))),
      meanCalls: rows.reduce((s, x) => s + x.calls, 0) / rows.length, calls: raw[r][a].calls, inputTokens: raw[r][a].inputTokens, outputTokens: raw[r][a].outputTokens, errors: raw[r][a].errors,
      lessonsWritten: raw[r][a].lessonLog.length, lessonsInStore: raw[r][a].lessons.length, promptsWithRecall: rows.filter(x => x.recalled.length).length };
  }
  out.repetitions.push({ rep: r, summary });
  console.log(`E9 rep${r}: ` + ARMS.map(a => `${a} ${pct(summary[a].pass)} (2nd half ${pct(summary[a].secondHalf)}, first attempt ${pct(summary[a].firstAttemptSecondHalf)}, calls ${summary[a].meanCalls.toFixed(2)})`).join(' | '));
  writeFileSync(`${OUT}/results-e9.json`, JSON.stringify(out, null, 2));
}

// Per-prompt outcomes averaged over repetitions, per arm.
const per = {}; // id -> arm -> { ok, firstOk }
for (const t of TASKS) { per[t.id] = {}; for (const a of ARMS) { const rows = [1, 2, 3].map(r => raw[r][a].rows.find(x => x.id === t.id)); per[t.id][a] = { ok: rows.filter(x => x.ok).length / REPS, firstOk: rows.filter(x => x.firstOk).length / REPS }; } }
const ids = sel => TASKS.filter(sel).map(t => t.id);
const diff = (a, b, sel, k = 'ok') => itemBootstrap(ids(sel).map(id => per[id][a][k] - per[id][b][k]));
const rateCI = (a, sel, k = 'ok') => itemBootstrap(ids(sel).map(id => per[id][a][k]));
const second = t => t.pos > 60, first = t => t.pos <= 60, all = () => true;
out.primary = { comparison: 'wireB minus repair, final pass, positions 61 to 120', ...diff('wireB', 'repair', second) };
const fam = [['wireA', 'repair'], ['wireC', 'repair'], ['wireB', 'wireA'], ['wireC', 'wireA'], ['wireB', 'supplied'], ['wireC', 'supplied']];
const famRes = fam.map(([a, b]) => ({ comparison: `${a} minus ${b}, positions 61 to 120`, ...diff(a, b, second) }));
const bh = benjaminiHochberg(famRes.map(x => x.p), 0.05);
out.secondaryFamily = famRes.map((x, i) => ({ ...x, pAdjusted: bh.adjusted[i], passesBH: bh.pass[i] }));
// Mechanism outcomes: first-attempt pass and recovery of first-attempt failures, positions 61 to 120.
const recovery = a => { let f = 0, rec = 0; for (const r of [1, 2, 3]) for (const x of raw[r][a].rows) if (x.pos > 60 && !x.firstOk) { f += 1; if (x.ok) rec += 1; } return { firstAttemptFailures: f, recovered: rec, rate: f ? rec / f : null }; };
out.mechanism = { firstAttempt: Object.fromEntries(ARMS.map(a => [a, rateCI(a, second, 'firstOk')])), firstAttemptMinusRepair: Object.fromEntries(['wireA', 'wireB', 'wireC', 'supplied'].map(a => [a, diff(a, 'repair', second, 'firstOk')])),
  recovery: Object.fromEntries(ARMS.filter(a => a !== 'base').map(a => [a, recovery(a)])) };
const allPairs = fam.concat([['wireB', 'repair']]);
out.descriptive = { firstHalf: Object.fromEntries(allPairs.map(([a, b]) => [`${a} minus ${b}`, diff(a, b, first)])), allPositions: Object.fromEntries(allPairs.map(([a, b]) => [`${a} minus ${b}`, diff(a, b, all)])),
  armRates: Object.fromEntries(ARMS.map(a => [a, { all: rateCI(a, all), secondHalf: rateCI(a, second), byClass: Object.fromEntries(CLASS_IDS.map(c => [c, ids(t => t.cls === c).reduce((s, id) => s + per[id][a].ok, 0) / 24])), byClassSecondHalf: Object.fromEntries(CLASS_IDS.map(c => [c, ids(t => t.cls === c && t.pos > 60).reduce((s, id) => s + per[id][a].ok, 0) / 12])) }])),
  learningCurve: Object.fromEntries(ARMS.map(a => [a, [1, 2, 3, 4, 5, 6].map(b => ids(t => t.pos > (b - 1) * 20 && t.pos <= b * 20).reduce((s, id) => s + per[id][a].ok, 0) / 20)])),
  wireCRecalls: [1, 2, 3].map(r => raw[r].wireC.rows.filter(x => x.recalled.length).length) };
// Lessons and the leakage check: no topic string in any lesson, and every lesson matches its arm's template.
const TPL = { wireA: /^[A-Z][a-z ]+ tasks have failed the check \d+ times? so far\. Latest failure: .+\. Satisfy the [a-z ]+ rule before finishing\.$/,
  wireB: /^[A-Z][a-z ]+ tasks have failed the check \d+ times? so far: .+ on average\. Check this task's own [a-z ]+ requirement before finishing\.$/,
  wireC: /^[A-Z][a-z ]+ tasks have failed the check \d+ times? so far\. Latest failure: .+\. Satisfy the [a-z ]+ rule before finishing\.$/ };
out.lessons = {};
for (const a of ['wireA', 'wireB', 'wireC']) out.lessons[a] = [1, 2, 3].map(r => ({ rep: r, written: raw[r][a].lessonLog, final: raw[r][a].lessons,
  leakage: raw[r][a].lessonLog.filter(l => TOPICS.some(tp => l.content.toLowerCase().includes(tp.toLowerCase())) || !TPL[a].test(l.content)).map(l => l.content) }));
out.leakageCount = Object.values(out.lessons).flat().reduce((s, x) => s + x.leakage.length, 0);
out.verdict = out.primary.lo > 0 ? 'the parameter-free wire (Wire B) beat the unwired stack on the second half: the misleading parameter, not injection itself, explains the E8 loss' : out.primary.hi < 0 ? 'the parameter-free wire (Wire B) lost to the unwired stack: injection itself costs' : 'no separation: the interval for Wire B minus repair-only includes zero; no parameter-free wire earns its place on this family either';
writeFileSync(`${OUT}/results-e9.json`, JSON.stringify(out, null, 2));
console.log(`E9 DONE primary wireB minus repair (positions 61-120) ${ppf(out.primary.mean)} [${ppf(out.primary.lo)}, ${ppf(out.primary.hi)}] p=${out.primary.p.toFixed(3)} | ${out.verdict}`);
for (const x of out.secondaryFamily) console.log(`  ${x.comparison}: ${ppf(x.mean)} [${ppf(x.lo)}, ${ppf(x.hi)}] p=${x.p.toFixed(3)} adj=${x.pAdjusted.toFixed(3)}${x.passesBH ? ' *' : ''}`);
console.log('  first attempt (2nd half): ' + ARMS.map(a => `${a} ${pct(out.mechanism.firstAttempt[a].mean)}`).join(', '));
console.log('  recovery (2nd half): ' + Object.entries(out.mechanism.recovery).map(([a, v]) => `${a} ${v.recovered}/${v.firstAttemptFailures}`).join(', '));
console.log(`  lessons written per rep A/B/C: ${['wireA', 'wireB', 'wireC'].map(a => out.lessons[a].map(l => l.written.length).join('/')).join(' | ')}; wireC recalls per rep ${out.descriptive.wireCRecalls.join('/')}; leakage flags: ${out.leakageCount}`);
