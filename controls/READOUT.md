# Controls of 2026-09-09: readout

Protocol: PREREGISTRATION-ADDENDUM.md, frozen by the hash in FREEZE.txt before any experimental call. Raw call logs in raw/. Every number below is one exploratory run of the design stated in the addendum; nothing is pooled with any earlier run.

## E1. Failure probabilities behind the failing-subset rule

Bare Haiku 4.5, 8 draws per item, temperature 0.7.

| Set | Items | Single-draw failures | Majority failures (over 8 draws) | Items whose first draw disagrees with the majority | Single-draw headroom | Expected headroom (mean p_fail) |
|---|---|---|---|---|---|---|
| T39 | 39 | 16 | 15 | 3 | 41.0% | 36.5% |
| T20 | 20 | 6 | 2 | 4 | 30.0% | 23.8% |

T39: 20 items never failed, 5 failed on every draw (no-letter-e, no-vowel-a-e, no-o, no-t, no-i), 14 failed on some draws (wordcount-20 4/8, wordcount-33 7/8, no-letter-a 7/8, wc-12 7/8, wc-15 7/8, wc-25 7/8, wc-40 7/8, wc-50 6/8, no-s 7/8, no-n 1/8, commas-1 6/8, commas-3 6/8, water-3 1/8, time-2 1/8).
T20: 11 items never failed, 1 failed on every draw (words-50), 8 failed on some draws (words-20 4/8, words-33 4/8, no-e-2sent 4/8, no-a-1sent 2/8, lower-nocomma-25to30 1/8, data-x3 4/8, short-words-15 4/8, titlecase-12 7/8).

## E2. Repair against verifier-selected resampling at a budget of 4 fixed in advance

Haiku 4.5, T39, 5 repetitions, shared first draft, temperature 0.7.

| Repetition | One-shot | Repair | Resampling | Repair minus resampling (95% CI) | Repair minus one-shot | Resampling minus one-shot |
|---|---|---|---|---|---|---|
| 1 | 64.1% | 79.5% | 71.8% | +7.7pp [-2.6pp, +17.9pp] | +15.4pp [+5.1pp, +25.6pp] | +7.7pp [+0.0pp, +15.4pp] |
| 2 | 76.9% | 92.3% | 79.5% | +12.8pp [+2.6pp, +23.1pp] | +15.4pp [+5.1pp, +28.2pp] | +2.6pp [+0.0pp, +7.7pp] |
| 3 | 59.0% | 82.1% | 79.5% | +2.6pp [-5.1pp, +12.8pp] | +23.1pp [+10.3pp, +35.9pp] | +20.5pp [+10.3pp, +33.3pp] |
| 4 | 64.1% | 84.6% | 82.1% | +2.6pp [-5.1pp, +10.3pp] | +20.5pp [+7.7pp, +33.3pp] | +17.9pp [+7.7pp, +30.8pp] |
| 5 | 56.4% | 84.6% | 79.5% | +5.1pp [-7.7pp, +17.9pp] | +28.2pp [+15.4pp, +43.6pp] | +23.1pp [+10.3pp, +35.9pp] |

Pooled over repetitions (cluster bootstrap over items): repair minus resampling +6.2pp [+0.0pp, +13.3pp]; repair minus one-shot +20.5pp [+11.3pp, +30.8pp]; resampling minus one-shot +14.4pp [+8.2pp, +21.5pp]. Mean repair calls per item 1.78 against a budget of 4.

Verdict under the frozen rule: no separation at the fixed budget: interval includes zero.

## E3. The large base inside the same loop

Llama 3.1 8B and Llama 3.3 70B, T39, 3 repetitions, budget 4, temperature 0.7. Costs use the illustrative blended rates of the cost chapter (dollars per million tokens: 8B 0.22, 70B 0.72) and are labeled illustrative; token counts are the record.

| Repetition | 8B one-shot | 8B + repair | 70B one-shot | 70B + repair | 70B resampling | 8B+repair minus 70B+repair (95% CI) | 70B+repair minus 70B one-shot |
|---|---|---|---|---|---|---|---|
| 1 | 51.3% | 76.9% | 76.9% | 84.6% | 79.5% | -7.7pp [-20.5pp, +5.1pp] | +7.7pp [+0.0pp, +17.9pp] |
| 2 | 53.8% | 84.6% | 66.7% | 82.1% | 76.9% | +2.6pp [-7.7pp, +12.8pp] | +15.4pp [+5.1pp, +28.2pp] |
| 3 | 56.4% | 82.1% | 76.9% | 89.7% | 79.5% | -7.7pp [-20.5pp, +5.1pp] | +12.8pp [+2.6pp, +23.1pp] |

| Repetition | Tokens 8B one-shot | Tokens 8B + repair | Tokens 70B one-shot | Tokens 70B + repair | Tokens 70B resampling | Illustrative cost per pass: 8B+repair | 70B one-shot | 70B+repair |
|---|---|---|---|---|---|---|---|---|
| 1 | 3217 | 8802 | 3921 | 7336 | 15409 | $0.00006 | $0.00009 | $0.00016 |
| 2 | 3216 | 8139 | 3856 | 8402 | 15369 | $0.00005 | $0.00011 | $0.00019 |
| 3 | 3209 | 7545 | 3901 | 7102 | 15482 | $0.00005 | $0.00009 | $0.00015 |

Pooled: 8B+repair minus 70B+repair -4.3pp [-13.7pp, +5.1pp]; 70B+repair minus 70B one-shot +12.0pp [+4.3pp, +22.2pp]; 70B+repair minus 70B resampling +6.8pp [-1.7pp, +17.1pp]; 8B+repair minus 70B one-shot +7.7pp [-3.4pp, +18.8pp]; 8B+repair minus 8B one-shot +27.4pp [+16.2pp, +39.3pp].

Verdict under the frozen rule: no separation between 8B+repair and 70B+repair: interval includes zero.

## E6. Durable learning, rerun with the isolation recorded

Haiku 4.5, twenty new words, one seeded substitution cipher, 3 repetitions. Session two, the supplied-key control and the cold repeat each ran in a fresh process; every prompt is in the raw log; the store held exactly one lesson.

| Repetition | Cold (contains / exact) | Warm, stored rule retrieved (contains / exact) | Supplied key in prompt (contains / exact) | Cold repeat |
|---|---|---|---|---|
| 1 | 0/20 / 0 | 20/20 / 0 | 20/20 / 0 | 0/20 |
| 2 | 0/20 / 0 | 19/20 / 0 | 20/20 / 0 | 0/20 |
| 3 | 0/20 / 0 | 19/20 / 0 | 20/20 / 0 | 0/20 |

Pooled: warm minus cold +96.7pp [+90.0pp, +100.0pp] (contains); warm minus supplied key -3.3pp [-10.0pp, +0.0pp]; supplied key minus cold +100.0pp [+100.0pp, +100.0pp]. Exact-match scores were zero in every arm: the model narrated its decoding despite the instruction to reply with only the word.

Verdict under the frozen rule: the stored rule changed behaviour on a real base (warm above cold).

Warm misses: rep 2 quartz, rep 3 quartz. Cold responses attempted Caesar shifts and never produced a target word; no earlier lesson appears in any cold prompt.

## Calls

Raw log lines across the four experiments: 5270 (plus 3 smoke-test calls logged separately). Errors are counted in each results file.
## E6b. The naive stack: a one-word reply enforced around the memory-wrapped base

Haiku 4.5, the E6 words and stores, 3 repetitions, budget 4, four arms each in a fresh process. Graders: exact, contains, and the repair checker's own format verdict.

| Repetition | Neither (exact / contains / format) | Memory only | Repair only | Both | Mean calls, repair / both |
|---|---|---|---|---|---|
| 1 | 0 / 0 / 8 | 0 / 19 / 0 | 0 / 0 / 20 | 1 / 2 / 20 | 1.00 / 1.05 |
| 2 | 0 / 0 / 9 | 0 / 19 / 0 | 0 / 0 / 20 | 1 / 1 / 20 | 1.10 / 1.05 |
| 3 | 0 / 0 / 7 | 0 / 20 / 0 | 0 / 0 / 20 | 0 / 0 / 20 | 1.00 / 1.00 |

Pooled on exact: both +3.3pp, memory only +0.0pp, repair only +0.0pp, neither +0.0pp. Both minus the better single organ +3.3pp [+0.0pp, +8.3pp]. Interaction (both minus memory minus repair plus neither) +3.3pp [+0.0pp, +8.3pp].

Verdict under the frozen rule: stacking did not beat the better single organ on exact match.

## E6c. The redesigned stack: reason, then the decoded word alone on the last line

Haiku 4.5, the E6 words and stores, 3 repetitions, budget 4, four arms each in a fresh process. Graders: final-line exact, contains, and the repair checker's own format verdict.

| Repetition | Neither (exact / contains / format) | Memory only | Repair only | Both | Mean calls, repair / both |
|---|---|---|---|---|---|
| 1 | 0 / 0 / 0 | 11 / 19 / 12 | 0 / 0 / 8 | 20 / 20 / 20 | 2.85 / 1.00 |
| 2 | 0 / 0 / 4 | 6 / 20 / 6 | 0 / 0 / 10 | 19 / 19 / 20 | 2.70 / 1.00 |
| 3 | 0 / 0 / 6 | 6 / 19 / 6 | 0 / 0 / 12 | 20 / 20 / 20 | 2.40 / 1.00 |

Pooled on final-line exact: both +98.3pp, memory only +38.3pp, repair only +0.0pp, neither +0.0pp. Both minus the better single organ +60.0pp [+48.3pp, +71.7pp]. Interaction (both minus memory minus repair plus neither) +60.0pp [+48.3pp, +71.7pp].

Verdict under the frozen rule: the redesigned stack delivered correct answers in the requested form that neither organ alone delivered.
## E5. An external constraint set across three bases

Sixty IFEval prompts drawn by seed 20260909, strict prompt-level pass with the reference checkers, budget 4, first draft shared, three repetitions per base.

| Base | One-shot by run | Repair by run | Resampling by run | Repair minus resampling | Repair minus one-shot | Calls |
|---|---|---|---|---|---|---|
| haiku | 91.7% / 91.7% / 86.7% | 100.0% / 100.0% / 98.3% | 95.0% / 98.3% / 100.0% | +1.7pp [-1.1pp, +5.0pp] | +9.4pp [+3.9pp, +16.7pp] | 741 |
| llama8b | 76.7% / 75.0% / 71.7% | 91.7% / 96.7% / 96.7% | 91.7% / 91.7% / 90.0% | +3.9pp [-1.7pp, +10.0pp] | +20.6pp [+13.3pp, +28.9pp] | 794 |
| llama70b | 91.7% / 98.3% / 96.7% | 98.3% / 98.3% / 100.0% | 100.0% / 100.0% / 100.0% | -1.1pp [-3.3pp, +0.0pp] | +3.3pp [+1.1pp, +6.1pp] | 732 |

Pooled over the three bases: repair minus resampling +1.5pp [-0.7pp, +4.1pp]; repair minus one-shot +11.1pp [+7.4pp, +15.6pp]; resampling minus one-shot +9.6pp [+6.3pp, +13.3pp].

Verdict under the frozen rule: no separation on the external set: interval includes zero. IFEval is public and may be in the training data of any of these models. E4, grammar-constrained decoding, remains unrun.
