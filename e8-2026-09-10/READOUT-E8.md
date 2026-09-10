# E8 readout: the machine-checked composition pilot (2026-09-10)

Protocol: PREREGISTRATION-E8.md, frozen by the hashes in FREEZE-E8.txt and registered publicly as osf.io/qc3db before any call. Model us.anthropic.claude-haiku-4-5-20251001-v1:0, temperature 0.7, maxTokens 400, budget 4 generations, 3 repetitions of one fixed 120-prompt sequence. Raw call logs in raw/, stores in stores/. Task list sha256 8a5f42a0502cd253.

## Pass rates by repetition

| Repetition | Base | Repair only (unwired stack) | Integrated (the wire) | Supplied rules | Monolithic prompt | Monolithic resampling |
|---|---|---|---|---|---|---|
| 1, all positions | 68.3% | 95.0% | 92.5% | 91.7% | 72.5% | 87.5% |
| 1, positions 61 to 120 | 66.7% | 95.0% | 88.3% | 91.7% | 71.7% | 85.0% |
| 2, all positions | 70.0% | 93.3% | 92.5% | 93.3% | 72.5% | 90.8% |
| 2, positions 61 to 120 | 65.0% | 90.0% | 90.0% | 91.7% | 73.3% | 88.3% |
| 3, all positions | 67.5% | 95.8% | 94.2% | 95.8% | 74.2% | 85.8% |
| 3, positions 61 to 120 | 66.7% | 93.3% | 91.7% | 91.7% | 71.7% | 86.7% |

| Mean calls per task | 1.00 | 1.49 | 1.48 | 1.53 | 1.00 | 1.56 |
|---|---|---|---|---|---|---|
| Calls, all repetitions | 360 | 537 | 533 | 549 | 360 | 560 |
| Input tokens | 13761 | 48993 | 70197 | 77131 | 112401 | 174600 |
| Output tokens | 43709 | 62200 | 63266 | 60942 | 39594 | 58653 |
| Call errors | 0 | 0 | 0 | 0 | 0 | 0 |

## Primary outcome

integrated minus repair, positions 61 to 120: -2.8pp [-6.7pp, +1.7pp], bootstrap p = 0.249, n = 60 prompts.

Verdict under the frozen rule: no separation: the interval for integrated minus repair-only includes zero.

## Secondary family (Benjamini-Hochberg, q = 0.05, positions 61 to 120)

| Comparison | Difference (95% CI) | p | adjusted p | passes |
|---|---|---|---|---|
| integrated minus supplied | -1.7pp [-6.1pp, +2.2pp] | 0.510 | 0.510 | no |
| repair minus mono | +20.6pp [+12.8pp, +28.9pp] | 0.000 | 0.000 | yes |
| integrated minus mono | +17.8pp [+10.0pp, +25.6pp] | 0.000 | 0.000 | yes |
| supplied minus mono | +19.4pp [+11.7pp, +27.8pp] | 0.000 | 0.000 | yes |
| repair minus monoresample | +6.1pp [-1.1pp, +12.8pp] | 0.115 | 0.201 | no |
| integrated minus monoresample | +3.3pp [-2.8pp, +9.4pp] | 0.348 | 0.406 | no |
| supplied minus monoresample | +5.0pp [-1.7pp, +11.7pp] | 0.176 | 0.246 | no |

## Descriptive

Pooled pass rate per arm (mean over prompts of the per-prompt pass averaged over repetitions), all positions and positions 61 to 120:

| Arm | All positions | Positions 61 to 120 |
|---|---|---|
| Base | 68.6% [60.8%, 76.1%] | 66.1% [53.9%, 77.8%] |
| Repair only (unwired stack) | 94.7% [91.1%, 97.8%] | 92.8% [87.2%, 97.8%] |
| Integrated (the wire) | 93.1% [88.9%, 96.7%] | 90.0% [82.8%, 96.1%] |
| Supplied rules | 93.6% [89.4%, 97.2%] | 91.7% [84.4%, 97.8%] |
| Monolithic prompt | 73.1% [66.4%, 79.4%] | 72.2% [61.7%, 81.7%] |
| Monolithic resampling | 88.1% [82.8%, 92.8%] | 86.7% [78.3%, 94.4%] |

Pass rate by class (all positions, pooled over repetitions):

| Class | Base | Repair only (unwired stack) | Integrated (the wire) | Supplied rules | Monolithic prompt | Monolithic resampling |
|---|---|---|---|---|---|---|
| wordcount | 8.9% | 91.1% | 95.6% | 91.1% | 44.4% | 88.9% |
| sentences | 93.3% | 93.3% | 93.3% | 93.3% | 93.3% | 100.0% |
| noletter | 15.6% | 75.6% | 60.0% | 68.9% | 15.6% | 40.0% |
| commas | 55.6% | 97.8% | 95.6% | 97.8% | 57.8% | 80.0% |
| lowercase | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% |
| bullets | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% |
| ending | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% |
| frequency | 75.6% | 100.0% | 100.0% | 97.8% | 73.3% | 95.6% |

Learning curve, pass rate by block of twenty positions (pooled over repetitions):

| Arm | 1-20 | 21-40 | 41-60 | 61-80 | 81-100 | 101-120 |
|---|---|---|---|---|---|---|
| Repair only (unwired stack) | 96.7% | 100.0% | 93.3% | 95.0% | 91.7% | 91.7% |
| Integrated (the wire) | 95.0% | 100.0% | 93.3% | 96.7% | 88.3% | 85.0% |
| Supplied rules | 95.0% | 100.0% | 91.7% | 98.3% | 88.3% | 88.3% |
| Base | 65.0% | 81.7% | 66.7% | 75.0% | 61.7% | 61.7% |

Same comparisons on positions 1 to 60 and on all positions (descriptive, no inference):

| Comparison | Positions 1 to 60 | All positions |
|---|---|---|
| integrated minus supplied | +0.6pp [-2.8pp, +3.9pp] | -0.6pp [-3.3pp, +1.9pp] |
| repair minus mono | +22.8pp [+13.9pp, +32.2pp] | +21.7pp [+15.8pp, +27.8pp] |
| integrated minus mono | +22.2pp [+13.9pp, +31.1pp] | +20.0pp [+14.4pp, +25.8pp] |
| supplied minus mono | +21.7pp [+12.2pp, +31.1pp] | +20.6pp [+14.4pp, +26.7pp] |
| repair minus monoresample | +7.2pp [+1.7pp, +13.9pp] | +6.7pp [+2.2pp, +11.7pp] |
| integrated minus monoresample | +6.7pp [+1.7pp, +12.2pp] | +5.0pp [+1.1pp, +9.2pp] |
| supplied minus monoresample | +6.1pp [+0.0pp, +12.2pp] | +5.6pp [+1.1pp, +10.3pp] |
| integrated minus repair | -0.6pp [-2.8pp, +1.7pp] | -1.7pp [-4.2pp, +0.6pp] |

## Lessons written by the integrated arm

Lessons written per repetition: 33 / 32 / 31. Leakage flags (a lesson containing a topic string or not matching the template): 0.

Repetition 1, final store (6 lessons):

- (e8-wordcount) Word count tasks have failed the check 8 times so far. Latest failure: the response has 30 words; the task asked for between 25 and 29 words. Satisfy the word count rule before finishing.
- (e8-noletter) Forbidden letter tasks have failed the check 14 times so far. Latest failure: the response uses the letter "m" 8 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e8-commas) Comma count tasks have failed the check 6 times so far. Latest failure: the response has 5 commas; the task asked for exactly 3. Satisfy the comma count rule before finishing.
- (e8-lowercase) Lowercase tasks have failed the check 1 time so far. Latest failure: the response has 1 capital letter; the task asked for lowercase only. Satisfy the lowercase rule before finishing.
- (e8-frequency) Word frequency tasks have failed the check 3 times so far. Latest failure: the word "compass" appears 5 times in the response; the task asked for exactly 4. Satisfy the word frequency rule before finishing.
- (e8-sentences) Sentence count tasks have failed the check 1 time so far. Latest failure: the response has 4 sentences; the task asked for exactly 2. Satisfy the sentence count rule before finishing.

Repetition 2, final store (5 lessons):

- (e8-wordcount) Word count tasks have failed the check 9 times so far. Latest failure: the response has 31 words; the task asked for between 25 and 29 words. Satisfy the word count rule before finishing.
- (e8-noletter) Forbidden letter tasks have failed the check 14 times so far. Latest failure: the response uses the letter "m" 19 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e8-commas) Comma count tasks have failed the check 5 times so far. Latest failure: the response has 5 commas; the task asked for exactly 3. Satisfy the comma count rule before finishing.
- (e8-frequency) Word frequency tasks have failed the check 3 times so far. Latest failure: the word "compass" appears 5 times in the response; the task asked for exactly 4. Satisfy the word frequency rule before finishing.
- (e8-sentences) Sentence count tasks have failed the check 1 time so far. Latest failure: the response has 6 sentences; the task asked for exactly 2. Satisfy the sentence count rule before finishing.

Repetition 3, final store (5 lessons):

- (e8-wordcount) Word count tasks have failed the check 9 times so far. Latest failure: the response has 31 words; the task asked for between 25 and 29 words. Satisfy the word count rule before finishing.
- (e8-noletter) Forbidden letter tasks have failed the check 14 times so far. Latest failure: the response uses the letter "m" 8 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e8-commas) Comma count tasks have failed the check 3 times so far. Latest failure: the response has 6 commas; the task asked for exactly 3. Satisfy the comma count rule before finishing.
- (e8-frequency) Word frequency tasks have failed the check 4 times so far. Latest failure: the word "river" appears 4 times in the response; the task asked for exactly 3. Satisfy the word frequency rule before finishing.
- (e8-sentences) Sentence count tasks have failed the check 1 time so far. Latest failure: the response has 6 sentences; the task asked for exactly 2. Satisfy the sentence count rule before finishing.

