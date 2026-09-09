# Compares the vendored IFEval checker files and data with the upstream Google repository (needs network).
import hashlib, os, urllib.request
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://raw.githubusercontent.com/google-research/google-research/master/instruction_following_eval/"
pairs = [("controls/ifeval/instruction_following_eval/instructions.py", "instructions.py"), ("controls/ifeval/instruction_following_eval/instructions_registry.py", "instructions_registry.py"),
         ("controls/ifeval/instruction_following_eval/instructions_util.py", "instructions_util.py"), ("controls/ifeval/input_data.jsonl", "data/input_data.jsonl")]
for local, remote in pairs:
    a = hashlib.sha256(open(os.path.join(R, local), "rb").read()).hexdigest(); b = hashlib.sha256(urllib.request.urlopen(BASE + remote).read()).hexdigest()
    print(("MATCH " if a == b else "DIFF  ") + local)
