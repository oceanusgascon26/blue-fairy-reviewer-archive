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
- e8-2026-09-10/ (added 2026-09-10): the machine-checked composition pilot. PREREGISTRATION-E8.md, frozen before any call (its sha256 matches FREEZE-E8.txt), and REGISTRATION-E8.txt, the public OSF registration osf.io/qc3db (DOI 10.17605/OSF.IO/QC3DB) submitted before the run; the frozen task list (tasks-e8.json), the task generator and checkers (e8-tasks.mjs), the Bedrock transport (bedrock-e8.mjs), the harness (e8.mjs), the readout renderer (readout-e8.py), results-e8.json, READOUT-E8.md and run-e8.log; raw/ holds 2,899 raw generate records across six arms and three repetitions and the per-arm phase outputs (e8-<arm>-rep<n>.json); stores/ holds the memory stores; raw-aborted-start-1/ holds a first start stopped after about a minute for a process-supervision reason (ABORTED-START-1.txt; not data); smoke/ holds the scripted-fake pipeline test run before the freeze (not data); PLAN-DRAFT-E8.md is the pre-freeze draft. The harness imported the kit at commit 5484217, whose code is identical to 3d20393 (documentation-only commits between).
- e9-2026-09-10/ (added after the run): the lesson-design follow-up to E8. PREREGISTRATION-E9.md, frozen before any call (its sha256 matches FREEZE-E9.txt), and REGISTRATION-E9.txt, the public OSF registration osf.io/t6jkz (DOI 10.17605/OSF.IO/T6JKZ) submitted before the run; the frozen task list (tasks-e9.json), the task generator and checkers (e9-tasks.mjs), the Bedrock transport (bedrock-e9.mjs), the harness (e9.mjs), the readout renderer (readout-e9.py), results-e9.json, READOUT-E9.md, E9-NOTE.md where present and run-e9.log; raw/ holds 4,284 raw generate records across six arms and three repetitions and the per-arm phase outputs; stores/ holds the memory stores of every wired arm; smoke/ holds the scripted-fake pipeline test run before the freeze (not data); PLAN-DRAFT-E9.md is the pre-freeze draft.
- kit/: cognitive-middleware at commit 3d20393, the revision the controls specified. kit/KIT-COMMIT.txt gives the build step. The kit's first tagged release, v0.0.1 (code identical to this commit; documentation added), is archived at Zenodo with DOI 10.5281/zenodo.22683481 (concept DOI 10.5281/zenodo.22683480).
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
8. python e8-2026-09-10/readout-e8.py e8-2026-09-10/results-e8.json readout-check.md re-renders the E8 readout from the results file; the output must be identical to READOUT-E8.md. Inside e8-2026-09-10/, after building the kit, node e8.mjs --mock runs the whole pipeline against the scripted fake with no network (it rewrites smoke/).
9. python e9-2026-09-10/readout-e9.py e9-2026-09-10/results-e9.json readout-check.md re-renders the E9 readout from the results file; the output must be identical to READOUT-E9.md. Inside e9-2026-09-10/, after building the kit, node e9.mjs --mock runs the pipeline against the scripted fake with no network (it rewrites smoke/).

## Tooling

The code, harnesses and task generators in this archive were developed with AI coding assistance under the author's direction. Every plan was frozen by hash and registered before data. The checkers are pure functions of the model text and the raw records are open for audit, so the provenance of the code does not enter into any number reported here.

## What the archive cannot do

It cannot regenerate the model answers without Bedrock access, and a new run would produce new text. It cannot supply a pinned commit for the historical runs, which recorded none. The freeze records are local files whose times precede the first calls; they are not an independent registration.

## Where this archive lives

- Repository: https://github.com/oceanusgascon26/blue-fairy-reviewer-archive (the current revision).
- Deposit: a zip of the archive as of its fourth commit (171ae54, through E6d) is in the registered report's public OSF project, https://osf.io/eduak (DOI https://doi.org/10.17605/OSF.IO/EDUAK), file https://osf.io/3r4pq, SHA-256 d4a54d88587ed21f... (full hash in PROVENANCE.md). That project carries a CC0 label from its own creation; the archive's content is governed by LICENSE.md here (CC BY 4.0). A second zip, the archive at commit bf4b77a (through E8), was deposited on 2026-09-10 as https://osf.io/u9ajt, SHA-256 c40e7ea4921744f5... (full hash in PROVENANCE.md); the E8 results were also uploaded to that project's folder e8-composition-pilot after the E8 registration (https://osf.io/qc3db) had archived. A third zip, the archive at commit 4e6026b (through E9), was deposited on 2026-09-10 as https://osf.io/7sgf6, SHA-256 3b85445382f5996f... (full hash in PROVENANCE.md), with the E9 results in the folder e9-composition-pilot after the E9 registration (https://osf.io/t6jkz) had archived.

## License

The kit source is under its MIT license (kit/LICENSE). The plans, records, results and tools in this archive are released under CC BY 4.0; see LICENSE.md.
