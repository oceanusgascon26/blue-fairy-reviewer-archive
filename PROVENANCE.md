# Provenance record

Assembled 2026-09-09 from the author's working folders. Source locations are given relative to the project folder; the machine-specific parts of paths are replaced by labels in angle brackets.

## Unchanged by construction

Freeze records, raw records (with the one error-field substitution listed below), store records, results, the IFEval selection and the IFEval files were copied byte for byte. Three plans are byte for byte as frozen; the first plan's public copy has one redacted phrase (PLAN-REDACTION.txt). The plan hashes were checked against the FREEZE files before the redaction: PREREGISTRATION-ADDENDUM-2.md match, PREREGISTRATION-ADDENDUM-3.md match, PREREGISTRATION-ADDENDUM-4.md match, PREREGISTRATION-ADDENDUM-8.md match, PREREGISTRATION-ADDENDUM.md match.

IFEval files vendored from google-research/instruction_following_eval; SHA-256 at assembly: ifeval/instruction_following_eval/instructions.py 60e086f5342a03ce; ifeval/instruction_following_eval/instructions_registry.py ec92d72c264f6d90; ifeval/instruction_following_eval/instructions_util.py a73797261eee5bf4; ifeval/input_data.jsonl 67ffeee0fcb87c31. A comparison with the upstream files on 2026-09-09 found all four identical.

## Substitutions in copied scripts

Only local file paths and the AWS profile name were changed. Prompts, responses, scores and plans were not touched.

- controls/PREREGISTRATION-ADDENDUM.md (from <controls folder>/PREREGISTRATION-ADDENDUM.md): one phrase naming the cloud account owner redacted (PLAN-REDACTION.txt) replaced 1 time
- controls/bedrock.mjs (from <controls folder>/bedrock.mjs): the local controls folder path replaced 1 time; the AWS CLI profile name replaced 1 time
- controls/e1.mjs (from <controls folder>/e1.mjs): the local path of the built kit's entry module replaced 1 time; the local controls folder path (with slash) replaced 2 times
- controls/e2.mjs (from <controls folder>/e2.mjs): the local path of the built kit's entry module replaced 1 time; the local controls folder path (with slash) replaced 2 times
- controls/e3.mjs (from <controls folder>/e3.mjs): the local path of the built kit's entry module replaced 1 time; the local controls folder path (with slash) replaced 3 times
- controls/e5-merge.py (from <controls folder>/e5-merge.py): the local controls folder path replaced 1 time; D = <controls dir> -> path of this file replaced 1 time
- controls/e5.py (from <controls folder>/e5.py): the local controls folder path replaced 1 time; the AWS CLI profile name replaced 1 time; D = <controls dir> -> path of this file replaced 1 time
- controls/e6.mjs (from <controls folder>/e6.mjs): the local path of the built kit's entry module replaced 1 time; the local controls folder path replaced 1 time
- controls/e6b.mjs (from <controls folder>/e6b.mjs): the local path of the built kit's entry module replaced 1 time; the local controls folder path replaced 1 time
- controls/e6c.mjs (from <controls folder>/e6c.mjs): the local path of the built kit's entry module replaced 1 time; the local controls folder path replaced 1 time
- controls/e6d.mjs (from <controls folder>/e6d.mjs): the local path of the built kit's entry module replaced 1 time; the local controls folder path replaced 1 time
- controls/readout-stack.py (from <controls folder>/readout-stack.py): the local controls folder path (with slash) replaced 1 time; D = <controls dir> -> path of this file replaced 1 time
- controls/readout.py (from <controls folder>/readout.py): the local controls folder path (with slash) replaced 1 time; D = <controls dir> -> path of this file replaced 1 time
- controls/verify-v23-claims.py (from <controls folder>/verify-v23-claims.py): the local controls folder path (with slash) replaced 1 time; D = <controls dir> -> path of this file replaced 1 time
- controls/raw/e6c-haiku.jsonl (from <controls folder>/raw/e6c-haiku.jsonl): in the error field, the local controls folder path (with slash) replaced 1 time
- p4-2026-08-26/p4.mjs (from <cost-pilot folder>/p4.mjs): the local cost-pilot folder path replaced 1 time; the AWS CLI profile name replaced 1 time
- e4-2026-09-09/e4.mjs (from <E4 folder>/e4.mjs): the local E4 folder path replaced 1 time; the local path of the built kit's entry module replaced 1 time
- e4-2026-09-09/e4b.mjs (from <E4 folder>/e4b.mjs): the local E4 folder path replaced 1 time; the local path of the built kit's entry module replaced 1 time
- e7-2026-09-09/e7.mjs (from <E7 folder>/e7.mjs): the local path of the built kit's checkers module replaced 1 time; the local E7 folder path replaced 1 time; the local controls folder path (with slash) replaced 1 time
- e8-2026-09-10/bedrock-e8.mjs (from <E8 folder>/bedrock-e8.mjs): the local E8 folder path replaced 1 time; the AWS CLI profile name replaced 1 time
- e8-2026-09-10/e8.mjs (from <E8 folder>/e8.mjs): the local path of the built kit's entry module replaced 1 time

## Excluded

- controls/raw/_m_*.json: transient AWS CLI message files (copies of prompts already in the records).
- p4-2026-08-26/_m.json: the same kind of transient file.
- ifeval/__pycache__.

## Raw record counts

- e1-haiku.jsonl: 472
- e2-haiku.jsonl: 932
- e3-llama70b.jsonl: 541
- e3-llama8b.jsonl: 235
- e5-haiku.jsonl: 741
- e5-llama70b.jsonl: 732
- e5-llama8b.jsonl: 794
- e6-haiku.jsonl: 240
- e6b-haiku.jsonl: 244
- e6c-haiku.jsonl: 339
- e6d-haiku.jsonl: 240
- smoke.jsonl: 3

## Kit

kit/ is git archive of cognitive-middleware at 3d20393835e1e9184602a6edf563b3b359b2ea80 (2026-08-25T06:16:50-07:00).

## Decisions recorded

- The first plan's public copy is redacted in one phrase, with both hashes recorded (the author, 2026-09-09).
- License for the archive's own content: CC BY 4.0 (the author, 2026-09-09).

## Additions

- 2026-09-10: the kit import paths in every copied script were corrected from file:///../kit/... to ../kit/... (the first assembly's substitution left an invalid relative file URL); no other change to any script. e8-2026-09-10/ added; see the README.

## Deposits

- Repository: https://github.com/oceanusgascon26/blue-fairy-reviewer-archive.
- OSF: reviewer-archive-2026-09-09.zip in the registered report's public project https://osf.io/eduak (file https://osf.io/3r4pq), uploaded 2026-09-09; the zip is the archive at commit 171ae54 (through E6d), SHA-256 d4a54d88587ed21fb45cc05f3123e40780647850cfabfed23c5181c69efe42c6. Later commits to the repository are not mirrored to OSF unless a new zip is deposited.
- Zenodo (the kit): release v0.0.1 of oceanusgascon26/cognitive-middleware, code identical to the pinned commit, DOI 10.5281/zenodo.22683481, concept DOI 10.5281/zenodo.22683480, archived 2026-09-10 through Zenodo's GitHub integration.
- OSF (E8): the E8 plan and frozen files were uploaded to the folder e8-composition-pilot of the same project and registered publicly as https://osf.io/qc3db on 2026-09-10 before the run; the registration was approved the same day. After its archiving completed, the E8 results (results-e8.json, READOUT-E8.md, E8-NOTE.md, run-e8.log, readout-e8.py, REGISTRATION-E8.txt and e8-raw-and-stores-2026-09-10.zip) were uploaded to the same folder.
- OSF, second deposit: reviewer-archive-2026-09-10.zip in the same project (file https://osf.io/u9ajt), uploaded 2026-09-10; the zip is git archive of the repository at commit bf4b77a (through E8), 3,460,844 bytes, SHA-256 c40e7ea4921744f5af9b0ca67e7c101eefba9acc98af946001364ad55adb3e47.
