# Replays every saved E5 answer through the reference IFEval checkers under fixed random seeds and compares the
# resulting selected-arm flags with the 1,620 saved flags. Verifies the book's audit claims: no checker exceptions;
# raw judgments vary with the seed on a few prompts (1122, 279, 1219); a handful of selected-arm flags disagree.
import json, random, sys, os, collections
D = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(D, "ifeval"))
from instruction_following_eval import instructions_registry as reg
from langdetect import DetectorFactory

data = {json.loads(l)["key"]: json.loads(l) for l in open(os.path.join(D, "ifeval", "input_data.jsonl"), encoding="utf-8")}
slice_ = json.load(open(os.path.join(D, "e5-slice.json"), encoding="utf-8"))
rows = {r["key"]: data[r["key"]] for r in slice_}
exceptions = collections.Counter()

def check(row, response):
    for iid, kw in zip(row["instruction_id_list"], row["kwargs"]):
        inst = reg.INSTRUCTION_DICT[iid](iid); kw = {k: v for k, v in (kw or {}).items() if v is not None}
        inst.build_description(**kw)
        try: ok = inst.check_following(response)
        except Exception as e: exceptions[type(e).__name__] += 1; ok = False
        if not ok: return False
    return True

# reconstruct the per-(base, rep, key) answer sets from the raw logs
answers = {}
for base in ("haiku", "llama8b", "llama70b"):
    for l in open(os.path.join(D, "raw", "e5-%s.jsonl" % base), encoding="utf-8"):
        r = json.loads(l); k = (base, int(r["rep"]), int(r["key"])); a = answers.setdefault(k, {"first": None, "repair": [], "resample": []})
        if r["arm"] == "first": a["first"] = r["text"]
        elif r["arm"] == "repair": a["repair"].append((int(r["retry"]), r["text"]))
        elif r["arm"] == "resample": a["resample"].append((int(r["draw"]), r["text"]))
saved = {}
for base in ("haiku", "llama8b", "llama70b"):
    res = json.load(open(os.path.join(D, "results-e5-%s.json" % base), encoding="utf-8"))
    for rep in res["bases"][base]["repetitions"]:
        for x in rep["rows"]: saved[(base, rep["rep"], x["key"])] = (x["oneShot"], x["repair"], x["resample"])
assert len(answers) == len(saved) == 540, (len(answers), len(saved))
n_answers = sum(1 + len(a["repair"]) + len(a["resample"]) for a in answers.values())

seeds = [int(s) for s in sys.argv[1:]] or [0, 1, 7, 42]
per_seed_flags = {}; per_seed_raw = {}
for s in seeds:
    random.seed(s); DetectorFactory.seed = s
    flags = {}; rawj = {}
    for k in sorted(answers):
        a = answers[k]; row = rows[k[2]]
        ok1 = check(row, a["first"]); rawj[k + ("first",)] = ok1
        final = sorted(a["repair"])[-1][1] if a["repair"] else a["first"]
        okr = check(row, final) if a["repair"] else ok1; rawj[k + ("repair-final",)] = okr
        okb = ok1
        for d, t in sorted(a["resample"]):
            j = check(row, t); rawj[k + ("resample-%d" % d,)] = j; okb = okb or j
        flags[k] = (ok1, okr, okb)
    per_seed_flags[s] = flags; per_seed_raw[s] = rawj

print("answers replayed per seed: %d (book: 2,267) | checker exceptions: %s" % (n_answers, dict(exceptions) or "none"))
out = {"answers": n_answers, "exceptions": dict(exceptions), "seeds": {}}
for s in seeds:
    dis = [(k, saved[k], per_seed_flags[s][k]) for k in saved if saved[k] != per_seed_flags[s][k]]
    keys = sorted({k[2] for k, _, _ in dis})
    print("seed %d: %d of 1,620 selected-arm flags disagree with the saved flags | prompts: %s" % (s, sum(sum(a != b for a, b in zip(x, y)) for _, x, y in dis), keys))
    out["seeds"][s] = {"disagreeing_flags": sum(sum(a != b for a, b in zip(x, y)) for _, x, y in dis), "disagreeing_cases": len(dis), "prompts": keys}
# raw judgments that differ between seeds
vary = collections.defaultdict(set)
for k in per_seed_raw[seeds[0]]:
    vals = {per_seed_raw[s][k] for s in seeds}
    if len(vals) > 1: vary[k[2]].add((k[0], k[1], k[3]))
print("prompts whose raw pass judgments differ across seeds %s: %s" % (seeds, {k: len(v) for k, v in sorted(vary.items())}))
out["raw_judgments_vary_by_prompt"] = {str(k): len(v) for k, v in sorted(vary.items())}
json.dump(out, open(os.path.join(D, "e5-seed-replay.json"), "w", encoding="utf-8"), indent=1)
print("written e5-seed-replay.json")
