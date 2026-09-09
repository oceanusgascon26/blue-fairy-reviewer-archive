# Checks every number and code fact the v23 evidence appendix asserts about the 9 September controls against the results files and raw logs.
import json, random, collections, re, glob, os
D = os.path.dirname(os.path.abspath(__file__)) + "/"
J = lambda f: json.load(open(D + f, encoding="utf-8"))
raw = lambda f: [json.loads(l) for l in open(D + "raw/" + f, encoding="utf-8")]
bad = []
def say(label, computed, claimed):
    ok = str(computed) == str(claimed)
    if not ok: bad.append(label)
    print(("OK   " if ok else "DIFF ") + label + ": computed=%s claimed=%s" % (computed, claimed))
pct = lambda x: round(100 * x + 1e-9, 1)
iv = lambda b: (pct(b["mean"]), pct(b["lo"]), pct(b["hi"]))

print("## E1"); e1 = J("results-e1.json")
for name, c in [("T39", dict(single=16, majority=15, dis=3, sdh=41.0, exh=36.5, ties=1)), ("T20", dict(single=6, majority=2, dis=4, sdh=30.0, exh=23.8, ties=5))]:
    s = e1["sets"][name]; fails = [sum(not p for p in r["passes"]) for r in s["rows"]]
    say(name + " first-draw failures", s["singleDrawFailures"], c["single"]); say(name + " majority failures", s["majorityFailures"], c["majority"]); say(name + " disagreements", s["disagreements"], c["dis"])
    say(name + " single-draw headroom", pct(s["singleDrawHeadroom"]), c["sdh"]); say(name + " mean failure frequency", pct(s["expectedHeadroom"]), c["exh"]); say(name + " 4/8 ties", sum(f == 4 for f in fails), c["ties"])
    say(name + " majority rule is fails>4", all(r["majorityFail"] == (sum(not p for p in r["passes"]) > 4) for r in s["rows"]), True)
rows = e1["sets"]["T39"]["rows"]; fails = {r["id"]: sum(not p for p in r["passes"]) for r in rows}
say("T39 never failed", sum(f == 0 for f in fails.values()), 20); say("T39 failed every draw", sum(f == 8 for f in fails.values()), 5); say("T39 intermittent", sum(0 < f < 8 for f in fails.values()), 14)
say("T39 always-failed ids", sorted(i for i, f in fails.items() if f == 8), sorted(["no-letter-e", "no-vowel-a-e", "no-o", "no-t", "no-i"]))
print("     items failing >=6 of 8:", sorted(i for i, f in fails.items() if f >= 6), "| wordcount-20 fails:", fails["wordcount-20"], "| no-n fails:", {i: f for i, f in fails.items() if i.startswith("no-n")})
say("E1 calls", e1["calls"], 472); say("E1 errors", e1["errors"], 0); say("E1 raw records", len(raw("e1-haiku.jsonl")), 472)

print("## E2"); e2 = J("results-e2.json"); R = e2["repetitions"]
say("one-shot by run", [pct(r["oneShot"]) for r in R], [64.1, 76.9, 59.0, 64.1, 56.4]); say("repair by run", [pct(r["repair"]) for r in R], [79.5, 92.3, 82.1, 84.6, 84.6]); say("resampling by run", [pct(r["resample"]) for r in R], [71.8, 79.5, 79.5, 82.1, 79.5])
say("means one-shot/repair/resampling", [pct(sum(r[k] for r in R) / 5) for k in ("oneShot", "repair", "resample")], [64.1, 84.6, 78.5])
say("repair-resampling", iv(e2["pooled"]["repairMinusResample"]), (6.2, 0.0, 13.3)); say("repair-one-shot", iv(e2["pooled"]["repairMinusOneShot"]), (20.5, 11.3, 30.8)); say("resampling-one-shot", iv(e2["pooled"]["resampleMinusOneShot"]), (14.4, 8.2, 21.5))
gens = sum(x["repairCalls"] for r in R for x in r["rows"]); n = sum(len(r["rows"]) for r in R)
say("repair generations / item-repetitions", (gens, n), (347, 195)); say("repair calls per item", round(e2["pooled"]["meanRepairCalls"], 2), 1.78); say("E2 calls", e2["calls"], 932); say("E2 errors", e2["errors"], 0); say("E2 raw records", len(raw("e2-haiku.jsonl")), 932)

print("## E3"); e3 = J("results-e3.json"); T = e3["sets"]["T39"]; reps = T["repetitions"]; print("     T39 keys:", list(T.keys()), "| top keys:", list(e3.keys()))
say("mean rates s1/sR/b1/bR/bN", [pct(sum(r["rates"][k] for r in reps) / 3) for k in ("s1", "sR", "b1", "bR", "bN")], [53.8, 81.2, 73.5, 85.5, 78.6])
say("wrapped passes 8B/70B of 117", (sum(x["sR"] for r in reps for x in r["rows"]), sum(x["bR"] for r in reps for x in r["rows"])), (95, 100))
tokS = sum(r["tokens"]["sR"] for r in reps); tokB = sum(r["tokens"]["bR"] for r in reps)
say("tokens: small total / big repair total", (e3["tokens"]["small"], tokB), (24486, 22840)); print("     small repair-arm tokens by rep sum:", tokS)
say("calls per item sR/bR", (round(sum(x["sRcalls"] for r in reps for x in r["rows"]) / 117, 2), round(sum(x["bRcalls"] for r in reps for x in r["rows"]) / 117, 2)), (2.01, 1.62))
cS = e3["tokens"]["small"] * 0.22 / 1e6 / 95; cB = tokB * 0.72 / 1e6 / 100
say("pooled cost per pass 8B repair / 70B repair / ratio", ("%.9f" % cS, "%.9f" % cB, round(cS / cB, 4)), ("0.000056704", "0.000164448", 0.3448))
say("mean per-rep cost per pass sR/b1/bR/bN", tuple("%.5f" % (sum(r["illustrativeCostPerPass"][k] for r in reps) / 3) for k in ("sR", "b1", "bR", "bN")), ("0.00006", "0.00010", "0.00017", "0.00036"))
pooled = T.get("pooled") or e3.get("pooled")
if pooled:
    print("     pooled keys:", list(pooled.keys()))
    for k, claim in [("sRminusbR", (-4.3, -13.7, 5.1)), ("bRminusb1", (12.0, 4.3, 22.2)), ("sRminusb1", (7.7, -3.4, 18.8)), ("sRminuss1", (27.4, 16.2, 39.3))]:
        if k in pooled: b = pooled[k]; say("pooled " + k, (pct(b.get("delta", b.get("mean", 0))), pct(b["lo"]), pct(b["hi"])), claim)
say("E3 raw records 8B/70B", (len(raw("e3-llama8b.jsonl")), len(raw("e3-llama70b.jsonl"))), (235, 541)); say("E3 errors", e3["errors"], {"small": 0, "big": 0}); say("E3 prices", (e3["pricePerM"]["llama8b"], e3["pricePerM"]["llama70b"]), (0.22, 0.72))

print("## E5"); e5 = J("results-e5.json")
claims = {"haiku": ([91.7, 91.7, 86.7], [100.0, 100.0, 98.3], [95.0, 98.3, 100.0], (1.7, -1.1, 5.0), (9.4, 3.9, 16.7), 1.12, 741),
          "llama8b": ([76.7, 75.0, 71.7], [91.7, 96.7, 96.7], [91.7, 91.7, 90.0], (3.9, -1.7, 10.0), (20.6, 13.3, 28.9), 1.41, 794),
          "llama70b": ([91.7, 98.3, 96.7], [98.3, 98.3, 100.0], [100.0, 100.0, 100.0], (-1.1, -3.3, 0.0), (3.3, 1.1, 6.1), 1.07, 732)}
for k, b in e5["bases"].items():
    c = claims[k]; R = b["repetitions"]
    say(k + " one-shot", [pct(r["oneShot"]) for r in R], c[0]); say(k + " repair", [pct(r["repair"]) for r in R], c[1]); say(k + " resampling", [pct(r["resample"]) for r in R], c[2])
    say(k + " repair-resampling", iv(b["pooled"]["repairMinusResample"]), c[3]); say(k + " repair-one-shot", iv(b["pooled"]["repairMinusOneShot"]), c[4]); say(k + " repair calls per prompt", round(b["pooled"]["meanRepairCalls"], 2), c[5])
    say(k + " calls (results / raw)", (b["calls"], len(raw("e5-%s.jsonl" % k))), (c[6], c[6])); say(k + " errors", b["errors"], 0)
say("pooled repair-resampling", iv(e5["pooled"]["repairMinusResample"]), (1.5, -0.7, 4.1)); say("pooled repair-one-shot", iv(e5["pooled"]["repairMinusOneShot"]), (11.1, 7.4, 15.6)); say("pooled resampling-one-shot", iv(e5["pooled"]["resampleMinusOneShot"]), (9.6, 6.3, 13.3))
say("E5 total calls", e5["calls"], 2267); say("selected-arm flags", 3 * sum(len(r["rows"]) for b in e5["bases"].values() for r in b["repetitions"]), 1620)
# sensitivity checks with the original pooling and seed
def bootstrap(values, iters=2000, seed=12345):
    rnd = random.Random(seed); n = len(values); means = []
    for _ in range(iters): means.append(sum(values[rnd.randrange(n)] for _ in range(n)) / n)
    means.sort(); return {"mean": sum(values) / n, "lo": means[int(iters * 0.025)], "hi": means[int(iters * 0.975) - 1], "n": n}
per = collections.defaultdict(list)
for b in e5["bases"].values():
    for r in b["repetitions"]:
        for x in r["rows"]: per[x["key"]].append(x)
sl = J("e5-slice.json"); lang = {r["key"] for r in sl if any(i in ("change_case:english_lowercase", "change_case:english_capital", "language:response_language") for i in r["instruction_id_list"])}
say("language-detector prompts", (len(lang), 1122 in lang, 1219 in lang), (18, True, True))
say("prompt 1122 instructions", [r["instruction_id_list"] for r in sl if r["key"] == 1122][0], ["change_case:english_lowercase", "keywords:letter_frequency"])
f2 = lambda b: (round(100 * b["mean"], 2), round(100 * b["lo"], 2), round(100 * b["hi"], 2))
for excl, claim_n, c_ro, c_rr in [({1122}, 59, (10.36, 6.59, 14.31), (1.51, -0.56, 3.95)), ({1122, 279}, 58, (9.96, 6.51, 13.79), (1.53, -0.77, 4.02)), ({1122} | lang, 42, (7.94, 4.76, 11.38), (0.79, -1.32, 3.17))]:
    keep = {k: v for k, v in per.items() if k not in excl}
    ro = bootstrap([sum(x["repair"] - x["oneShot"] for x in v) / len(v) for v in keep.values()]); rr = bootstrap([sum(x["repair"] - x["resample"] for x in v) / len(v) for v in keep.values()])
    say("sensitivity n=%d prompts" % claim_n, len(keep), claim_n); say("  repair-one-shot", f2(ro), c_ro); say("  repair-resampling", f2(rr), c_rr)
quote = sum("the letter v should appear at least 4 times" in r["text"] + r["prompt"] for r in raw("e5-haiku.jsonl")); say("1122 wrong-feedback quote present in raw haiku log", quote > 0, True)

print("## E6"); e6 = J("results-e6.json"); R = e6["repetitions"]
tot = lambda arm, k: sum(r[arm][k] for r in R)
say("contains cold/warm/key/coldRepeat", (tot("cold", "contains"), tot("warm", "contains"), tot("suppliedKey", "contains"), tot("coldRepeat", "contains")), (0, 58, 60, 0))
say("exact all arms", (tot("cold", "exact"), tot("warm", "exact"), tot("suppliedKey", "exact"), tot("coldRepeat", "exact")), (0, 0, 0, 0))
say("warm-cold", iv(e6["pooled"]["warmMinusCold"]), (96.7, 90.0, 100.0)); say("warm-key", iv(e6["pooled"]["warmMinusKey"]), (-3.3, -10.0, 0.0))
say("warm misses", [x["word"] for r in R for x in r["rows"]["warm"] if not x["contains"]], ["quartz", "quartz"])
rr = raw("e6-haiku.jsonl"); say("E6 raw records", len(rr), 240); say("E6 raw errors", sum(bool(r.get("error")) for r in rr), 0)
tmpl = collections.Counter(re.sub(r"\b[a-z]{4,12}\b", "W", r["prompt"])[:70] for r in rr); print("     prompt templates (%d):" % len(tmpl)); [print("       %4d %s" % (n, t.replace("\n", " "))) for t, n in tmpl.most_common()]
warm_prompts = [r for r in rr if r["phase"] in ("s2-warm", "warm")]; key_prompts = [r for r in rr if "key" in r["phase"].lower() or "supplied" in r["phase"].lower()]
print("     phases:", collections.Counter(r["phase"] for r in rr))
if warm_prompts and key_prompts: say("warm and supplied-key prompts identical per word", sorted(r["prompt"] for r in warm_prompts) == sorted(r["prompt"] for r in key_prompts), True)

print("## E6b"); e6b = J("results-e6b.json")
trip = lambda d, arm: "%d/%d/%d" % (d["summary"][arm]["exact"], d["summary"][arm]["contains"], d["summary"][arm]["format"])
say("run triplets", [[trip(r, a) for a in ("neither", "memory", "repair", "both")] for r in e6b["repetitions"]], [["0/0/8", "0/19/0", "0/0/20", "1/2/20"], ["0/0/9", "0/19/0", "0/0/20", "1/1/20"], ["0/0/7", "0/20/0", "0/0/20", "0/0/20"]])
say("both-best single", iv(e6b["pooled"]["bothMinusBestSingle"]), (3.3, 0.0, 8.3)); say("E6b raw records", len(raw("e6b-haiku.jsonl")), 244)

print("## E6c"); e6c = J("results-e6c.json")
say("run triplets", [[trip(r, a) for a in ("neither", "memory", "repair", "both")] for r in e6c["repetitions"]], [["0/0/0", "11/19/12", "0/0/8", "20/20/20"], ["0/0/4", "6/20/6", "0/0/10", "19/19/20"], ["0/0/6", "6/19/6", "0/0/12", "20/20/20"]])
say("pooled exact neither/memory/repair/both", tuple(pct(e6c["pooled"][k]["mean"]) for k in ("neither", "memory", "repair", "both")), (0.0, 38.3, 0.0, 98.3))
say("both-best single", iv(e6c["pooled"]["bothMinusBestSingle"]), (60.0, 48.3, 71.7)); say("interaction", iv(e6c["pooled"]["interactionExact"]), (60.0, 48.3, 71.7))
say("mean calls repair/both", (round(sum(r["summary"]["repair"]["meanCalls"] for r in e6c["repetitions"]) / 3, 2), round(sum(r["summary"]["both"]["meanCalls"] for r in e6c["repetitions"]) / 3, 2)), (2.65, 1.0))
say("both first-attempt format every time", all(x["calls"] == 1 and x["format"] for r in e6c["repetitions"] for x in r["rows"]["both"]), True)
rc = raw("e6c-haiku.jsonl"); say("E6c raw by arm", dict(collections.Counter(r["arm"] for r in rc)), {"neither": 60, "memory": 60, "repair": 159, "both": 60})
errs = [r for r in rc if r.get("error")]; say("E6c errors (arm, rep, item, empty text)", [(r["arm"], int(r["rep"]), r["item"], r["text"] == "") for r in errs], [("repair", 3, "copper", True)])
say("results-e6c has no top-level error total", "errors" not in e6c, True)
print("\nDIFFS:", bad if bad else "none")
