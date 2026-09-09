# E5: IFEval slice across three base families (addendum 4). Bedrock through the AWS CLI, the reference IFEval checkers, a
# repair loop mirroring the kit's runConstraintRepair, verifier-selected resampling, three repetitions. Raw JSONL of every call.
# Usage: python e5.py [--base haiku|llama8b|llama70b]   (default: all three, in sequence)
import json, os, sys, time, random, subprocess
from collections import defaultdict
D = os.path.dirname(os.path.abspath(__file__)) + "/"
sys.path.insert(0, D + "/ifeval")
from instruction_following_eval import instructions_registry as reg
MODELS = {"haiku": "us.anthropic.claude-haiku-4-5-20251001-v1:0", "llama8b": "us.meta.llama3-1-8b-instruct-v1:0", "llama70b": "us.meta.llama3-3-70b-instruct-v1:0"}
PROFILE, REGION = "<AWS_PROFILE>", "us-east-1"
SEED, N_SLICE, REPS, BUDGET, TEMP, MAXTOK = 20260909, 60, 3, 4, 0.7, 1200
SUFFIX = "\n\nOutput only the response, nothing else."
os.makedirs(D + "/raw", exist_ok=True)

rows = [json.loads(l) for l in open(D + "/ifeval/input_data.jsonl", encoding="utf-8")]
rng = random.Random(SEED); idx = list(range(len(rows))); rng.shuffle(idx); SLICE = [rows[i] for i in idx[:N_SLICE]]
if not os.path.exists(D + "/e5-slice.json"):
    json.dump([{"key": r["key"], "instruction_id_list": r["instruction_id_list"], "prompt": r["prompt"]} for r in SLICE], open(D + "/e5-slice.json", "w", encoding="utf-8"), indent=1)

def check(row, response):
    unmet = []
    for iid, kw in zip(row["instruction_id_list"], row["kwargs"]):
        inst = reg.INSTRUCTION_DICT[iid](iid); kw = {k: v for k, v in (kw or {}).items() if v is not None}
        desc = inst.build_description(**kw)
        try: ok = inst.check_following(response)
        except Exception: ok = False
        if not ok: unmet.append(desc.strip())
    return len(unmet) == 0, unmet

class Base:
    def __init__(self, key):
        self.key, self.model = key, MODELS[key]; self.calls = self.errors = self.tin = self.tout = 0
        self.msg = "%s/raw/_m_e5_%d_%s.json" % (D, os.getpid(), key); self.log = open("%s/raw/e5-%s.jsonl" % (D, key), "a", encoding="utf-8"); self.ctx = {}
    def generate(self, prompt):
        t0 = time.time(); json.dump([{"role": "user", "content": [{"text": prompt}]}], open(self.msg, "w", encoding="utf-8"), ensure_ascii=True)
        text, usage, err = "", {"inputTokens": 0, "outputTokens": 0}, None
        for attempt in range(5):
            r = subprocess.run(["aws", "bedrock-runtime", "converse", "--model-id", self.model, "--messages", "file://" + self.msg, "--inference-config", "maxTokens=%d,temperature=%s" % (MAXTOK, TEMP), "--region", REGION, "--profile", PROFILE, "--output", "json"], capture_output=True, text=True, encoding="utf-8", errors="replace", env={**os.environ, "PYTHONUTF8": "1", "PYTHONIOENCODING": "utf-8"})
            if r.returncode == 0:
                try:
                    j = json.loads(r.stdout); text = "\n".join(x["text"] for x in j.get("output", {}).get("message", {}).get("content", []) if "text" in x).strip()
                    usage = {"inputTokens": j.get("usage", {}).get("inputTokens", 0), "outputTokens": j.get("usage", {}).get("outputTokens", 0)}; err = None; break
                except Exception as e: err = "parse: %s" % e; break
            err = (r.stderr or "").strip()[:300]
            if any(k in err for k in ("Throttl", "TooManyRequests", "ServiceUnavailable", "ModelNotReady", "timeout")): time.sleep(2.5 * (attempt + 1)); continue
            break
        self.calls += 1; self.tin += usage["inputTokens"]; self.tout += usage["outputTokens"]; self.errors += bool(err)
        self.log.write(json.dumps({"ts": time.strftime("%Y-%m-%dT%H:%M:%S"), **self.ctx, "model": self.model, "temperature": TEMP, "prompt": prompt, "text": text, **usage, "ms": int((time.time() - t0) * 1000), "error": err}, ensure_ascii=False) + "\n"); self.log.flush()
        return text

def repair_prompt(task, previous, violation):
    return task + '\n\nYour previous attempt was:\n"""\n' + previous + '\n"""\nThat attempt FAILED this requirement: ' + violation + '. Rewrite the response so that it satisfies the requirement exactly. Output only the response, nothing else.'

def bootstrap(values, iters=2000, seed=12345):
    rnd = random.Random(seed); n = len(values); means = []
    for _ in range(iters): means.append(sum(values[rnd.randrange(n)] for _ in range(n)) / n)
    means.sort(); return {"mean": sum(values) / n, "lo": means[int(iters * 0.025)], "hi": means[int(iters * 0.975) - 1], "n": n}

bases = [sys.argv[sys.argv.index("--base") + 1]] if "--base" in sys.argv else list(MODELS)
out_path = D + ("/results-e5-%s.json" % sys.argv[sys.argv.index("--base") + 1] if "--base" in sys.argv else "/results-e5.json")
out = json.load(open(out_path, encoding="utf-8")) if os.path.exists(out_path) else {"experiment": "E5", "slice": N_SLICE, "seed": SEED, "reps": REPS, "budget": BUDGET, "temperature": TEMP, "maxTokens": MAXTOK, "bases": {}}
for key in bases:
    base = Base(key); per = defaultdict(list); reps_out = []
    for rep in range(1, REPS + 1):
        one = rp = bon = 0; rows_out = []
        for row in SLICE:
            base.ctx = {"exp": "E5", "base": key, "rep": rep, "key": row["key"], "arm": "first"}
            first = base.generate(row["prompt"] + SUFFIX); ok1, unmet = check(row, first)
            cur, okr, tries = first, ok1, 0
            while not okr and tries < BUDGET - 1:
                tries += 1; base.ctx = {"exp": "E5", "base": key, "rep": rep, "key": row["key"], "arm": "repair", "retry": tries}
                cur = base.generate(repair_prompt(row["prompt"], cur, "; ".join(unmet)[:600])); okr, unmet = check(row, cur)
            okb = ok1
            for k in range(1, BUDGET):
                base.ctx = {"exp": "E5", "base": key, "rep": rep, "key": row["key"], "arm": "resample", "draw": k + 1}
                d = base.generate(row["prompt"] + SUFFIX)
                if check(row, d)[0]: okb = True
            one += ok1; rp += okr; bon += okb
            rows_out.append({"key": row["key"], "oneShot": ok1, "repair": okr, "repairCalls": 1 + tries, "resample": okb, "instructions": row["instruction_id_list"]})
            per[row["key"]].append({"rep": rep, "one": ok1, "rp": okr, "bon": okb})
            print("E5 %s rep%d key %s one=%s repair=%s(%d) resample=%s" % (key, rep, row["key"], "P" if ok1 else "f", "P" if okr else "f", 1 + tries, "P" if okb else "f"), flush=True)
        n = len(SLICE); reps_out.append({"rep": rep, "oneShot": one / n, "repair": rp / n, "resample": bon / n, "rows": rows_out})
        print("E5 %s rep%d: one-shot %.1f%% repair %.1f%% resample %.1f%%" % (key, rep, 100 * one / n, 100 * rp / n, 100 * bon / n), flush=True)
        out["bases"][key] = {"model": base.model, "repetitions": reps_out}; json.dump(out, open(out_path, "w", encoding="utf-8"), indent=1)
    pool = lambda a, b: bootstrap([sum((x[a] - x[b]) for x in v) / len(v) for v in per.values()])
    out["bases"][key]["pooled"] = {"repairMinusResample": pool("rp", "bon"), "repairMinusOneShot": pool("rp", "one"), "resampleMinusOneShot": pool("bon", "one"),
        "oneShotRange": [min(r["oneShot"] for r in reps_out), max(r["oneShot"] for r in reps_out)], "meanRepairCalls": sum(x["repairCalls"] for r in reps_out for x in r["rows"]) / (REPS * len(SLICE))}
    out["bases"][key]["calls"] = base.calls; out["bases"][key]["errors"] = base.errors; out["bases"][key]["tokens"] = {"in": base.tin, "out": base.tout}
    json.dump(out, open(out_path, "w", encoding="utf-8"), indent=1)
    p = out["bases"][key]["pooled"]["repairMinusResample"]; print("E5 %s DONE repair-resample %+.1fpp [%+.1f, %+.1f] | %d calls %d errors" % (key, 100 * p["mean"], 100 * p["lo"], 100 * p["hi"], base.calls, base.errors), flush=True)
# pooled over bases (cluster by prompt, carrying every base and repetition) when all three are present
if all(k in out["bases"] and "pooled" in out["bases"][k] for k in MODELS):
    per_prompt = defaultdict(list)
    for k in MODELS:
        for r in out["bases"][k]["repetitions"]:
            for x in r["rows"]: per_prompt[x["key"]].append(x)
    prim = bootstrap([sum(x["repair"] - x["resample"] for x in v) / len(v) for v in per_prompt.values()])
    out["pooled"] = {"repairMinusResample": prim, "repairMinusOneShot": bootstrap([sum(x["repair"] - x["oneShot"] for x in v) / len(v) for v in per_prompt.values()]), "resampleMinusOneShot": bootstrap([sum(x["resample"] - x["oneShot"] for x in v) / len(v) for v in per_prompt.values()])}
    out["verdict"] = "repair beat verifier-selected resampling on the external set at the fixed budget" if prim["lo"] > 0 else ("resampling beat repair on the external set" if prim["hi"] < 0 else "no separation on the external set: interval includes zero")
    json.dump(out, open(out_path, "w", encoding="utf-8"), indent=1); print("E5 ALL DONE", out["verdict"], "pooled %+.1fpp [%+.1f, %+.1f]" % (100 * prim["mean"], 100 * prim["lo"], 100 * prim["hi"]))
