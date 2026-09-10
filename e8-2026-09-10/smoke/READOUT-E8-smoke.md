# E8 readout: the machine-checked composition pilot (SMOKE TEST, scripted fake base, NOT DATA)

Protocol: PREREGISTRATION-E8.md, frozen by the hashes in FREEZE-E8.txt and registered publicly as osf.io/qc3db before any call. Model mock, temperature 0.7, maxTokens 400, budget 4 generations, 3 repetitions of one fixed 120-prompt sequence. Raw call logs in raw/, stores in stores/. Task list sha256 8a5f42a0502cd253.

## Pass rates by repetition

| Repetition | Base | Repair only (unwired stack) | Integrated (the wire) | Supplied rules | Monolithic prompt | Monolithic resampling |
|---|---|---|---|---|---|---|
| 1, all positions | 16.7% | 40.0% | 40.8% | 34.2% | 18.3% | 36.7% |
| 1, positions 61 to 120 | 23.3% | 43.3% | 45.0% | 38.3% | 18.3% | 38.3% |
| 2, all positions | 14.2% | 30.8% | 33.3% | 36.7% | 17.5% | 39.2% |
| 2, positions 61 to 120 | 15.0% | 33.3% | 33.3% | 43.3% | 21.7% | 38.3% |
| 3, all positions | 21.7% | 36.7% | 36.7% | 32.5% | 15.8% | 36.7% |
| 3, positions 61 to 120 | 20.0% | 36.7% | 40.0% | 36.7% | 23.3% | 41.7% |

| Mean calls per task | 1.00 | 3.24 | 3.21 | 3.30 | 1.00 | 3.23 |
|---|---|---|---|---|---|---|
| Calls, all repetitions | 360 | 1168 | 1156 | 1188 | 360 | 1164 |
| Input tokens | 0 | 0 | 0 | 0 | 0 | 0 |
| Output tokens | 0 | 0 | 0 | 0 | 0 | 0 |
| Call errors | 0 | 0 | 0 | 0 | 0 | 0 |

## Primary outcome

integrated minus repair, positions 61 to 120: +1.7pp [-3.9pp, +6.7pp], bootstrap p = 0.582, n = 60 prompts.

Verdict under the frozen rule: no separation: the interval for integrated minus repair-only includes zero.

## Secondary family (Benjamini-Hochberg, q = 0.05, positions 61 to 120)

| Comparison | Difference (95% CI) | p | adjusted p | passes |
|---|---|---|---|---|
| integrated minus supplied | +0.0pp [-4.4pp, +4.4pp] | 1.000 | 1.000 | no |
| repair minus mono | +16.7pp [+9.4pp, +25.0pp] | 0.000 | 0.000 | yes |
| integrated minus mono | +18.3pp [+11.1pp, +26.1pp] | 0.000 | 0.000 | yes |
| supplied minus mono | +18.3pp [+11.7pp, +25.6pp] | 0.000 | 0.000 | yes |
| repair minus monoresample | -1.7pp [-6.7pp, +2.8pp] | 0.558 | 0.977 | no |
| integrated minus monoresample | +0.0pp [-6.1pp, +5.6pp] | 0.986 | 1.000 | no |
| supplied minus monoresample | +0.0pp [-4.4pp, +4.4pp] | 0.979 | 1.000 | no |

## Descriptive

Pooled pass rate per arm (mean over prompts of the per-prompt pass averaged over repetitions), all positions and positions 61 to 120:

| Arm | All positions | Positions 61 to 120 |
|---|---|---|
| Base | 17.5% [12.5%, 22.5%] | 19.4% [12.2%, 27.2%] |
| Repair only (unwired stack) | 35.8% [28.6%, 43.3%] | 37.8% [27.8%, 48.3%] |
| Integrated (the wire) | 36.9% [29.7%, 44.4%] | 39.4% [29.4%, 50.6%] |
| Supplied rules | 34.4% [27.8%, 41.4%] | 39.4% [29.4%, 50.0%] |
| Monolithic prompt | 17.2% [12.2%, 22.2%] | 21.1% [13.9%, 29.4%] |
| Monolithic resampling | 37.5% [30.6%, 44.7%] | 39.4% [30.0%, 50.0%] |

Pass rate by class (all positions, pooled over repetitions):

| Class | Base | Repair only (unwired stack) | Integrated (the wire) | Supplied rules | Monolithic prompt | Monolithic resampling |
|---|---|---|---|---|---|---|
| wordcount | 2.2% | 8.9% | 13.3% | 11.1% | 2.2% | 8.9% |
| sentences | 13.3% | 26.7% | 31.1% | 22.2% | 11.1% | 33.3% |
| noletter | 40.0% | 91.1% | 86.7% | 82.2% | 37.8% | 91.1% |
| commas | 37.8% | 46.7% | 44.4% | 46.7% | 37.8% | 51.1% |
| lowercase | 31.1% | 82.2% | 84.4% | 73.3% | 35.6% | 73.3% |
| bullets | 6.7% | 11.1% | 13.3% | 17.8% | 4.4% | 15.6% |
| ending | 8.9% | 11.1% | 17.8% | 13.3% | 6.7% | 20.0% |
| frequency | 0.0% | 8.9% | 4.4% | 8.9% | 2.2% | 6.7% |

Learning curve, pass rate by block of twenty positions (pooled over repetitions):

| Arm | 1-20 | 21-40 | 41-60 | 61-80 | 81-100 | 101-120 |
|---|---|---|---|---|---|---|
| Repair only (unwired stack) | 26.7% | 43.3% | 31.7% | 21.7% | 41.7% | 50.0% |
| Integrated (the wire) | 31.7% | 45.0% | 26.7% | 26.7% | 36.7% | 55.0% |
| Supplied rules | 28.3% | 31.7% | 28.3% | 21.7% | 36.7% | 60.0% |
| Base | 13.3% | 16.7% | 16.7% | 15.0% | 20.0% | 23.3% |

Same comparisons on positions 1 to 60 and on all positions (descriptive, no inference):

| Comparison | Positions 1 to 60 | All positions |
|---|---|---|
| integrated minus supplied | +5.0pp [-0.6pp, +10.6pp] | +2.5pp [-1.4pp, +6.4pp] |
| repair minus mono | +20.6pp [+12.2pp, +29.4pp] | +18.6pp [+13.1pp, +24.7pp] |
| integrated minus mono | +21.1pp [+12.8pp, +30.6pp] | +19.7pp [+13.9pp, +26.4pp] |
| supplied minus mono | +16.1pp [+9.4pp, +23.3pp] | +17.2pp [+12.5pp, +22.2pp] |
| repair minus monoresample | -1.7pp [-6.7pp, +2.8pp] | -1.7pp [-5.0pp, +1.7pp] |
| integrated minus monoresample | -1.1pp [-6.7pp, +3.9pp] | -0.6pp [-4.4pp, +3.3pp] |
| supplied minus monoresample | -6.1pp [-11.1pp, -1.1pp] | -3.1pp [-6.4pp, +0.6pp] |
| integrated minus repair | +0.6pp [-5.0pp, +6.1pp] | +1.1pp [-2.8pp, +5.0pp] |

## Lessons written by the integrated arm

Lessons written per repetition: 93 / 99 / 99. Leakage flags (a lesson containing a topic string or not matching the template): 0.

Repetition 1, final store (8 lessons):

- (e8-wordcount) Word count tasks have failed the check 15 times so far. Latest failure: the response has 8 words; the task asked for between 25 and 29 words. Satisfy the word count rule before finishing.
- (e8-frequency) Word frequency tasks have failed the check 15 times so far. Latest failure: the word "compass" appears 0 times in the response; the task asked for exactly 4. Satisfy the word frequency rule before finishing.
- (e8-commas) Comma count tasks have failed the check 8 times so far. Latest failure: the response has 2 commas; the task asked for exactly 3. Satisfy the comma count rule before finishing.
- (e8-ending) Ending phrase tasks have failed the check 14 times so far. Latest failure: the response does not finish with the exact phrase "Any other questions?" as its final characters; the task asked for that phrase at the very end with nothing after it. Satisfy the ending phrase rule before finishing.
- (e8-sentences) Sentence count tasks have failed the check 14 times so far. Latest failure: the response has 1 sentences; the task asked for exactly 2. Satisfy the sentence count rule before finishing.
- (e8-bullets) Bullet lines tasks have failed the check 13 times so far. Latest failure: the response has 1 non-empty lines, 0 of which start with "- "; the task asked for exactly 3 bullet lines and nothing else. Satisfy the bullet lines rule before finishing.
- (e8-lowercase) Lowercase tasks have failed the check 8 times so far. Latest failure: the response has 4 capital letters; the task asked for lowercase only. Satisfy the lowercase rule before finishing.
- (e8-noletter) Forbidden letter tasks have failed the check 6 times so far. Latest failure: the response uses the letter "g" 1 time; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.

Repetition 2, final store (8 lessons):

- (e8-wordcount) Word count tasks have failed the check 14 times so far. Latest failure: the response has 38 words; the task asked for between 25 and 29 words. Satisfy the word count rule before finishing.
- (e8-commas) Comma count tasks have failed the check 10 times so far. Latest failure: the response has 2 commas; the task asked for exactly 0. Satisfy the comma count rule before finishing.
- (e8-frequency) Word frequency tasks have failed the check 14 times so far. Latest failure: the word "compass" appears 0 times in the response; the task asked for exactly 4. Satisfy the word frequency rule before finishing.
- (e8-ending) Ending phrase tasks have failed the check 15 times so far. Latest failure: the response does not finish with the exact phrase "Any other questions?" as its final characters; the task asked for that phrase at the very end with nothing after it. Satisfy the ending phrase rule before finishing.
- (e8-sentences) Sentence count tasks have failed the check 15 times so far. Latest failure: the response has 1 sentences; the task asked for exactly 2. Satisfy the sentence count rule before finishing.
- (e8-lowercase) Lowercase tasks have failed the check 10 times so far. Latest failure: the response has 1 capital letter; the task asked for lowercase only. Satisfy the lowercase rule before finishing.
- (e8-bullets) Bullet lines tasks have failed the check 15 times so far. Latest failure: the response has 1 non-empty lines, 0 of which start with "- "; the task asked for exactly 3 bullet lines and nothing else. Satisfy the bullet lines rule before finishing.
- (e8-noletter) Forbidden letter tasks have failed the check 6 times so far. Latest failure: the response uses the letter "w" 2 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.

Repetition 3, final store (8 lessons):

- (e8-wordcount) Word count tasks have failed the check 14 times so far. Latest failure: the response has 38 words; the task asked for between 25 and 29 words. Satisfy the word count rule before finishing.
- (e8-frequency) Word frequency tasks have failed the check 15 times so far. Latest failure: the word "compass" appears 0 times in the response; the task asked for exactly 4. Satisfy the word frequency rule before finishing.
- (e8-commas) Comma count tasks have failed the check 10 times so far. Latest failure: the response has 2 commas; the task asked for exactly 0. Satisfy the comma count rule before finishing.
- (e8-noletter) Forbidden letter tasks have failed the check 9 times so far. Latest failure: the response uses the letter "w" 6 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e8-ending) Ending phrase tasks have failed the check 14 times so far. Latest failure: the response does not finish with the exact phrase "Any other questions?" as its final characters; the task asked for that phrase at the very end with nothing after it. Satisfy the ending phrase rule before finishing.
- (e8-sentences) Sentence count tasks have failed the check 13 times so far. Latest failure: the response has 1 sentences; the task asked for exactly 2. Satisfy the sentence count rule before finishing.
- (e8-bullets) Bullet lines tasks have failed the check 13 times so far. Latest failure: the response has 1 non-empty lines, 0 of which start with "- "; the task asked for exactly 4 bullet lines and nothing else. Satisfy the bullet lines rule before finishing.
- (e8-lowercase) Lowercase tasks have failed the check 11 times so far. Latest failure: the response has 3 capital letters; the task asked for lowercase only. Satisfy the lowercase rule before finishing.

