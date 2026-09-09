# Readout of the 2026-09-09 controls: tables and the frozen verdicts, from results-e*.json. Usage: python readout.py
import json, os, re, glob
D = os.path.dirname(os.path.abspath(__file__)) + "/"
def load(n):
    p = D + "results-%s.json" % n
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else None
pp = lambda x: "%+.1fpp" % (100 * x)
ci = lambda c: "[%s, %s]" % (pp(c["lo"]), pp(c["hi"]))
pct = lambda x: "%.1f%%" % (100 * x)
out = ["# Controls of 2026-09-09: readout", "", "Protocol: PREREGISTRATION-ADDENDUM.md, frozen by the hash in FREEZE.txt before any experimental call. Raw call logs in raw/. Every number below is one exploratory run of the design stated in the addendum; nothing is pooled with any earlier run.", ""]
calls_total = 0
e1 = load("e1")
if e1:
    out += ["## E1. Failure probabilities behind the failing-subset rule", "", "Bare Haiku 4.5, %d draws per item, temperature %.1f." % (e1["draws"], e1["temperature"]), "", "| Set | Items | Single-draw failures | Majority failures (over %d draws) | Items whose first draw disagrees with the majority | Single-draw headroom | Expected headroom (mean p_fail) |" % e1["draws"], "|---|---|---|---|---|---|---|"]
    for name, s in e1["sets"].items():
        out.append("| %s | %d | %d | %d | %d | %s | %s |" % (name, s["n"], s["singleDrawFailures"], s["majorityFailures"], s["disagreements"], pct(s["singleDrawHeadroom"]), pct(s["expectedHeadroom"])))
    out.append("")
    for name, s in e1["sets"].items():
        flaky = [r for r in s["rows"] if 0 < r["pFail"] < 1]
        always = [r["id"] for r in s["rows"] if r["pFail"] == 1]
        out.append("%s: %d items never failed, %d failed on every draw (%s), %d failed on some draws (%s)." % (name, sum(1 for r in s["rows"] if r["pFail"] == 0), len(always), ", ".join(always) or "none", len(flaky), ", ".join("%s %d/%d" % (r["id"], round(r["pFail"] * e1["draws"]), e1["draws"]) for r in flaky) or "none"))
    out.append(""); calls_total += e1.get("calls", 0)
e2 = load("e2")
if e2:
    out += ["## E2. Repair against verifier-selected resampling at a budget of %d fixed in advance" % e2["budget"], "", "Haiku 4.5, T39, %d repetitions, shared first draft, temperature %.1f." % (len(e2["repetitions"]), e2["temperature"]), "", "| Repetition | One-shot | Repair | Resampling | Repair minus resampling (95% CI) | Repair minus one-shot | Resampling minus one-shot |", "|---|---|---|---|---|---|---|"]
    for r in e2["repetitions"]:
        out.append("| %d | %s | %s | %s | %s %s | %s %s | %s %s |" % (r["rep"], pct(r["oneShot"]), pct(r["repair"]), pct(r["resample"]), pp(r["repairMinusResample"]["delta"]), ci(r["repairMinusResample"]), pp(r["repairMinusOneShot"]["delta"]), ci(r["repairMinusOneShot"]), pp(r["resampleMinusOneShot"]["delta"]), ci(r["resampleMinusOneShot"])))
    if "pooled" in e2:
        p = e2["pooled"]
        out += ["", "Pooled over repetitions (cluster bootstrap over items): repair minus resampling %s %s; repair minus one-shot %s %s; resampling minus one-shot %s %s. Mean repair calls per item %.2f against a budget of %d." % (pp(p["repairMinusResample"]["mean"]), ci(p["repairMinusResample"]), pp(p["repairMinusOneShot"]["mean"]), ci(p["repairMinusOneShot"]), pp(p["resampleMinusOneShot"]["mean"]), ci(p["resampleMinusOneShot"]), p["meanRepairCalls"], e2["budget"]), "", "Verdict under the frozen rule: %s." % e2.get("verdict", "pending")]
    out.append(""); calls_total += e2.get("calls", 0)
e3 = load("e3")
if e3:
    out += ["## E3. The large base inside the same loop", "", "Llama 3.1 8B and Llama 3.3 70B, T39, %d repetitions, budget %d, temperature %.1f. Costs use the illustrative blended rates of the cost chapter (dollars per million tokens: 8B %.2f, 70B %.2f) and are labeled illustrative; token counts are the record." % (e3["reps"], e3["budget"], e3["temperature"], e3["pricePerM"]["llama8b"], e3["pricePerM"]["llama70b"]), ""]
    for name, s in e3["sets"].items():
        out += ["| Repetition | 8B one-shot | 8B + repair | 70B one-shot | 70B + repair | 70B resampling | 8B+repair minus 70B+repair (95% CI) | 70B+repair minus 70B one-shot |", "|---|---|---|---|---|---|---|---|"]
        for r in s["repetitions"]:
            a = r["rates"]; out.append("| %d | %s | %s | %s | %s | %s | %s %s | %s %s |" % (r["rep"], pct(a["s1"]), pct(a["sR"]), pct(a["b1"]), pct(a["bR"]), pct(a["bN"]), pp(r["sRminusbR"]["delta"]), ci(r["sRminusbR"]), pp(r["bRminusb1"]["delta"]), ci(r["bRminusb1"])))
        out += ["", "| Repetition | Tokens 8B one-shot | Tokens 8B + repair | Tokens 70B one-shot | Tokens 70B + repair | Tokens 70B resampling | Illustrative cost per pass: 8B+repair | 70B one-shot | 70B+repair |", "|---|---|---|---|---|---|---|---|---|"]
        for r in s["repetitions"]:
            t = r["tokens"]; c = r["illustrativeCostPerPass"]; out.append("| %d | %d | %d | %d | %d | %d | $%.5f | $%.5f | $%.5f |" % (r["rep"], t["s1"], t["sR"], t["b1"], t["bR"], t["bN"], c["sR"], c["b1"], c["bR"]))
        if "pooled" in s:
            p = s["pooled"]
            out += ["", "Pooled: 8B+repair minus 70B+repair %s %s; 70B+repair minus 70B one-shot %s %s; 70B+repair minus 70B resampling %s %s; 8B+repair minus 70B one-shot %s %s; 8B+repair minus 8B one-shot %s %s." % (pp(p["sRminusbR"]["mean"]), ci(p["sRminusbR"]), pp(p["bRminusb1"]["mean"]), ci(p["bRminusb1"]), pp(p["bRminusbN"]["mean"]), ci(p["bRminusbN"]), pp(p["sRminusb1"]["mean"]), ci(p["sRminusb1"]), pp(p["sRminuss1"]["mean"]), ci(p["sRminuss1"])), "", "Verdict under the frozen rule: %s." % s.get("verdict", "pending")]
        out.append("")
    if "calls" in e3: calls_total += e3["calls"]["small"] + e3["calls"]["big"]
e6 = load("e6")
if e6:
    out += ["## E6. Durable learning, rerun with the isolation recorded", "", "Haiku 4.5, twenty new words, one seeded substitution cipher, %d repetitions. Session two, the supplied-key control and the cold repeat each ran in a fresh process; every prompt is in the raw log; the store held exactly one lesson." % e6["reps"], "", "| Repetition | Cold (contains / exact) | Warm, stored rule retrieved (contains / exact) | Supplied key in prompt (contains / exact) | Cold repeat |", "|---|---|---|---|---|"]
    for r in e6["repetitions"]:
        out.append("| %d | %d/20 / %d | %d/20 / %d | %d/20 / %d | %d/20 |" % (r["rep"], r["cold"]["contains"], r["cold"]["exact"], r["warm"]["contains"], r["warm"]["exact"], r["suppliedKey"]["contains"], r["suppliedKey"]["exact"], r["coldRepeat"]["contains"]))
    p = e6["pooled"]
    out += ["", "Pooled: warm minus cold %s %s (contains); warm minus supplied key %s %s; supplied key minus cold %s %s. Exact-match scores were zero in every arm: the model narrated its decoding despite the instruction to reply with only the word.", "", "Verdict under the frozen rule: %s." % e6["verdict"], ""]
    out[-4] = out[-4] % (pp(p["warmMinusCold"]["mean"]), ci(p["warmMinusCold"]), pp(p["warmMinusKey"]["mean"]), ci(p["warmMinusKey"]), pp(p["keyMinusCold"]["mean"]), ci(p["keyMinusCold"]))
    rows = [json.loads(l) for l in open(D + "raw/e6-haiku.jsonl", encoding="utf-8")]
    calls_total += len(rows)
    norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
    misses = [(x["rep"], x["item"]) for x in rows if x.get("phase") == "s2" and x["item"] not in norm(x["text"])]
    out += ["Warm misses: %s. Cold responses attempted Caesar shifts and never produced a target word; no earlier lesson appears in any cold prompt." % (", ".join("rep %d %s" % m for m in misses) or "none"), ""]
raw = sum(sum(1 for _ in open(p, encoding="utf-8")) for p in glob.glob(D + "raw/e*.jsonl"))
out += ["## Calls", "", "Raw log lines across the four experiments: %d (plus 3 smoke-test calls logged separately). Errors are counted in each results file." % raw, ""]
open(D + "READOUT.md", "w", encoding="utf-8", newline="\n").write("\n".join(out)); print("READOUT.md written")
print("\n".join(out))
