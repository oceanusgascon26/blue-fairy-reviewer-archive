# E9 readout: the lesson-design follow-up to E8 (SMOKE TEST, scripted fake base, NOT DATA)

Protocol: PREREGISTRATION-E9.md, frozen by the hashes in FREEZE-E9.txt and registered publicly on OSF before any call (REGISTRATION-E9.txt). Model mock, temperature 0.7, maxTokens 400, budget 4 generations, 3 repetitions of one fixed 120-prompt sequence. Raw call logs in raw/, stores in stores/. Task list sha256 28af8f73be9e1097.

## Pass rates by repetition

| Repetition | Base | Repair only (unwired stack) | Wire A (E8 template) | Wire B (parameter-free) | Wire C (parameter-keyed) | Supplied rules |
|---|---|---|---|---|---|---|
| 1, all positions | 12.5% | 27.5% | 28.3% | 30.0% | 28.3% | 27.5% |
| 1, positions 61 to 120 | 10.0% | 28.3% | 33.3% | 26.7% | 23.3% | 30.0% |
| 1, first attempts, positions 61 to 120 | 10.0% | 15.0% | 15.0% | 16.7% | 16.7% | 20.0% |
| 2, all positions | 19.2% | 32.5% | 25.8% | 30.0% | 29.2% | 30.8% |
| 2, positions 61 to 120 | 18.3% | 31.7% | 25.0% | 31.7% | 28.3% | 25.0% |
| 2, first attempts, positions 61 to 120 | 18.3% | 13.3% | 16.7% | 13.3% | 16.7% | 20.0% |
| 3, all positions | 16.7% | 31.7% | 27.5% | 25.8% | 29.2% | 30.0% |
| 3, positions 61 to 120 | 16.7% | 33.3% | 26.7% | 20.0% | 30.0% | 26.7% |
| 3, first attempts, positions 61 to 120 | 16.7% | 21.7% | 11.7% | 13.3% | 15.0% | 23.3% |

| Mean calls per task | 1.00 | 3.35 | 3.43 | 3.35 | 3.36 | 3.33 |
|---|---|---|---|---|---|---|
| Calls, all repetitions | 360 | 1207 | 1236 | 1206 | 1210 | 1199 |
| Input tokens | 0 | 0 | 0 | 0 | 0 | 0 |
| Output tokens | 0 | 0 | 0 | 0 | 0 | 0 |
| Call errors | 0 | 0 | 0 | 0 | 0 | 0 |
| Prompts with a recalled lesson, all repetitions | 0 | 0 | 341 | 343 | 241 | 360 |

## Primary outcome

wireB minus repair, final pass, positions 61 to 120: -5.0pp [-10.6pp, -0.0pp], bootstrap p = 0.044, n = 60 prompts.

Verdict under the frozen rule: the parameter-free wire (Wire B) lost to the unwired stack: injection itself costs.

## Secondary family (Benjamini-Hochberg, q = 0.05, final pass, positions 61 to 120)

| Comparison | Difference (95% CI) | p | adjusted p | passes |
|---|---|---|---|---|
| wireA minus repair | -2.8pp [-6.7pp, +0.6pp] | 0.108 | 0.609 | no |
| wireC minus repair | -3.9pp [-10.0pp, +1.7pp] | 0.203 | 0.609 | no |
| wireB minus wireA | -2.2pp [-8.3pp, +2.8pp] | 0.470 | 0.900 | no |
| wireC minus wireA | -1.1pp [-6.7pp, +3.9pp] | 0.750 | 0.900 | no |
| wireB minus supplied | -1.1pp [-7.2pp, +4.4pp] | 0.707 | 0.900 | no |
| wireC minus supplied | +0.0pp [-6.7pp, +6.1pp] | 1.000 | 1.000 | no |

## Mechanism outcomes (positions 61 to 120, outside the family)

| Arm | First-attempt pass (95% CI) | First attempt minus repair only | Recovered / first-attempt failures |
|---|---|---|---|
| Base | 15.0% [7.8%, 22.8%] | n/a | n/a |
| Repair only (unwired stack) | 16.7% [8.9%, 25.0%] | reference | 26 / 150 (17.3%) |
| Wire A (E8 template) | 14.4% [7.8%, 21.1%] | -2.2pp [-6.7pp, +1.7pp] | 25 / 154 (16.2%) |
| Wire B (parameter-free) | 14.4% [7.2%, 22.2%] | -2.2pp [-8.9pp, +3.9pp] | 21 / 154 (13.6%) |
| Wire C (parameter-keyed) | 16.1% [8.9%, 23.9%] | -0.6pp [-7.2pp, +6.1pp] | 20 / 151 (13.2%) |
| Supplied rules | 21.1% [12.8%, 30.0%] | +4.4pp [-1.1pp, +10.0pp] | 11 / 142 (7.7%) |

## Descriptive

| Arm | All positions | Positions 61 to 120 |
|---|---|---|
| Base | 16.1% [11.7%, 21.4%] | 15.0% [7.8%, 22.8%] |
| Repair only (unwired stack) | 30.6% [23.1%, 37.8%] | 31.1% [20.0%, 41.7%] |
| Wire A (E8 template) | 27.2% [20.3%, 34.2%] | 28.3% [17.8%, 38.3%] |
| Wire B (parameter-free) | 28.6% [21.4%, 36.1%] | 26.1% [16.1%, 36.7%] |
| Wire C (parameter-keyed) | 28.9% [21.9%, 36.4%] | 27.2% [17.2%, 37.8%] |
| Supplied rules | 29.4% [21.9%, 37.2%] | 27.2% [17.8%, 37.8%] |

Pass rate by class, positions 61 to 120 (pooled over repetitions, 12 prompts per class):

| Class | Base | Repair only (unwired stack) | Wire A (E8 template) | Wire B (parameter-free) | Wire C (parameter-keyed) | Supplied rules |
|---|---|---|---|---|---|---|
| wordcount | 0.0% | 8.3% | 8.3% | 0.0% | 0.0% | 8.3% |
| sentences | 2.8% | 5.6% | 5.6% | 5.6% | 2.8% | 8.3% |
| noletter | 44.4% | 83.3% | 77.8% | 80.6% | 83.3% | 83.3% |
| commas | 25.0% | 41.7% | 36.1% | 30.6% | 33.3% | 30.6% |
| frequency | 2.8% | 16.7% | 13.9% | 13.9% | 16.7% | 5.6% |

Learning curve, pass rate by block of twenty positions (pooled over repetitions):

| Arm | 1-20 | 21-40 | 41-60 | 61-80 | 81-100 | 101-120 |
|---|---|---|---|---|---|---|
| Base | 13.3% | 13.3% | 25.0% | 18.3% | 13.3% | 13.3% |
| Repair only (unwired stack) | 28.3% | 21.7% | 40.0% | 33.3% | 33.3% | 26.7% |
| Wire A (E8 template) | 31.7% | 13.3% | 33.3% | 28.3% | 28.3% | 28.3% |
| Wire B (parameter-free) | 36.7% | 18.3% | 38.3% | 26.7% | 31.7% | 20.0% |
| Wire C (parameter-keyed) | 35.0% | 21.7% | 35.0% | 31.7% | 28.3% | 21.7% |
| Supplied rules | 40.0% | 18.3% | 36.7% | 28.3% | 30.0% | 23.3% |

Same comparisons on positions 1 to 60 and on all positions (descriptive, no inference):

| Comparison | Positions 1 to 60 | All positions |
|---|---|---|
| wireA minus repair | -3.9pp [-9.4pp, +1.1pp] | -3.3pp [-6.7pp, -0.0pp] |
| wireC minus repair | +0.6pp [-4.4pp, +6.1pp] | -1.7pp [-5.6pp, +2.5pp] |
| wireB minus wireA | +5.0pp [+0.6pp, +10.6pp] | +1.4pp [-2.2pp, +5.3pp] |
| wireC minus wireA | +4.4pp [-1.1pp, +11.1pp] | +1.7pp [-2.5pp, +6.1pp] |
| wireB minus supplied | -0.6pp [-7.2pp, +5.6pp] | -0.8pp [-5.0pp, +3.1pp] |
| wireC minus supplied | -1.1pp [-6.1pp, +3.9pp] | -0.6pp [-4.7pp, +3.6pp] |
| wireB minus repair | +1.1pp [-4.4pp, +6.1pp] | -1.9pp [-5.8pp, +1.7pp] |

## Lessons written by the wired arms

Lessons written per repetition, A / B / C: 100/106/107 | 100/103/99 | 102/99/103. Wire C prompts that recalled a lesson, per repetition: 83/77/81. Leakage flags (a lesson containing a topic string or not matching its template): 0.

Wire A (E8 template), repetition 1, final store (5 lessons):

- (e9-noletter) Forbidden letter tasks have failed the check 12 times so far. Latest failure: the response uses the letter "m" 2 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-frequency) Word frequency tasks have failed the check 22 times so far. Latest failure: the word "ladder" appears 0 times in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-commas) Comma count tasks have failed the check 20 times so far. Latest failure: the response has 0 commas; the task asked for exactly 5. Satisfy the comma count rule before finishing.
- (e9-wordcount) Word count tasks have failed the check 22 times so far. Latest failure: the response has 17 words; the task asked for exactly 30 words. Satisfy the word count rule before finishing.
- (e9-sentences) Sentence count tasks have failed the check 24 times so far. Latest failure: the response has 1 sentences; the task asked for exactly 4. Satisfy the sentence count rule before finishing.

Wire A (E8 template), repetition 2, final store (5 lessons):

- (e9-noletter) Forbidden letter tasks have failed the check 15 times so far. Latest failure: the response uses the letter "l" 3 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-frequency) Word frequency tasks have failed the check 24 times so far. Latest failure: the word "ladder" appears 0 times in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-commas) Comma count tasks have failed the check 20 times so far. Latest failure: the response has 0 commas; the task asked for exactly 5. Satisfy the comma count rule before finishing.
- (e9-wordcount) Word count tasks have failed the check 23 times so far. Latest failure: the response has 34 words; the task asked for exactly 30 words. Satisfy the word count rule before finishing.
- (e9-sentences) Sentence count tasks have failed the check 24 times so far. Latest failure: the response has 1 sentences; the task asked for exactly 4. Satisfy the sentence count rule before finishing.

Wire A (E8 template), repetition 3, final store (5 lessons):

- (e9-frequency) Word frequency tasks have failed the check 23 times so far. Latest failure: the word "ladder" appears 0 times in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-commas) Comma count tasks have failed the check 21 times so far. Latest failure: the response has 0 commas; the task asked for exactly 5. Satisfy the comma count rule before finishing.
- (e9-wordcount) Word count tasks have failed the check 23 times so far. Latest failure: the response has 20 words; the task asked for exactly 30 words. Satisfy the word count rule before finishing.
- (e9-noletter) Forbidden letter tasks have failed the check 16 times so far. Latest failure: the response uses the letter "l" 3 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-sentences) Sentence count tasks have failed the check 24 times so far. Latest failure: the response has 1 sentences; the task asked for exactly 4. Satisfy the sentence count rule before finishing.

Wire B (parameter-free), repetition 1, final store (5 lessons):

- (e9-noletter) Forbidden letter tasks have failed the check 13 times so far: the banned letter appeared 3.8 times on average. Check this task's own forbidden letter requirement before finishing.
- (e9-frequency) Word frequency tasks have failed the check 22 times so far: the answers fell short by 3.8 occurrences on average. Check this task's own word frequency requirement before finishing.
- (e9-commas) Comma count tasks have failed the check 19 times so far: the answers missed in both directions, by 2.8 commas on average. Check this task's own comma count requirement before finishing.
- (e9-wordcount) Word count tasks have failed the check 23 times so far: the answers fell short by 34.0 words on average. Check this task's own word count requirement before finishing.
- (e9-sentences) Sentence count tasks have failed the check 23 times so far: the answers fell short by 4.0 sentences on average. Check this task's own sentence count requirement before finishing.

Wire B (parameter-free), repetition 2, final store (5 lessons):

- (e9-noletter) Forbidden letter tasks have failed the check 15 times so far: the banned letter appeared 4.3 times on average. Check this task's own forbidden letter requirement before finishing.
- (e9-frequency) Word frequency tasks have failed the check 22 times so far: the answers fell short by 3.8 occurrences on average. Check this task's own word frequency requirement before finishing.
- (e9-commas) Comma count tasks have failed the check 18 times so far: the answers missed in both directions, by 2.6 commas on average. Check this task's own comma count requirement before finishing.
- (e9-wordcount) Word count tasks have failed the check 24 times so far: the answers missed in both directions, by 30.7 words on average. Check this task's own word count requirement before finishing.
- (e9-sentences) Sentence count tasks have failed the check 24 times so far: the answers missed in both directions, by 4.2 sentences on average. Check this task's own sentence count requirement before finishing.

Wire B (parameter-free), repetition 3, final store (5 lessons):

- (e9-frequency) Word frequency tasks have failed the check 23 times so far: the answers fell short by 3.8 occurrences on average. Check this task's own word frequency requirement before finishing.
- (e9-commas) Comma count tasks have failed the check 19 times so far: the answers fell short by 2.9 commas on average. Check this task's own comma count requirement before finishing.
- (e9-wordcount) Word count tasks have failed the check 23 times so far: the answers fell short by 29.6 words on average. Check this task's own word count requirement before finishing.
- (e9-noletter) Forbidden letter tasks have failed the check 11 times so far: the banned letter appeared 3.7 times on average. Check this task's own forbidden letter requirement before finishing.
- (e9-sentences) Sentence count tasks have failed the check 23 times so far: the answers missed in both directions, by 3.8 sentences on average. Check this task's own sentence count requirement before finishing.

Wire C (parameter-keyed), repetition 1, final store (30 lessons):

- (e9-frequency-river-5) Word frequency tasks have failed the check 4 times so far. Latest failure: the word "river" appears 0 times in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-commas-n3) Comma count tasks have failed the check 4 times so far. Latest failure: the response has 0 commas; the task asked for exactly 3. Satisfy the comma count rule before finishing.
- (e9-wordcount-N20) Word count tasks have failed the check 4 times so far. Latest failure: the response has 16 words; the task asked for exactly 20 words. Satisfy the word count rule before finishing.
- (e9-noletter-l) Forbidden letter tasks have failed the check 2 times so far. Latest failure: the response uses the letter "l" 2 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-noletter-s) Forbidden letter tasks have failed the check 4 times so far. Latest failure: the response uses the letter "s" 1 time; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-commas-n1) Comma count tasks have failed the check 4 times so far. Latest failure: the response has 0 commas; the task asked for exactly 1. Satisfy the comma count rule before finishing.
- (e9-commas-n5) Comma count tasks have failed the check 4 times so far. Latest failure: the response has 0 commas; the task asked for exactly 5. Satisfy the comma count rule before finishing.
- (e9-noletter-c) Forbidden letter tasks have failed the check 2 times so far. Latest failure: the response uses the letter "c" 2 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-wordcount-N60) Word count tasks have failed the check 4 times so far. Latest failure: the response has 16 words; the task asked for exactly 60 words. Satisfy the word count rule before finishing.
- (e9-frequency-river-3) Word frequency tasks have failed the check 1 time so far. Latest failure: the word "river" appears 0 times in the response; the task asked for exactly 3. Satisfy the word frequency rule before finishing.
- (e9-frequency-ladder-3) Word frequency tasks have failed the check 4 times so far. Latest failure: the word "ladder" appears 0 times in the response; the task asked for exactly 3. Satisfy the word frequency rule before finishing.
- (e9-commas-n2) Comma count tasks have failed the check 4 times so far. Latest failure: the response has 0 commas; the task asked for exactly 2. Satisfy the comma count rule before finishing.
- (e9-sentences-n8) Sentence count tasks have failed the check 4 times so far. Latest failure: the response has 1 sentences; the task asked for exactly 8. Satisfy the sentence count rule before finishing.
- (e9-wordcount-N75) Word count tasks have failed the check 4 times so far. Latest failure: the response has 20 words; the task asked for exactly 75 words. Satisfy the word count rule before finishing.
- (e9-sentences-n7) Sentence count tasks have failed the check 4 times so far. Latest failure: the response has 1 sentences; the task asked for exactly 7. Satisfy the sentence count rule before finishing.
- (e9-commas-n4) Comma count tasks have failed the check 4 times so far. Latest failure: the response has 0 commas; the task asked for exactly 4. Satisfy the comma count rule before finishing.
- (e9-sentences-n3) Sentence count tasks have failed the check 4 times so far. Latest failure: the response has 1 sentences; the task asked for exactly 3. Satisfy the sentence count rule before finishing.
- (e9-sentences-n6) Sentence count tasks have failed the check 4 times so far. Latest failure: the response has 2 sentences; the task asked for exactly 6. Satisfy the sentence count rule before finishing.
- (e9-noletter-m) Forbidden letter tasks have failed the check 2 times so far. Latest failure: the response uses the letter "m" 2 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-sentences-n5) Sentence count tasks have failed the check 4 times so far. Latest failure: the response has 6 sentences; the task asked for exactly 5. Satisfy the sentence count rule before finishing.
- (e9-sentences-n4) Sentence count tasks have failed the check 4 times so far. Latest failure: the response has 1 sentences; the task asked for exactly 4. Satisfy the sentence count rule before finishing.
- (e9-wordcount-N40) Word count tasks have failed the check 4 times so far. Latest failure: the response has 3 words; the task asked for exactly 40 words. Satisfy the word count rule before finishing.
- (e9-wordcount-N50) Word count tasks have failed the check 4 times so far. Latest failure: the response has 17 words; the task asked for exactly 50 words. Satisfy the word count rule before finishing.
- (e9-frequency-window-3) Word frequency tasks have failed the check 4 times so far. Latest failure: the word "window" appears 0 times in the response; the task asked for exactly 3. Satisfy the word frequency rule before finishing.
- (e9-frequency-window-5) Word frequency tasks have failed the check 4 times so far. Latest failure: the word "window" appears 1 time in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-frequency-ladder-5) Word frequency tasks have failed the check 4 times so far. Latest failure: the word "ladder" appears 0 times in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-noletter-p) Forbidden letter tasks have failed the check 1 time so far. Latest failure: the response uses the letter "p" 2 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-wordcount-N30) Word count tasks have failed the check 4 times so far. Latest failure: the response has 34 words; the task asked for exactly 30 words. Satisfy the word count rule before finishing.
- (e9-commas-n0) Comma count tasks have failed the check 1 time so far. Latest failure: the response has 2 commas; the task asked for exactly 0. Satisfy the comma count rule before finishing.
- (e9-noletter-d) Forbidden letter tasks have failed the check 1 time so far. Latest failure: the response uses the letter "d" 6 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.

Wire C (parameter-keyed), repetition 2, final store (29 lessons):

- (e9-frequency-river-5) Word frequency tasks have failed the check 4 times so far. Latest failure: the word "river" appears 0 times in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-commas-n3) Comma count tasks have failed the check 4 times so far. Latest failure: the response has 0 commas; the task asked for exactly 3. Satisfy the comma count rule before finishing.
- (e9-wordcount-N20) Word count tasks have failed the check 4 times so far. Latest failure: the response has 3 words; the task asked for exactly 20 words. Satisfy the word count rule before finishing.
- (e9-noletter-s) Forbidden letter tasks have failed the check 3 times so far. Latest failure: the response uses the letter "s" 5 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-commas-n1) Comma count tasks have failed the check 4 times so far. Latest failure: the response has 0 commas; the task asked for exactly 1. Satisfy the comma count rule before finishing.
- (e9-commas-n5) Comma count tasks have failed the check 4 times so far. Latest failure: the response has 0 commas; the task asked for exactly 5. Satisfy the comma count rule before finishing.
- (e9-noletter-c) Forbidden letter tasks have failed the check 2 times so far. Latest failure: the response uses the letter "c" 2 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-wordcount-N60) Word count tasks have failed the check 4 times so far. Latest failure: the response has 20 words; the task asked for exactly 60 words. Satisfy the word count rule before finishing.
- (e9-frequency-river-3) Word frequency tasks have failed the check 4 times so far. Latest failure: the word "river" appears 1 time in the response; the task asked for exactly 3. Satisfy the word frequency rule before finishing.
- (e9-frequency-ladder-3) Word frequency tasks have failed the check 4 times so far. Latest failure: the word "ladder" appears 0 times in the response; the task asked for exactly 3. Satisfy the word frequency rule before finishing.
- (e9-sentences-n8) Sentence count tasks have failed the check 4 times so far. Latest failure: the response has 2 sentences; the task asked for exactly 8. Satisfy the sentence count rule before finishing.
- (e9-wordcount-N75) Word count tasks have failed the check 4 times so far. Latest failure: the response has 3 words; the task asked for exactly 75 words. Satisfy the word count rule before finishing.
- (e9-sentences-n7) Sentence count tasks have failed the check 4 times so far. Latest failure: the response has 1 sentences; the task asked for exactly 7. Satisfy the sentence count rule before finishing.
- (e9-commas-n4) Comma count tasks have failed the check 4 times so far. Latest failure: the response has 0 commas; the task asked for exactly 4. Satisfy the comma count rule before finishing.
- (e9-sentences-n3) Sentence count tasks have failed the check 4 times so far. Latest failure: the response has 1 sentences; the task asked for exactly 3. Satisfy the sentence count rule before finishing.
- (e9-sentences-n5) Sentence count tasks have failed the check 4 times so far. Latest failure: the response has 1 sentences; the task asked for exactly 5. Satisfy the sentence count rule before finishing.
- (e9-sentences-n4) Sentence count tasks have failed the check 4 times so far. Latest failure: the response has 6 sentences; the task asked for exactly 4. Satisfy the sentence count rule before finishing.
- (e9-wordcount-N40) Word count tasks have failed the check 4 times so far. Latest failure: the response has 34 words; the task asked for exactly 40 words. Satisfy the word count rule before finishing.
- (e9-wordcount-N50) Word count tasks have failed the check 4 times so far. Latest failure: the response has 34 words; the task asked for exactly 50 words. Satisfy the word count rule before finishing.
- (e9-frequency-window-5) Word frequency tasks have failed the check 4 times so far. Latest failure: the word "window" appears 1 time in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-noletter-p) Forbidden letter tasks have failed the check 2 times so far. Latest failure: the response uses the letter "p" 3 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-frequency-ladder-5) Word frequency tasks have failed the check 4 times so far. Latest failure: the word "ladder" appears 1 time in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-noletter-m) Forbidden letter tasks have failed the check 3 times so far. Latest failure: the response uses the letter "m" 5 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-frequency-window-3) Word frequency tasks have failed the check 3 times so far. Latest failure: the word "window" appears 1 time in the response; the task asked for exactly 3. Satisfy the word frequency rule before finishing.
- (e9-commas-n2) Comma count tasks have failed the check 2 times so far. Latest failure: the response has 0 commas; the task asked for exactly 2. Satisfy the comma count rule before finishing.
- (e9-wordcount-N30) Word count tasks have failed the check 4 times so far. Latest failure: the response has 3 words; the task asked for exactly 30 words. Satisfy the word count rule before finishing.
- (e9-sentences-n6) Sentence count tasks have failed the check 2 times so far. Latest failure: the response has 1 sentences; the task asked for exactly 6. Satisfy the sentence count rule before finishing.
- (e9-noletter-d) Forbidden letter tasks have failed the check 1 time so far. Latest failure: the response uses the letter "d" 4 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-noletter-l) Forbidden letter tasks have failed the check 1 time so far. Latest failure: the response uses the letter "l" 3 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.

Wire C (parameter-keyed), repetition 3, final store (29 lessons):

- (e9-frequency-river-5) Word frequency tasks have failed the check 4 times so far. Latest failure: the word "river" appears 0 times in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-commas-n3) Comma count tasks have failed the check 4 times so far. Latest failure: the response has 0 commas; the task asked for exactly 3. Satisfy the comma count rule before finishing.
- (e9-wordcount-N20) Word count tasks have failed the check 4 times so far. Latest failure: the response has 34 words; the task asked for exactly 20 words. Satisfy the word count rule before finishing.
- (e9-noletter-l) Forbidden letter tasks have failed the check 3 times so far. Latest failure: the response uses the letter "l" 2 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-noletter-s) Forbidden letter tasks have failed the check 4 times so far. Latest failure: the response uses the letter "s" 5 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-commas-n1) Comma count tasks have failed the check 4 times so far. Latest failure: the response has 0 commas; the task asked for exactly 1. Satisfy the comma count rule before finishing.
- (e9-commas-n5) Comma count tasks have failed the check 4 times so far. Latest failure: the response has 0 commas; the task asked for exactly 5. Satisfy the comma count rule before finishing.
- (e9-wordcount-N60) Word count tasks have failed the check 4 times so far. Latest failure: the response has 8 words; the task asked for exactly 60 words. Satisfy the word count rule before finishing.
- (e9-frequency-river-3) Word frequency tasks have failed the check 4 times so far. Latest failure: the word "river" appears 1 time in the response; the task asked for exactly 3. Satisfy the word frequency rule before finishing.
- (e9-frequency-ladder-3) Word frequency tasks have failed the check 4 times so far. Latest failure: the word "ladder" appears 0 times in the response; the task asked for exactly 3. Satisfy the word frequency rule before finishing.
- (e9-sentences-n8) Sentence count tasks have failed the check 4 times so far. Latest failure: the response has 1 sentences; the task asked for exactly 8. Satisfy the sentence count rule before finishing.
- (e9-wordcount-N75) Word count tasks have failed the check 4 times so far. Latest failure: the response has 3 words; the task asked for exactly 75 words. Satisfy the word count rule before finishing.
- (e9-sentences-n7) Sentence count tasks have failed the check 4 times so far. Latest failure: the response has 1 sentences; the task asked for exactly 7. Satisfy the sentence count rule before finishing.
- (e9-commas-n4) Comma count tasks have failed the check 4 times so far. Latest failure: the response has 0 commas; the task asked for exactly 4. Satisfy the comma count rule before finishing.
- (e9-sentences-n3) Sentence count tasks have failed the check 4 times so far. Latest failure: the response has 6 sentences; the task asked for exactly 3. Satisfy the sentence count rule before finishing.
- (e9-sentences-n6) Sentence count tasks have failed the check 4 times so far. Latest failure: the response has 2 sentences; the task asked for exactly 6. Satisfy the sentence count rule before finishing.
- (e9-sentences-n5) Sentence count tasks have failed the check 4 times so far. Latest failure: the response has 6 sentences; the task asked for exactly 5. Satisfy the sentence count rule before finishing.
- (e9-sentences-n4) Sentence count tasks have failed the check 4 times so far. Latest failure: the response has 2 sentences; the task asked for exactly 4. Satisfy the sentence count rule before finishing.
- (e9-wordcount-N40) Word count tasks have failed the check 4 times so far. Latest failure: the response has 16 words; the task asked for exactly 40 words. Satisfy the word count rule before finishing.
- (e9-wordcount-N50) Word count tasks have failed the check 4 times so far. Latest failure: the response has 17 words; the task asked for exactly 50 words. Satisfy the word count rule before finishing.
- (e9-frequency-window-3) Word frequency tasks have failed the check 4 times so far. Latest failure: the word "window" appears 1 time in the response; the task asked for exactly 3. Satisfy the word frequency rule before finishing.
- (e9-frequency-window-5) Word frequency tasks have failed the check 4 times so far. Latest failure: the word "window" appears 1 time in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-noletter-p) Forbidden letter tasks have failed the check 1 time so far. Latest failure: the response uses the letter "p" 2 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-frequency-ladder-5) Word frequency tasks have failed the check 4 times so far. Latest failure: the word "ladder" appears 0 times in the response; the task asked for exactly 5. Satisfy the word frequency rule before finishing.
- (e9-noletter-c) Forbidden letter tasks have failed the check 2 times so far. Latest failure: the response uses the letter "c" 1 time; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-commas-n2) Comma count tasks have failed the check 2 times so far. Latest failure: the response has 0 commas; the task asked for exactly 2. Satisfy the comma count rule before finishing.
- (e9-wordcount-N30) Word count tasks have failed the check 4 times so far. Latest failure: the response has 20 words; the task asked for exactly 30 words. Satisfy the word count rule before finishing.
- (e9-noletter-d) Forbidden letter tasks have failed the check 2 times so far. Latest failure: the response uses the letter "d" 4 times; the task forbade that letter entirely. Satisfy the forbidden letter rule before finishing.
- (e9-commas-n0) Comma count tasks have failed the check 1 time so far. Latest failure: the response has 2 commas; the task asked for exactly 0. Satisfy the comma count rule before finishing.

