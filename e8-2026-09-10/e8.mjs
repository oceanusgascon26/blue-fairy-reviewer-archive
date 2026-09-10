// E8: the machine-checked composition pilot. Six arms in fresh processes over one fixed 120-prompt sequence, three
// repetitions, Haiku 4.5 on Bedrock. Parent: node e8.mjs [--mock]. Child: node e8.mjs --arm <arm> --rep <n> [--mock].
// --mock replaces the Bedrock base with a scripted fake so the whole pipeline runs without a network call (smoke test;
// its outputs go to smoke/ and are not data).
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { DurableLearningOrgan, JsonFileStore, runConstraintRepair, DEFAULT_FIRST_SHOT_SUFFIX } from '../kit/dist/src/index.js';
import { makeBedrockBase, itemBootstrap, benjaminiHochberg, ppf, pct, DIR } from './bedrock-e8.mjs';
import { buildTasks, check, selfCheck, CLASS_IDS, CLASSES, SUPPLIED_RULES, SYSTEM_PROMPT, TOPICS, mulberry } from './e8-tasks.mjs';

export const ARMS = ['base', 'repair', 'integrated', 'supplied', 'mono', 'monoresample'];
const REPS = 3, BUDGET = 4, CONCURRENCY = 3;
const args = process.argv.slice(2);
const mock = args.includes('--mock');
const arm = args.includes('--arm') ? args[args.indexOf('--arm') + 1] : 'parent';
const rep = args.includes('--rep') ? Number(args[args.indexOf('--rep') + 1]) : 0;
const OUT = mock ? `${DIR}/smoke` : DIR;
mkdirSync(`${OUT}/raw`, { recursive: true }); mkdirSync(`${OUT}/stores`, { recursive: true });
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const sha = s => createHash('sha256').update(s).digest('hex');

// The scripted fake for the smoke test: varied canned texts so every checker sees passes and failures.
function makeMockBase(seed) {
  const rng = mulberry(seed);
  const canned = ['- one fact here\n- two facts here\n- three facts here', 'a quiet paragraph in lowercase with no capitals at all and a window and a window.',
    'The River runs past the window, past the ladder, and past the mirror. That is all for today.', 'Short. Very short! Is it? Yes.',
    'A plain paragraph without any commas or ending phrase and about forty words that goes on for a little while so that the word count lands somewhere in the middle of the windows the tasks ask for today.',
    'Is there anything else I can help with?', 'Thank you for reading.'];
  return { id: 'mock', ctx: {}, calls: 0, inputTokens: 0, outputTokens: 0, errors: 0, system: null,
    async generate(prompt) { this.calls += 1; return canned[Math.floor(rng() * canned.length)]; } };
}

const TASKS = buildTasks();

if (arm !== 'parent') {
  if (!ARMS.includes(arm)) throw new Error('unknown arm ' + arm);
  const monolithic = arm === 'mono' || arm === 'monoresample';
  const base = mock ? makeMockBase(rep * 100 + ARMS.indexOf(arm)) : makeBedrockBase('haiku', `e8-${arm}-rep${rep}`, { system: monolithic ? SYSTEM_PROMPT : null });
  const withMemory = arm === 'repair' || arm === 'integrated' || arm === 'supplied';
  let organ = null, model = base, storePath = null;
  if (withMemory) {
    storePath = `${OUT}/stores/e8-${arm}-rep${rep}.json`; if (existsSync(storePath)) rmSync(storePath);
    const store = new JsonFileStore(storePath);
    if (arm === 'supplied') { for (const c of CLASS_IDS) store.put({ id: `e8-${c}`, cue: CLASSES[c].cue, content: SUPPLIED_RULES[c] }); store.save(); }
    organ = new DurableLearningOrgan(store, { enabled: true }); model = organ.wrap(base);
  }
  const failures = {}; const rows = []; const lessonLog = [];
  for (const t of TASKS) {
    base.ctx = { exp: 'E8', arm, rep, pos: t.pos, item: t.id, cls: t.cls, fresh_process: process.pid };
    const recalled = organ ? organ.recall(t.prompt).map(l => l.id) : [];
    let row;
    if (arm === 'monoresample') {
      const texts = []; let ok = false;
      for (let i = 0; i < BUDGET && !ok; i++) { const txt = await base.generate(t.prompt + DEFAULT_FIRST_SHOT_SUFFIX); texts.push(txt); ok = check(t, txt).ok; }
      row = { firstOk: check(t, texts[0]).ok, ok, calls: texts.length, text: texts[texts.length - 1], firstText: texts[0], texts };
    } else {
      const enabled = withMemory; // base and mono: one call, byte-identical to the disabled loop
      const r = await runConstraintRepair({ task: { id: t.id, prompt: t.prompt }, check: txt => check(t, txt), generate: p => model.generate(p), config: { enabled, maxRetries: BUDGET - 1 } });
      row = { firstOk: r.firstOk, ok: r.ok, calls: 1 + r.retries, text: r.text, firstText: r.firstText };
      if (arm === 'integrated' && !r.firstOk) {
        failures[t.cls] = (failures[t.cls] || 0) + 1; const n = failures[t.cls];
        const lesson = check(t, r.firstText).lesson;
        const content = `${cap(CLASSES[t.cls].desc)} tasks have failed the check ${n} time${n === 1 ? '' : 's'} so far. Latest failure: ${lesson}. Satisfy the ${CLASSES[t.cls].desc} rule before finishing.`;
        organ.learn({ id: `e8-${t.cls}`, cue: CLASSES[t.cls].cue, content });
        lessonLog.push({ pos: t.pos, item: t.id, cls: t.cls, content });
      }
    }
    rows.push({ pos: t.pos, id: t.id, cls: t.cls, recalled, ...row, storeSize: organ ? organ.store.size() : 0 });
    if (t.pos % 20 === 0) console.log(`  ${arm} rep${rep} pos ${t.pos}: pass so far ${rows.filter(x => x.ok).length}/${rows.length}, calls ${base.calls}`);
  }
  writeFileSync(`${OUT}/raw/e8-${arm}-rep${rep}.json`, JSON.stringify({ arm, rep, pid: process.pid, model: base.id, system: monolithic ? SYSTEM_PROMPT : null,
    calls: base.calls, inputTokens: base.inputTokens, outputTokens: base.outputTokens, errors: base.errors, lessons: organ ? organ.store.all() : [], lessonLog, rows }, null, 2));
  process.exit(0);
}

// Parent: guards, frozen task list, children, statistics.
const problems = selfCheck(TASKS); if (problems.length) throw new Error('selfCheck: ' + problems.join('; '));
const taskJson = JSON.stringify(TASKS, null, 2);
if (!mock) {
  if (!existsSync(`${DIR}/tasks-e8.json`)) throw new Error('tasks-e8.json missing: freeze first');
  if (readFileSync(`${DIR}/tasks-e8.json`, 'utf8') !== taskJson) throw new Error('task list differs from the frozen tasks-e8.json');
}
function runChild(a, r) {
  return new Promise((res, rej) => {
    const p = spawn(process.execPath, [`${DIR}/e8.mjs`, '--arm', a, '--rep', String(r), ...(mock ? ['--mock'] : [])], { stdio: 'inherit' });
    p.on('exit', code => code === 0 ? res() : rej(new Error(`${a} rep${r} exited ${code}`)));
  });
}
async function pool(jobs, n) { const q = jobs.slice(); const workers = Array.from({ length: n }, async () => { while (q.length) { const j = q.shift(); await j(); } }); await Promise.all(workers); }

const out = { experiment: 'E8', mock, model: mock ? 'mock' : 'us.anthropic.claude-haiku-4-5-20251001-v1:0', temperature: 0.7, maxTokens: 400, budget: BUDGET, reps: REPS, arms: ARMS,
  taskSha256: sha(taskJson), date: new Date().toISOString(), repetitions: [] };
const raw = {};
for (let r = 1; r <= REPS; r++) {
  await pool(ARMS.map(a => () => runChild(a, r)), CONCURRENCY);
  raw[r] = {}; for (const a of ARMS) raw[r][a] = JSON.parse(readFileSync(`${OUT}/raw/e8-${a}-rep${r}.json`, 'utf8'));
  const summary = {};
  for (const a of ARMS) {
    const rows = raw[r][a].rows; const rate = xs => xs.length ? xs.filter(x => x.ok).length / xs.length : null;
    summary[a] = { pass: rate(rows), firstHalf: rate(rows.filter(x => x.pos <= 60)), secondHalf: rate(rows.filter(x => x.pos > 60)),
      byClass: Object.fromEntries(CLASS_IDS.map(c => [c, rate(rows.filter(x => x.cls === c))])),
      byBlock: [1, 2, 3, 4, 5, 6].map(b => rate(rows.filter(x => x.pos > (b - 1) * 20 && x.pos <= b * 20))),
      meanCalls: rows.reduce((s, x) => s + x.calls, 0) / rows.length, calls: raw[r][a].calls, inputTokens: raw[r][a].inputTokens, outputTokens: raw[r][a].outputTokens, errors: raw[r][a].errors,
      lessonsWritten: raw[r][a].lessonLog?.length ?? 0, lessonsInStore: raw[r][a].lessons?.length ?? 0 };
  }
  out.repetitions.push({ rep: r, summary });
  console.log(`E8 rep${r}: ` + ARMS.map(a => `${a} ${pct(summary[a].pass)} (2nd half ${pct(summary[a].secondHalf)}, calls ${summary[a].meanCalls.toFixed(2)})`).join(' | '));
  writeFileSync(`${OUT}/results-e8.json`, JSON.stringify(out, null, 2));
}

// Per-prompt pass averaged over repetitions, per arm; comparisons on the second half (positions 61 to 120).
const perPrompt = {}; // id -> arm -> mean pass
for (const t of TASKS) { perPrompt[t.id] = {}; for (const a of ARMS) perPrompt[t.id][a] = [1, 2, 3].map(r => raw[r][a].rows.find(x => x.id === t.id).ok ? 1 : 0).reduce((s, v) => s + v, 0) / REPS; }
const ids = sel => TASKS.filter(sel).map(t => t.id);
const diff = (a, b, sel) => itemBootstrap(ids(sel).map(id => perPrompt[id][a] - perPrompt[id][b]));
const second = t => t.pos > 60, first = t => t.pos <= 60, all = () => true;
out.primary = { comparison: 'integrated minus repair, positions 61 to 120', ...diff('integrated', 'repair', second) };
const fam = [['integrated', 'supplied'], ['repair', 'mono'], ['integrated', 'mono'], ['supplied', 'mono'], ['repair', 'monoresample'], ['integrated', 'monoresample'], ['supplied', 'monoresample']];
const famRes = fam.map(([a, b]) => ({ comparison: `${a} minus ${b}, positions 61 to 120`, ...diff(a, b, second) }));
const bh = benjaminiHochberg(famRes.map(x => x.p), 0.05);
out.secondaryFamily = famRes.map((x, i) => ({ ...x, pAdjusted: bh.adjusted[i], passesBH: bh.pass[i] }));
out.descriptive = { firstHalf: Object.fromEntries(fam.concat([['integrated', 'repair']]).map(([a, b]) => [`${a} minus ${b}`, diff(a, b, first)])), allPositions: Object.fromEntries(fam.concat([['integrated', 'repair']]).map(([a, b]) => [`${a} minus ${b}`, diff(a, b, all)])),
  armRates: Object.fromEntries(ARMS.map(a => [a, { all: itemBootstrap(ids(all).map(id => perPrompt[id][a])), secondHalf: itemBootstrap(ids(second).map(id => perPrompt[id][a])), byClass: Object.fromEntries(CLASS_IDS.map(c => [c, ids(t => t.cls === c).reduce((s, id) => s + perPrompt[id][a], 0) / 15])) }])),
  learningCurve: Object.fromEntries(['repair', 'integrated', 'supplied', 'base'].map(a => [a, [1, 2, 3, 4, 5, 6].map(b => ids(t => t.pos > (b - 1) * 20 && t.pos <= b * 20).reduce((s, id) => s + perPrompt[id][a], 0) / 20)])) };
// Lessons written by the integrated arm, and the leakage check: no lesson may contain a task topic or anything but the
// mechanical template around a checker's lesson text.
const template = /^[A-Z][a-z ]+ tasks have failed the check \d+ times? so far\. Latest failure: .+\. Satisfy the [a-z ]+ rule before finishing\.$/;
out.lessons = [1, 2, 3].map(r => ({ rep: r, written: raw[r].integrated.lessonLog, final: raw[r].integrated.lessons,
  leakage: raw[r].integrated.lessonLog.filter(l => TOPICS.some(tp => l.content.toLowerCase().includes(tp.toLowerCase())) || !template.test(l.content)).map(l => l.content) }));
out.leakageCount = out.lessons.reduce((s, x) => s + x.leakage.length, 0);
out.verdict = out.primary.lo > 0 ? 'the wire bought a measurable gain over the unwired stack on the second half of the sequence' : out.primary.hi < 0 ? 'the wire measurably hurt' : 'no separation: the interval for integrated minus repair-only includes zero';
writeFileSync(`${OUT}/results-e8.json`, JSON.stringify(out, null, 2));
console.log(`E8 DONE primary integrated minus repair (positions 61-120) ${ppf(out.primary.mean)} [${ppf(out.primary.lo)}, ${ppf(out.primary.hi)}] p=${out.primary.p.toFixed(3)} | ${out.verdict}`);
for (const x of out.secondaryFamily) console.log(`  ${x.comparison}: ${ppf(x.mean)} [${ppf(x.lo)}, ${ppf(x.hi)}] p=${x.p.toFixed(3)} adj=${x.pAdjusted.toFixed(3)}${x.passesBH ? ' *' : ''}`);
console.log(`  lessons written per rep: ${out.lessons.map(l => l.written.length).join('/')}; leakage flags: ${out.leakageCount}`);
