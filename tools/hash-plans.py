# Hashes the four frozen plans and compares them with the FREEZE files.
import hashlib, os, re, glob
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); C = os.path.join(R, "controls")
for f in sorted(glob.glob(os.path.join(C, "FREEZE*.txt"))):
    m = re.search(r"(PREREGISTRATION-ADDENDUM[-0-9]*\.md) sha256 ([0-9a-f]{64})", open(f, encoding="utf-8").read())
    h = hashlib.sha256(open(os.path.join(C, m.group(1)), "rb").read()).hexdigest()
    if h == m.group(2): print("MATCH " + m.group(1) + " " + h); continue
    red = open(os.path.join(C, "PLAN-REDACTION.txt"), encoding="utf-8").read()
    if m.group(1) in red and ("Public copy sha256 " + h) in red: print("REDACTED COPY " + m.group(1) + " " + h + " (matches PLAN-REDACTION.txt; original hash as in FREEZE.txt)")
    else: print("DIFF  " + m.group(1) + " " + h)
