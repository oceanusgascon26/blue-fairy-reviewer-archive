# Readout of E6b and E6c (the stacked organs) appended to READOUT.md. Usage: python readout-stack.py  (run readout.py first)
import json, os
D = os.path.dirname(os.path.abspath(__file__)) + "/"
pp = lambda x: "%+.1fpp" % (100 * x)
ci = lambda c: "[%s, %s]" % (pp(c["lo"]), pp(c["hi"]))
out = []
for name, title in [("e6b", "E6b. The naive stack: a one-word reply enforced around the memory-wrapped base"), ("e6c", "E6c. The redesigned stack: reason, then the decoded word alone on the last line")]:
    p = D + "results-%s.json" % name
    if not os.path.exists(p): continue
    d = json.load(open(p, encoding="utf-8"))
    grader = "exact" if name == "e6b" else "final-line exact"
    out += ["## " + title, "", "Haiku 4.5, the E6 words and stores, %d repetitions, budget %d, four arms each in a fresh process. Graders: %s, contains, and the repair checker's own format verdict." % (d["reps"], d["budget"], grader), "",
            "| Repetition | Neither (exact / contains / format) | Memory only | Repair only | Both | Mean calls, repair / both |", "|---|---|---|---|---|---|"]
    for r in d["repetitions"]:
        s = r["summary"]; f = lambda a: "%d / %d / %d" % (s[a]["exact"], s[a]["contains"], s[a]["format"])
        out.append("| %d | %s | %s | %s | %s | %.2f / %.2f |" % (r["rep"], f("neither"), f("memory"), f("repair"), f("both"), s["repair"]["meanCalls"], s["both"]["meanCalls"]))
    q = d["pooled"]
    out += ["", "Pooled on %s: both %s, memory only %s, repair only %s, neither %s. Both minus the better single organ %s %s. Interaction (both minus memory minus repair plus neither) %s %s." % (grader, pp(q["both"]["mean"]), pp(q["memory"]["mean"]), pp(q["repair"]["mean"]), pp(q["neither"]["mean"]), pp(q["bothMinusBestSingle"]["mean"]), ci(q["bothMinusBestSingle"]), pp(q["interactionExact"]["mean"]), ci(q["interactionExact"])), "", "Verdict under the frozen rule: %s." % d["verdict"], ""]
open(D + "READOUT.md", "a", encoding="utf-8", newline="\n").write("\n".join(out)); print("\n".join(out))
