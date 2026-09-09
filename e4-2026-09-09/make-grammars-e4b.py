# E4b: the three word-frequency grammars again, with rule names the llama.cpp grammar parser accepts (letters, digits and hyphens; the
# E4 versions used underscores, which the offline matcher tolerated and the server rejected with "failed to parse grammar") and with
# optional groups instead of empty alternatives. Same construction otherwise, same offline tests, written to grammars-e4b.json so the
# frozen grammars.json of E4 stays as it was. No model call.
import json, os, sys, hashlib
D = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(D, "make-grammars.py"), encoding="utf-8").read()
ns = {"__file__": os.path.join(D, "make-grammars.py")}
exec(src.split("JSON_STR = ")[0], ns)                                                                  # the builders (cls, cls_lit, END) and imports, no writes
exec("# matcher" + src.split("# ---- a small GBNF matcher for testing")[1].split("# ---- tests:")[0], ns)   # the GBNF matcher, no writes
cls, cls_lit, END, accepts = ns["cls"], ns["cls_lit"], ns["END"], ns["accepts"]

def word_freq(target, k, n_sent):
    """Exactly k occurrences of target (case-insensitive, whole word) across exactly n_sent sentences; words are letters only. Parser-safe names."""
    L = len(target); rules = []
    rules.append("nt ::= %s L* | %s p1" % (cls(target[0]), cls_lit(target[0])))
    for i in range(1, L):
        rules.append("p%d ::= (%s L* | %s p%d)?" % (i, cls(target[i]), cls_lit(target[i]), i + 1))     # a proper prefix of the target may stand alone as a word
    rules.append("p%d ::= L+" % L)                                                                     # the full target must continue to count as another word
    rules.append("tgt ::= " + " ".join(cls_lit(ch) for ch in target))
    rules.append("L ::= [A-Za-z]")
    rules.append("root ::= s-0-0")
    for i in range(k + 1):
        for j in range(n_sent):
            alts_s = ["nt m-%d-%d" % (i, j)] + (["tgt m-%d-%d" % (i + 1, j)] if i < k else [])
            rules.append("s-%d-%d ::= %s" % (i, j, " | ".join(alts_s)))
            alts_m = ['" " nt m-%d-%d' % (i, j)] + (['" " tgt m-%d-%d' % (i + 1, j)] if i < k else [])
            if j + 1 < n_sent: alts_m.append('%s " " s-%d-%d' % (END, i, j + 1))
            elif i == k: alts_m.append(END)
            rules.append("m-%d-%d ::= %s" % (i, j, " | ".join(alts_m)))
    return "\n".join(rules)

G = {"word-twice": word_freq("morning", 2, 3), "water-3": word_freq("water", 3, 4), "time-2": word_freq("time", 2, 3)}
assert not any("_" in g for g in G.values()), "underscore left in a rule name"
assert not any(l.rstrip().endswith("|") for g in G.values() for l in g.split("\n")), "empty alternative left"
TESTS = {
    # "Mornings", "Timeless" and "Wat" are not the target word to the checker (whole-word match) and must not count for the grammar either
    "word-twice": (["Morning coffee wakes me. The morning is slow. I drink it warm.", "Mornings come. Morning again. Morning too."], ["Morning coffee wakes me. The morning is slow.", "Coffee wakes me. It is slow. I drink it warm.", "Morning coffee. Morning tea. Morning again."]),
    "water-3": (["Water runs. Water falls. The water shines. Fish swim.", "Wat water. Water falls. Water glows. Fish swim."], ["Water runs. Water falls. Fish swim. Birds sing.", "Water runs. Water falls. Water shines. Water glows.", "Wat water. Water. Water!"]),
    "time-2": (["Time passes. The time is late. Clocks tick.", "Timeless time. Time again. Tick."], ["Time passes. Clocks tick. Hands move.", "Time. Time. Time."]),
}
bad = 0
for tid, g in G.items():
    for s in TESTS[tid][0]:
        if not accepts(g, s): bad += 1; print("FAIL accept", tid, s)
    for s in TESTS[tid][1]:
        if accepts(g, s): bad += 1; print("FAIL reject", tid, s)
print("E4b grammar tests: %d grammars, %d positives, %d negatives, %d failures" % (len(G), sum(len(v[0]) for v in TESTS.values()), sum(len(v[1]) for v in TESTS.values()), bad))
json.dump({"tests": {k: {"positive": v[0], "negative": v[1]} for k, v in TESTS.items()}, "grammars": G}, open(os.path.join(D, "grammars-e4b.json"), "w", encoding="utf-8"), indent=1)
print("grammars-e4b.json sha256", hashlib.sha256(open(os.path.join(D, "grammars-e4b.json"), "rb").read()).hexdigest())
sys.exit(1 if bad else 0)
