# Hand labels for the 300 Dolly instructions of E7, written before the parser ran on them (addendum 7).
# Criterion: yes if the instruction states an exact, machine-checkable format rule of one of the parser's thirteen kinds, with the kind named;
# hedged counts, content requirements and classification tasks are no. Labeler: the author's assistant, one pass, 2026-09-09.
import json, os, hashlib
D = os.path.dirname(os.path.abspath(__file__))
sample = json.load(open(os.path.join(D, "dolly-sample-300.json"), encoding="utf-8"))
YES = {
    7: ("word-count", "a 4 word summary"),
    13: ("line-count", "bulleted list of the seven most recent"),
    26: ("line-count", "a list of 7"),
    117: ("line-count", "5 ways"),
    121: ("line-count", "three popular arias"),
    146: ("line-count", "10 different ideas"),
    148: ("line-count", "Name five MLB teams"),
    162: ("line-count", "bulleted list of the 5 top-grossing movies"),
    167: ("line-count", "the past 5 champions"),
    185: ("line-count", "4 different cities"),
    204: ("line-count", "a list of 5 sites"),
    216: ("line-count", "5 best mailing sites"),
    235: ("line-count", "Name four pork products"),
    237: ("line-count", "the seven most polluted cities"),
    245: ("line-count", "bulleted list of the seven most recent Chancellors"),
    247: ("line-count", "a short list with five ideas"),
    252: ("line-count", "the 7 science classifications; borderline, the count is the answer's, stated by the asker"),
    286: ("line-count", "the six volumes; borderline, the count is the answer's, stated by the asker"),
    296: ("line-count", "List five titles"),
    297: ("line-count", "List the five French mother sauces"),
}
labels = [{"i": r["i"], "label": "yes" if r["i"] in YES else "no", "kind": YES[r["i"]][0] if r["i"] in YES else None, "note": YES[r["i"]][1] if r["i"] in YES else ""} for r in sample]
assert len(labels) == 300 and sum(1 for l in labels if l["label"] == "yes") == len(YES)
json.dump(labels, open(os.path.join(D, "dolly-labels-300.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)
print("labels written: %d yes, %d no; sha256 %s" % (len(YES), 300 - len(YES), hashlib.sha256(open(os.path.join(D, "dolly-labels-300.json"), "rb").read()).hexdigest()[:16]))
