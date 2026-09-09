# Preregistration addendum 6: E4b, the three word-frequency grammars rerun with parser-safe names (2026-09-09)

Written after E4 completed and before any E4b call. In E4 the server rejected the grammars for the three word-frequency constraints (word-twice, water-3, time-2) with "failed to parse grammar" on every repetition. The cause is in the grammar generator, not the model: the product construction named its rules with underscores (s_0_0, m_1_2), which the offline matcher used for testing accepted and llama.cpp's grammar parser does not, since its rule names allow letters, digits and hyphens only. E4's frozen primary outcome stands as run, with those three items counted as constrained failures and the server error recorded per item, as the plan's secondary outcomes required. This addendum freezes a small follow-up on the three items and nothing else.

## E4b. Three word-frequency constraints, four arms, parser-safe grammars

Serving path, base, temperature, token ceiling, sampling settings, chat template and checkers: exactly as in addendum 5 (the same server process, still running).

Grammars: grammars-e4b.json, produced by make-grammars-e4b.py, the same product construction with hyphenated rule names and optional groups in place of empty alternatives. Tested offline against 6 strings that must be accepted and 8 that must be rejected, with no model call; the kit's own checkers agree with every one of those labels. Before this freeze, each grammar was sent to the server once with a neutral one-word prompt and a one-token limit to confirm that the parser accepts it; those three calls are logged to raw/parse-check-e4b.jsonl and are not outcome data. The frozen grammars.json of E4 is untouched.

Items: word-twice, water-3, time-2. Arms and budget as in addendum 5: one-shot, repair (ceiling four), verifier-selected resampling (ceiling four, first draft shared), constrained (one generation under the item's grammar). Three repetitions, arms in the same order, every call logged raw. Seeds are derived from a new base (20260910) so the unconstrained arms are fresh draws, not replays of E4's.

Outcomes: the pass count per arm out of nine trials, and the per-trial texts of the constrained arm. A constrained-minus-repair difference with a cluster bootstrap over the three items is computed for consistency and reported as descriptive only: three clusters cannot support a separation claim in either direction, and E4b is never pooled into E4's primary outcome. The topic-keyword proxy, token counts, wall-clock seconds, ceiling hits and server errors are reported as in addendum 5.

Predictions written now: the parser accepts all three grammars; the constrained arm passes most of the nine trials; some constrained texts read as repetitive or padded, since the grammar forbids commas and apostrophes and forces the count; repair on these items sits below constrained, as E4 found on the exact-count classes.

## Reporting

E4b is reported beside E4 in the evidence appendix as the disclosed follow-up: E4's coverage is stated as 36 of 39 grammars accepted by the server and 39 of 39 expressible, the defect and its cause are named, and E4b's counts are given separately. The book does not restate E4's primary with the three items repaired.
