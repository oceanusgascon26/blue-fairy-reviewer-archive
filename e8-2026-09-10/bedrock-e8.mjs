// Bedrock base for E8: the controls' transport (AWS CLI converse through the SSO profile, throttle retries, token usage
// captured, every call appended raw to a JSONL log) with one addition, an optional system prompt for the monolithic arms.
// Copied from controls-2026-09-09/bedrock.mjs so the frozen controls directory is untouched.
import { spawnSync } from 'node:child_process';
import { appendFileSync, writeFileSync, mkdirSync } from 'node:fs';

export const MODELS = { haiku: 'us.anthropic.claude-haiku-4-5-20251001-v1:0' };
const PROFILE = '<AWS_PROFILE>', REGION = 'us-east-1';
export const DIR = '.';
mkdirSync(`${DIR}/raw`, { recursive: true });

function sleep(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }

/** A BaseModel (the kit's interface: id + generate) backed by Bedrock. ctx is set by the experiment before each call so
 *  the raw log carries experiment, arm, item, position and repetition. `system`, when given, is sent as the converse
 *  system prompt on every call and logged with the call. */
export function makeBedrockBase(key, logName, { temperature = 0.7, maxTokens = 400, system = null } = {}) {
  const modelId = MODELS[key]; if (!modelId) throw new Error(`unknown model key ${key}`);
  const msgFile = `${DIR}/raw/_m_${process.pid}_${key}.json`;
  const sysFile = `${DIR}/raw/_s_${process.pid}_${key}.json`;
  if (system) writeFileSync(sysFile, JSON.stringify([{ text: system }]));
  const logPath = `${DIR}/raw/${logName}.jsonl`;
  const base = {
    id: `bedrock:${key}`, key, modelId, ctx: {}, calls: 0, inputTokens: 0, outputTokens: 0, errors: 0, system,
    async generate(prompt, opts) {
      const t0 = Date.now();
      writeFileSync(msgFile, JSON.stringify([{ role: 'user', content: [{ text: prompt }] }]));
      let text = '', usage = { inputTokens: 0, outputTokens: 0 }, err = null;
      for (let attempt = 0; attempt < 6; attempt++) {
        const args = ['bedrock-runtime', 'converse', '--model-id', modelId, '--messages', `file://${msgFile}`,
          '--inference-config', `maxTokens=${opts?.maxTokens ?? maxTokens},temperature=${opts?.temperature ?? temperature}`,
          '--region', REGION, '--profile', PROFILE, '--output', 'json'];
        if (system) args.push('--system', `file://${sysFile}`);
        const r = spawnSync('aws', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, env: { ...process.env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' } });
        if (r.status === 0) {
          try {
            const j = JSON.parse(r.stdout);
            text = (j.output?.message?.content || []).filter(x => x.text).map(x => x.text).join('\n').trim();
            usage = { inputTokens: j.usage?.inputTokens ?? 0, outputTokens: j.usage?.outputTokens ?? 0 };
            err = null; break;
          } catch (e) { err = 'parse: ' + e.message; break; }
        }
        err = (r.stderr || '').trim().slice(0, 300);
        if (/Throttl|TooManyRequests|ServiceUnavailable|ModelNotReady|timeout|Connection/i.test(err)) { sleep(3000 * (attempt + 1)); continue; }
        break;
      }
      base.calls += 1; base.inputTokens += usage.inputTokens; base.outputTokens += usage.outputTokens; if (err) base.errors += 1;
      appendFileSync(logPath, JSON.stringify({ ts: new Date().toISOString(), ...base.ctx, model: modelId, temperature: opts?.temperature ?? temperature,
        system: system ? true : false, prompt, text, inputTokens: usage.inputTokens, outputTokens: usage.outputTokens, ms: Date.now() - t0, error: err }) + '\n');
      return text;
    },
  };
  return base;
}

/** Percentile bootstrap over items for a per-item statistic (each entry one item, possibly the mean over repetitions).
 *  Also returns a two-sided bootstrap p-value for the null of zero mean, used for the Benjamini-Hochberg family. */
export function itemBootstrap(values, { iters = 2000, seed = 12345, alpha = 0.05 } = {}) {
  let a = seed >>> 0;
  const rng = () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const n = values.length, means = [];
  for (let i = 0; i < iters; i++) { let s = 0; for (let k = 0; k < n; k++) s += values[Math.floor(rng() * n)]; means.push(s / n); }
  means.sort((x, y) => x - y);
  const mean = values.reduce((s, v) => s + v, 0) / n;
  const le = means.filter(m => m <= 0).length / iters, ge = means.filter(m => m >= 0).length / iters;
  const p = Math.min(1, 2 * Math.min(le, ge));
  return { mean, lo: means[Math.floor(iters * alpha / 2)], hi: means[Math.floor(iters * (1 - alpha / 2)) - 1], n, p };
}

/** Benjamini-Hochberg: returns the adjusted p-values and which pass at q. */
export function benjaminiHochberg(ps, q = 0.05) {
  const m = ps.length; const idx = ps.map((p, i) => [p, i]).sort((x, y) => x[0] - y[0]);
  const adj = new Array(m); let prev = 1;
  for (let r = m - 1; r >= 0; r--) { const [p, i] = idx[r]; prev = Math.min(prev, (p * m) / (r + 1)); adj[i] = prev; }
  return { adjusted: adj, pass: adj.map(a => a <= q) };
}

export const pct = x => (100 * x).toFixed(1) + '%';
export const ppf = x => (100 * x).toFixed(1) + 'pp';
