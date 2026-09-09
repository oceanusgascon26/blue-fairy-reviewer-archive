import os
# Merge the three per-base E5 result files into results-e5.json with the pooled-over-bases statistics and the frozen verdict.
import json, random
from collections import defaultdict
D = os.path.dirname(os.path.abspath(__file__)) + "/"
def bootstrap(values, iters=2000, seed=12345):
    rnd = random.Random(seed); n = len(values); means = []
    for _ in range(iters): means.append(sum(values[rnd.randrange(n)] for _ in range(n)) / n)
    means.sort(); return {"mean": sum(values) / n, "lo": means[int(iters * 0.025)], "hi": means[int(iters * 0.975) - 1], "n": n}
out = None
for key in ("haiku", "llama8b", "llama70b"):
    d = json.load(open("%s/results-e5-%s.json" % (D, key), encoding="utf-8"))
    if out is None: out = {k: v for k, v in d.items() if k != "bases"}; out["bases"] = {}
    out["bases"][key] = d["bases"][key]
per = defaultdict(list)
for key, b in out["bases"].items():
    for r in b["repetitions"]:
        for x in r["rows"]: per[x["key"]].append(x)
prim = bootstrap([sum(x["repair"] - x["resample"] for x in v) / len(v) for v in per.values()])
out["pooled"] = {"repairMinusResample": prim, "repairMinusOneShot": bootstrap([sum(x["repair"] - x["oneShot"] for x in v) / len(v) for v in per.values()]), "resampleMinusOneShot": bootstrap([sum(x["resample"] - x["oneShot"] for x in v) / len(v) for v in per.values()])}
out["verdict"] = "repair beat verifier-selected resampling on the external set at the fixed budget" if prim["lo"] > 0 else ("resampling beat repair on the external set" if prim["hi"] < 0 else "no separation on the external set: interval includes zero")
out["calls"] = sum(b["calls"] for b in out["bases"].values()); out["errors"] = sum(b["errors"] for b in out["bases"].values())
json.dump(out, open(D + "/results-e5.json", "w", encoding="utf-8"), indent=1)
P = lambda x: "%+.1f" % (100 * x)
print("E5 pooled over three bases: repair minus resampling %spp [%s, %s] | repair minus one-shot %spp [%s, %s] | resampling minus one-shot %spp [%s, %s]" % (P(prim["mean"]), P(prim["lo"]), P(prim["hi"]), P(out["pooled"]["repairMinusOneShot"]["mean"]), P(out["pooled"]["repairMinusOneShot"]["lo"]), P(out["pooled"]["repairMinusOneShot"]["hi"]), P(out["pooled"]["resampleMinusOneShot"]["mean"]), P(out["pooled"]["resampleMinusOneShot"]["lo"]), P(out["pooled"]["resampleMinusOneShot"]["hi"])))
for key, b in out["bases"].items():
    p = b["pooled"]; rr = b["repetitions"]
    print("  %-9s one-shot %s | repair %s | resampling %s | repair-resample %spp [%s, %s] | repair-one-shot %spp [%s, %s] | calls %d" % (key, "/".join("%.1f" % (100 * r["oneShot"]) for r in rr), "/".join("%.1f" % (100 * r["repair"]) for r in rr), "/".join("%.1f" % (100 * r["resample"]) for r in rr), P(p["repairMinusResample"]["mean"]), P(p["repairMinusResample"]["lo"]), P(p["repairMinusResample"]["hi"]), P(p["repairMinusOneShot"]["mean"]), P(p["repairMinusOneShot"]["lo"]), P(p["repairMinusOneShot"]["hi"]), b["calls"]))
print("verdict:", out["verdict"], "| calls", out["calls"], "errors", out["errors"])
