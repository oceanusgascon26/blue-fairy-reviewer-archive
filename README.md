# Project Blue Fairy: reviewer archive for the September 2026 controls

Assembled 2026-09-09 by the author's tooling from the working folders that produced the controls reported in the book's evidence appendix. It holds the frozen plans and their freeze records, every raw model call, the results and store records, the recovered twenty-four item cost pilot, the kit source at the pinned commit, and the offline audit tools. It is not a complete archive of every earlier experiment in the book; the historical runs (beat-cr-002, dl-003, results-p1, results-p2 and the retired associative-reasoning harness) are outside it, as the book says.

## What is here

- controls/PREREGISTRATION-ADDENDUM.md, -2.md, -3.md, -4.md: the four plans. Three are byte for byte as frozen; the public copy of the first has one phrase redacted that named the owner of the cloud account, and controls/PLAN-REDACTION.txt records the original and public hashes. controls/FREEZE.txt to FREEZE-4.txt carry the frozen SHA-256 values and freeze times. The first freeze also appears in the project council log at 2026-09-09T14:24:12.053Z.
- controls/raw/*.jsonl: 5,513 raw generate records, of which 3 are smoke tests (smoke.jsonl) and 5,510 are experimental. Each record has the prompt, the answer, input and output token counts, elapsed milliseconds and the final error field. controls/raw/e6*.json are the E6, E6b and E6c store files and phase outputs.
- controls/results-*.json, controls/e5-slice.json, controls/READOUT.md: the results as written by the run scripts, the IFEval selection, and the readout.
- controls/*.mjs and controls/*.py: the run scripts, with local paths and the AWS profile substituted (see PROVENANCE.md). They are the code that ran; running them again needs Amazon Bedrock access and makes new calls.
- controls/ifeval/: the reference IFEval checkers and data (Google, Apache 2.0), vendored unchanged. tools/check-ifeval-upstream.py compares them with upstream.
- p4-2026-08-26/: the twenty-four item cost pilot script and its results.
- e4-2026-09-09/: the fifth plan (grammar-constrained decoding on a local CPU build of llama.cpp with Llama 3.1 8B Instruct Q4_K_M) and FREEZE-5.txt, which also records the model file's hash; the 39 grammars, the generator and offline tester that built them (make-grammars.py, no model call), the runner (e4.mjs), the frozen topic-keyword map, results-e4.json, run.log, and 746 raw records of the local run in raw/ (2 smoke-test records in smoke.jsonl). The model file and the llama.cpp binaries are not included; their hashes and versions are in FREEZE-5.txt. The E4b files (addendum 6, FREEZE-6.txt, grammars-e4b.json, make-grammars-e4b.py, e4b.mjs, results-e4b.json and the e4b, smoke-e4b and parse-check-e4b records) are the disclosed follow-up on the three word-frequency grammars the server's parser rejected in E4.
- e7-2026-09-09/: the seventh plan and its freeze, the 300-prompt Dolly sample (CC BY-SA 3.0, instruction field only) and its hand labels written before the parser ran, the label script, the runner (e7.mjs, no model calls), results-e7.json and run-e7.log. Rerun with node e7.mjs after building the kit.
- kit/: cognitive-middleware at commit 3d20393, the revision the controls specified. kit/KIT-COMMIT.txt gives the build step.
- tools/: verify-manifest.py, hash-plans.py, check-ifeval-upstream.py.
- MANIFEST.sha256: the SHA-256 of every file. PROVENANCE.md: where each file came from and what was changed.

## Verifying without an API key

1. python tools/verify-manifest.py. Every file matches its listed hash.
2. python tools/hash-plans.py. Three plans hash to the values in the FREEZE files; the first reports its redacted-copy hash against PLAN-REDACTION.txt.
3. python controls/verify-v23-claims.py. Recomputes every number the book's evidence appendix states about E1, E2, E3, E5, E6, E6b and E6c from the results files and the raw records, and prints OK or DIFF for each. Needs Python 3.
4. python controls/e5-seed-replay.py. Replays all saved IFEval answers through the reference checkers under fixed seeds and reports how many of the 1,620 selected-arm flags disagree with the saved ones. Needs the langdetect, nltk, immutabledict and absl-py packages.
5. In kit/, npm ci, npm run build, npm test. The hermetic tests run against a scripted base with no key or network.
6. python e4-2026-09-09/make-grammars.py, where present. Rebuilds the 39 grammars and re-runs their offline acceptance tests; the printed hash of grammars.json must match FREEZE-5.txt.
7. Optional, needs network: python tools/check-ifeval-upstream.py.

## What the archive cannot do

It cannot regenerate the model answers without Bedrock access, and a new run would produce new text. It cannot supply a pinned commit for the historical runs, which recorded none. The freeze records are local files whose times precede the first calls; they are not an independent registration.

## License

The kit source is under its MIT license (kit/LICENSE). The plans, records, results and tools in this archive are released under CC BY 4.0; see LICENSE.md.
