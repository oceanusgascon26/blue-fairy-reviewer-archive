# Recomputes the SHA-256 of every file in the archive and compares it with MANIFEST.sha256.
import hashlib, os, sys
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def sha(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""): h.update(b)
    return h.hexdigest()
bad = 0; n = 0
for line in open(os.path.join(R, "MANIFEST.sha256"), encoding="utf-8"):
    digest, path = line.rstrip("\n").split("  ", 1); n += 1
    if sha(os.path.join(R, path)) != digest: bad += 1; print("MISMATCH", path)
print("%d files checked, %d mismatches" % (n, bad)); sys.exit(1 if bad else 0)
