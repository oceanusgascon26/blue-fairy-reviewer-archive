# E9 readout: the lesson-design follow-up to E8 (2026-09-10)

Protocol: PREREGISTRATION-E9.md, frozen by the hashes in FREEZE-E9.txt and registered publicly on OSF before any call (REGISTRATION-E9.txt). Model us.anthropic.claude-haiku-4-5-20251001-v1:0, temperature 0.7, maxTokens 400, budget 4 generations, 3 repetitions of one fixed 120-prompt sequence. Raw call logs in raw/, stores in stores/. Task list sha256 28af8f73be9e1097.

## Pass rates by repetition

| Repetition | Base | Repair only (unwired stack) | Wire A (E8 template) | Wire B (parameter-free) | Wire C (parameter-keyed) | Supplied rules |
|---|---|---|---|---|---|---|
| 1, all positions | 37.5% | 80.0% | 79.2% | 76.7% | 81.7% | 85.8% |
| 1, positions 61 to 120 | 40.0% | 80.0% | 76.7% | 78.3% | 85.0% | 85.0% |
| 1, first attempts, positions 61 to 120 | 40.0% | 41.7% | 48.3% | 43.3% | 56.7% | 41.7% |
| 2, all positions | 40.0% | 80.8% | 74.2% | 78.3% | 79.2% | 85.0% |
| 2, positions 61 to 120 | 38.3% | 85.0% | 70.0% | 78.3% | 80.0% | 85.0% |
| 2, first attempts, positions 61 to 120 | 38.3% | 45.0% | 43.3% | 43.3% | 50.0% | 48.3% |
| 3, all positions | 44.2% | 82.5% | 76.7% | 77.5% | 79.2% | 80.0% |
| 3, positions 61 to 120 | 43.3% | 81.7% | 76.7% | 71.7% | 80.0% | 81.7% |
| 3, first attempts, positions 61 to 120 | 43.3% | 38.3% | 50.0% | 45.0% | 48.3% | 45.0% |

| Mean calls per task | 1.00 | 2.19 | 2.21 | 2.22 | 2.15 | 2.12 |
|---|---|---|---|---|---|---|
| Calls, all repetitions | 360 | 790 | 797 | 799 | 773 | 765 |
| Input tokens | 12261 | 98464 | 145002 | 143338 | 125876 | 127851 |
| Output tokens | 43159 | 90958 | 93569 | 97007 | 91501 | 80701 |
| Call errors | 0 | 0 | 0 | 0 | 0 | 0 |
| Prompts with a recalled lesson, all repetitions | 0 | 0 | 284 | 282 | 186 | 360 |

## Primary outcome

wireB minus repair, final pass, positions 61 to 120: -6.1pp [-13.3pp, +0.6pp], bootstrap p = 0.083, n = 60 prompts.

Verdict under the frozen rule: no separation: the interval for Wire B minus repair-only includes zero; no parameter-free wire earns its place on this family either.

## Secondary family (Benjamini-Hochberg, q = 0.05, final pass, positions 61 to 120)

| Comparison | Difference (95% CI) | p | adjusted p | passes |
|---|---|---|---|---|
| wireA minus repair | -7.8pp [-15.6pp, -0.6pp] | 0.033 | 0.078 | no |
| wireC minus repair | -0.6pp [-7.8pp, +6.1pp] | 0.915 | 0.915 | no |
| wireB minus wireA | +1.7pp [-5.6pp, +8.9pp] | 0.654 | 0.785 | no |
| wireC minus wireA | +7.2pp [+0.6pp, +14.4pp] | 0.039 | 0.078 | no |
| wireB minus supplied | -7.8pp [-14.4pp, -1.7pp] | 0.020 | 0.078 | no |
| wireC minus supplied | -2.2pp [-8.9pp, +3.9pp] | 0.524 | 0.785 | no |

## Mechanism outcomes (positions 61 to 120, outside the family)

| Arm | First-attempt pass (95% CI) | First attempt minus repair only | Recovered / first-attempt failures |
|---|---|---|---|
| Base | 40.6% [30.6%, 51.1%] | n/a | n/a |
| Repair only (unwired stack) | 41.7% [31.7%, 52.2%] | reference | 73 / 105 (69.5%) |
| Wire A (E8 template) | 47.2% [35.6%, 58.9%] | +5.6pp [-1.1pp, +12.2pp] | 49 / 95 (51.6%) |
| Wire B (parameter-free) | 43.9% [32.8%, 55.6%] | +2.2pp [-3.3pp, +7.8pp] | 58 / 101 (57.4%) |
| Wire C (parameter-keyed) | 51.7% [41.1%, 62.8%] | +10.0pp [+3.3pp, +16.1pp] | 54 / 87 (62.1%) |
| Supplied rules | 45.0% [34.4%, 55.6%] | +3.3pp [-2.2pp, +8.9pp] | 70 / 99 (70.7%) |

## Descriptive

| Arm | All positions | Positions 61 to 120 |
|---|---|---|
| Base | 40.6% [32.8%, 48.6%] | 40.6% [30.6%, 51.1%] |
| Repair only (unwired stack) | 81.1% [75.6%, 86.4%] | 82.2% [75.0%, 88.3%] |
| Wire A (E8 template) | 76.7% [70.3%, 82.8%] | 74.4% [65.6%, 82.8%] |
| Wire B (parameter-free) | 77.5% [71.1%, 83.6%] | 76.1% [67.2%, 84.4%] |
| Wire C (parameter-keyed) | 80.0% [74.2%, 85.6%] | 81.7% [73.9%, 88.9%] |
| Supplied rules | 83.6% [78.6%, 88.6%] | 83.9% [76.7%, 90.0%] |

Pass rate by class, positions 61 to 120 (pooled over repetitions, 12 prompts per class):

| Class | Base | Repair only (unwired stack) | Wire A (E8 template) | Wire B (parameter-free) | Wire C (parameter-keyed) | Supplied rules |
|---|---|---|---|---|---|---|
| wordcount | 11.1% | 63.9% | 72.2% | 52.8% | 69.4% | 72.2% |
| sentences | 88.9% | 86.1% | 86.1% | 83.3% | 88.9% | 86.1% |
| noletter | 2.8% | 72.2% | 27.8% | 55.6% | 58.3% | 75.0% |
| commas | 44.4% | 91.7% | 88.9% | 94.4% | 94.4% | 88.9% |
| frequency | 55.6% | 97.2% | 97.2% | 94.4% | 97.2% | 97.2% |

Learning curve, pass rate by block of twenty positions (pooled over repetitions):

| Arm | 1-20 | 21-40 | 41-60 | 61-80 | 81-100 | 101-120 |
|---|---|---|---|---|---|---|
| Base | 26.7% | 65.0% | 30.0% | 41.7% | 38.3% | 41.7% |
| Repair only (unwired stack) | 75.0% | 83.3% | 81.7% | 88.3% | 71.7% | 86.7% |
| Wire A (E8 template) | 76.7% | 78.3% | 81.7% | 85.0% | 61.7% | 76.7% |
| Wire B (parameter-free) | 71.7% | 90.0% | 75.0% | 85.0% | 75.0% | 68.3% |
| Wire C (parameter-keyed) | 63.3% | 81.7% | 90.0% | 86.7% | 80.0% | 78.3% |
| Supplied rules | 88.3% | 86.7% | 75.0% | 91.7% | 81.7% | 78.3% |

Same comparisons on positions 1 to 60 and on all positions (descriptive, no inference):

| Comparison | Positions 1 to 60 | All positions |
|---|---|---|
| wireA minus repair | -1.1pp [-7.8pp, +5.6pp] | -4.4pp [-9.2pp, +0.3pp] |
| wireC minus repair | -1.7pp [-7.2pp, +4.4pp] | -1.1pp [-6.1pp, +3.6pp] |
| wireB minus wireA | +0.0pp [-6.7pp, +6.7pp] | +0.8pp [-4.4pp, +6.1pp] |
| wireC minus wireA | -0.6pp [-7.8pp, +6.1pp] | +3.3pp [-1.4pp, +8.1pp] |
| wireB minus supplied | -4.4pp [-10.6pp, +2.2pp] | -6.1pp [-10.8pp, -1.4pp] |
| wireC minus supplied | -5.0pp [-12.2pp, +3.3pp] | -3.6pp [-8.9pp, +1.4pp] |
| wireB minus repair | -1.1pp [-6.1pp, +4.4pp] | -3.6pp [-8.1pp, +0.6pp] |

## Lessons written by the wired arms

Lessons written per repetition, A / B / C: 62/69/61 | 67/69/65 | 61/64/67. Wire C prompts that recalled a lesson, per repetition: 62/61/63. Leakage flags (a lesson containing a topic string or not matching its template): 0.

Wire A (E8 template), repetition 1, final store (5 lessons):

- (e9-noletter) Forbidden letter tasks have failed the check 24 times so far. Latest failure: the response uses the letter "l" 10 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-commas) Comma count tasks have failed the check 10 times so far. Latest failure: the response has 8 commas; the task asked for exactly 5. Satisfy the comma count rule before finishing.
- (e9-wordcount) Word count tasks have failed the check 21 times so far. Latest failure: the response has 29 words; the task asked for exactly 30 words. Satisfy the word count rule before finishing.
- (e9-frequency) Word frequency tasks have failed the check 5 times so far. Latest failure: the word "river" appears 6 times in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-sentences) Sentence count tasks have failed the check 2 times so far. Latest failure: the response has 4 sentences; the task asked for exactly 3. Satisfy the sentence count rule before finishing.

Wire A (E8 template), repetition 2, final store (5 lessons):

- (e9-noletter) Forbidden letter tasks have failed the check 24 times so far. Latest failure: the response uses the letter "l" 15 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-commas) Comma count tasks have failed the check 15 times so far. Latest failure: the response has 10 commas; the task asked for exactly 5. Satisfy the comma count rule before finishing.
- (e9-wordcount) Word count tasks have failed the check 22 times so far. Latest failure: the response has 36 words; the task asked for exactly 30 words. Satisfy the word count rule before finishing.
- (e9-frequency) Word frequency tasks have failed the check 7 times so far. Latest failure: the word "ladder" appears 6 times in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-sentences) Sentence count tasks have failed the check 1 time so far. Latest failure: the response has 8 sentences; the task asked for exactly 6. Satisfy the sentence count rule before finishing.

Wire A (E8 template), repetition 3, final store (5 lessons):

- (e9-noletter) Forbidden letter tasks have failed the check 24 times so far. Latest failure: the response uses the letter "l" 13 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-commas) Comma count tasks have failed the check 11 times so far. Latest failure: the response has 7 commas; the task asked for exactly 5. Satisfy the comma count rule before finishing.
- (e9-wordcount) Word count tasks have failed the check 20 times so far. Latest failure: the response has 31 words; the task asked for exactly 30 words. Satisfy the word count rule before finishing.
- (e9-frequency) Word frequency tasks have failed the check 4 times so far. Latest failure: the word "ladder" appears 4 times in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-sentences) Sentence count tasks have failed the check 2 times so far. Latest failure: the response has 4 sentences; the task asked for exactly 3. Satisfy the sentence count rule before finishing.

Wire B (parameter-free), repetition 1, final store (5 lessons):

- (e9-noletter) Forbidden letter tasks have failed the check 24 times so far: the banned letter appeared 9.3 times on average. Check this task's own forbidden letter requirement before finishing.
- (e9-commas) Comma count tasks have failed the check 14 times so far: the answers ran over by 2.8 commas on average. Check this task's own comma count requirement before finishing.
- (e9-wordcount) Word count tasks have failed the check 23 times so far: the answers ran over by 4.5 words on average. Check this task's own word count requirement before finishing.
- (e9-frequency) Word frequency tasks have failed the check 4 times so far: the answers missed in both directions, by 1.0 occurrences on average. Check this task's own word frequency requirement before finishing.
- (e9-sentences) Sentence count tasks have failed the check 2 times so far: the answers ran over by 1.5 sentences on average. Check this task's own sentence count requirement before finishing.

Wire B (parameter-free), repetition 2, final store (5 lessons):

- (e9-noletter) Forbidden letter tasks have failed the check 24 times so far: the banned letter appeared 9.4 times on average. Check this task's own forbidden letter requirement before finishing.
- (e9-commas) Comma count tasks have failed the check 14 times so far: the answers ran over by 2.5 commas on average. Check this task's own comma count requirement before finishing.
- (e9-wordcount) Word count tasks have failed the check 24 times so far: the answers missed in both directions, by 5.0 words on average. Check this task's own word count requirement before finishing.
- (e9-frequency) Word frequency tasks have failed the check 5 times so far: the answers missed in both directions, by 1.0 occurrences on average. Check this task's own word frequency requirement before finishing.
- (e9-sentences) Sentence count tasks have failed the check 2 times so far: the answers ran over by 1.5 sentences on average. Check this task's own sentence count requirement before finishing.

Wire B (parameter-free), repetition 3, final store (5 lessons):

- (e9-noletter) Forbidden letter tasks have failed the check 23 times so far: the banned letter appeared 9.3 times on average. Check this task's own forbidden letter requirement before finishing.
- (e9-frequency) Word frequency tasks have failed the check 7 times so far: the answers missed in both directions, by 1.1 occurrences on average. Check this task's own word frequency requirement before finishing.
- (e9-commas) Comma count tasks have failed the check 11 times so far: the answers ran over by 2.4 commas on average. Check this task's own comma count requirement before finishing.
- (e9-wordcount) Word count tasks have failed the check 22 times so far: the answers missed in both directions, by 4.6 words on average. Check this task's own word count requirement before finishing.
- (e9-sentences) Sentence count tasks have failed the check 2 times so far: the answers ran over by 2.0 sentences on average. Check this task's own sentence count requirement before finishing.

Wire C (parameter-keyed), repetition 1, final store (23 lessons):

- (e9-noletter-d) Forbidden letter tasks have failed the check 4 times so far. Latest failure: the response uses the letter "d" 1 time; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-frequency-river-5) Word frequency tasks have failed the check 1 time so far. Latest failure: the word "river" appears 6 times in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-commas-n3) Comma count tasks have failed the check 3 times so far. Latest failure: the response has 4 commas; the task asked for exactly 3. Satisfy the comma count rule before finishing.
- (e9-wordcount-N20) Word count tasks have failed the check 3 times so far. Latest failure: the response has 25 words; the task asked for exactly 20 words. Satisfy the word count rule before finishing.
- (e9-noletter-l) Forbidden letter tasks have failed the check 4 times so far. Latest failure: the response uses the letter "l" 7 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-noletter-s) Forbidden letter tasks have failed the check 3 times so far. Latest failure: the response uses the letter "s" 4 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-commas-n1) Comma count tasks have failed the check 2 times so far. Latest failure: the response has 2 commas; the task asked for exactly 1. Satisfy the comma count rule before finishing.
- (e9-commas-n5) Comma count tasks have failed the check 4 times so far. Latest failure: the response has 6 commas; the task asked for exactly 5. Satisfy the comma count rule before finishing.
- (e9-noletter-c) Forbidden letter tasks have failed the check 4 times so far. Latest failure: the response uses the letter "c" 5 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-wordcount-N60) Word count tasks have failed the check 4 times so far. Latest failure: the response has 58 words; the task asked for exactly 60 words. Satisfy the word count rule before finishing.
- (e9-frequency-river-3) Word frequency tasks have failed the check 1 time so far. Latest failure: the word "river" appears 2 times in the response; the task asked for exactly 3. Satisfy the word frequency rule before finishing.
- (e9-wordcount-N75) Word count tasks have failed the check 4 times so far. Latest failure: the response has 74 words; the task asked for exactly 75 words. Satisfy the word count rule before finishing.
- (e9-commas-n4) Comma count tasks have failed the check 3 times so far. Latest failure: the response has 6 commas; the task asked for exactly 4. Satisfy the comma count rule before finishing.
- (e9-noletter-m) Forbidden letter tasks have failed the check 4 times so far. Latest failure: the response uses the letter "m" 1 time; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-wordcount-N40) Word count tasks have failed the check 4 times so far. Latest failure: the response has 42 words; the task asked for exactly 40 words. Satisfy the word count rule before finishing.
- (e9-wordcount-N50) Word count tasks have failed the check 3 times so far. Latest failure: the response has 54 words; the task asked for exactly 50 words. Satisfy the word count rule before finishing.
- (e9-frequency-ladder-3) Word frequency tasks have failed the check 1 time so far. Latest failure: the word "ladder" appears 4 times in the response; the task asked for exactly 3. Satisfy the word frequency rule before finishing.
- (e9-noletter-p) Forbidden letter tasks have failed the check 2 times so far. Latest failure: the response uses the letter "p" 2 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-frequency-ladder-5) Word frequency tasks have failed the check 1 time so far. Latest failure: the word "ladder" appears 6 times in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-commas-n2) Comma count tasks have failed the check 1 time so far. Latest failure: the response has 4 commas; the task asked for exactly 2. Satisfy the comma count rule before finishing.
- (e9-frequency-window-5) Word frequency tasks have failed the check 1 time so far. Latest failure: the word "window" appears 4 times in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-sentences-n6) Sentence count tasks have failed the check 1 time so far. Latest failure: the response has 10 sentences; the task asked for exactly 6. Satisfy the sentence count rule before finishing.
- (e9-wordcount-N30) Word count tasks have failed the check 3 times so far. Latest failure: the response has 29 words; the task asked for exactly 30 words. Satisfy the word count rule before finishing.

Wire C (parameter-keyed), repetition 2, final store (23 lessons):

- (e9-noletter-d) Forbidden letter tasks have failed the check 4 times so far. Latest failure: the response uses the letter "d" 13 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-frequency-river-5) Word frequency tasks have failed the check 2 times so far. Latest failure: the word "river" appears 6 times in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-commas-n3) Comma count tasks have failed the check 1 time so far. Latest failure: the response has 5 commas; the task asked for exactly 3. Satisfy the comma count rule before finishing.
- (e9-wordcount-N20) Word count tasks have failed the check 4 times so far. Latest failure: the response has 26 words; the task asked for exactly 20 words. Satisfy the word count rule before finishing.
- (e9-noletter-l) Forbidden letter tasks have failed the check 4 times so far. Latest failure: the response uses the letter "l" 6 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-noletter-s) Forbidden letter tasks have failed the check 4 times so far. Latest failure: the response uses the letter "s" 3 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-commas-n1) Comma count tasks have failed the check 2 times so far. Latest failure: the response has 3 commas; the task asked for exactly 1. Satisfy the comma count rule before finishing.
- (e9-commas-n5) Comma count tasks have failed the check 4 times so far. Latest failure: the response has 7 commas; the task asked for exactly 5. Satisfy the comma count rule before finishing.
- (e9-noletter-c) Forbidden letter tasks have failed the check 4 times so far. Latest failure: the response uses the letter "c" 7 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-wordcount-N60) Word count tasks have failed the check 4 times so far. Latest failure: the response has 57 words; the task asked for exactly 60 words. Satisfy the word count rule before finishing.
- (e9-wordcount-N75) Word count tasks have failed the check 4 times so far. Latest failure: the response has 80 words; the task asked for exactly 75 words. Satisfy the word count rule before finishing.
- (e9-frequency-ladder-3) Word frequency tasks have failed the check 1 time so far. Latest failure: the word "ladder" appears 4 times in the response; the task asked for exactly 3. Satisfy the word frequency rule before finishing.
- (e9-commas-n4) Comma count tasks have failed the check 4 times so far. Latest failure: the response has 3 commas; the task asked for exactly 4. Satisfy the comma count rule before finishing.
- (e9-noletter-m) Forbidden letter tasks have failed the check 4 times so far. Latest failure: the response uses the letter "m" 1 time; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-wordcount-N40) Word count tasks have failed the check 4 times so far. Latest failure: the response has 42 words; the task asked for exactly 40 words. Satisfy the word count rule before finishing.
- (e9-wordcount-N50) Word count tasks have failed the check 4 times so far. Latest failure: the response has 53 words; the task asked for exactly 50 words. Satisfy the word count rule before finishing.
- (e9-frequency-ladder-5) Word frequency tasks have failed the check 1 time so far. Latest failure: the word "ladder" appears 6 times in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-noletter-p) Forbidden letter tasks have failed the check 3 times so far. Latest failure: the response uses the letter "p" 1 time; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-commas-n2) Comma count tasks have failed the check 1 time so far. Latest failure: the response has 3 commas; the task asked for exactly 2. Satisfy the comma count rule before finishing.
- (e9-frequency-window-5) Word frequency tasks have failed the check 1 time so far. Latest failure: the word "window" appears 4 times in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-frequency-window-3) Word frequency tasks have failed the check 1 time so far. Latest failure: the word "window" appears 4 times in the response; the task asked for exactly 3. Satisfy the word frequency rule before finishing.
- (e9-wordcount-N30) Word count tasks have failed the check 2 times so far. Latest failure: the response has 24 words; the task asked for exactly 30 words. Satisfy the word count rule before finishing.
- (e9-sentences-n6) Sentence count tasks have failed the check 1 time so far. Latest failure: the response has 10 sentences; the task asked for exactly 6. Satisfy the sentence count rule before finishing.

Wire C (parameter-keyed), repetition 3, final store (24 lessons):

- (e9-noletter-d) Forbidden letter tasks have failed the check 4 times so far. Latest failure: the response uses the letter "d" 3 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-frequency-river-5) Word frequency tasks have failed the check 2 times so far. Latest failure: the word "river" appears 4 times in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-commas-n3) Comma count tasks have failed the check 2 times so far. Latest failure: the response has 4 commas; the task asked for exactly 3. Satisfy the comma count rule before finishing.
- (e9-wordcount-N20) Word count tasks have failed the check 4 times so far. Latest failure: the response has 26 words; the task asked for exactly 20 words. Satisfy the word count rule before finishing.
- (e9-noletter-l) Forbidden letter tasks have failed the check 4 times so far. Latest failure: the response uses the letter "l" 8 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-noletter-s) Forbidden letter tasks have failed the check 3 times so far. Latest failure: the response uses the letter "s" 7 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-commas-n1) Comma count tasks have failed the check 2 times so far. Latest failure: the response has 5 commas; the task asked for exactly 1. Satisfy the comma count rule before finishing.
- (e9-commas-n5) Comma count tasks have failed the check 2 times so far. Latest failure: the response has 6 commas; the task asked for exactly 5. Satisfy the comma count rule before finishing.
- (e9-noletter-c) Forbidden letter tasks have failed the check 4 times so far. Latest failure: the response uses the letter "c" 2 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-wordcount-N60) Word count tasks have failed the check 4 times so far. Latest failure: the response has 76 words; the task asked for exactly 60 words. Satisfy the word count rule before finishing.
- (e9-frequency-ladder-3) Word frequency tasks have failed the check 1 time so far. Latest failure: the word "ladder" appears 4 times in the response; the task asked for exactly 3. Satisfy the word frequency rule before finishing.
- (e9-commas-n2) Comma count tasks have failed the check 3 times so far. Latest failure: the response has 4 commas; the task asked for exactly 2. Satisfy the comma count rule before finishing.
- (e9-commas-n4) Comma count tasks have failed the check 4 times so far. Latest failure: the response has 3 commas; the task asked for exactly 4. Satisfy the comma count rule before finishing.
- (e9-noletter-m) Forbidden letter tasks have failed the check 4 times so far. Latest failure: the response uses the letter "m" 4 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-wordcount-N75) Word count tasks have failed the check 3 times so far. Latest failure: the response has 72 words; the task asked for exactly 75 words. Satisfy the word count rule before finishing.
- (e9-wordcount-N40) Word count tasks have failed the check 4 times so far. Latest failure: the response has 47 words; the task asked for exactly 40 words. Satisfy the word count rule before finishing.
- (e9-wordcount-N50) Word count tasks have failed the check 4 times so far. Latest failure: the response has 52 words; the task asked for exactly 50 words. Satisfy the word count rule before finishing.
- (e9-frequency-window-5) Word frequency tasks have failed the check 2 times so far. Latest failure: the word "window" appears 4 times in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-frequency-ladder-5) Word frequency tasks have failed the check 1 time so far. Latest failure: the word "ladder" appears 6 times in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-frequency-river-3) Word frequency tasks have failed the check 1 time so far. Latest failure: the word "river" appears 4 times in the response; the task asked for exactly 3. Satisfy the word frequency rule before finishing.
- (e9-noletter-p) Forbidden letter tasks have failed the check 3 times so far. Latest failure: the response uses the letter "p" 1 time; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-wordcount-N30) Word count tasks have failed the check 4 times so far. Latest failure: the response has 27 words; the task asked for exactly 30 words. Satisfy the word count rule before finishing.
- (e9-sentences-n6) Sentence count tasks have failed the check 1 time so far. Latest failure: the response has 10 sentences; the task asked for exactly 6. Satisfy the sentence count rule before finishing.
- (e9-sentences-n3) Sentence count tasks have failed the check 1 time so far. Latest failure: the response has 4 sentences; the task asked for exactly 3. Satisfy the sentence count rule before finishing.

