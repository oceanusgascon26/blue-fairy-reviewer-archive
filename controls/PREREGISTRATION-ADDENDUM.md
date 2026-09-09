# Preregistration addendum: the controls the record is missing (2026-09-09)

Written before any call is made. This addendum fixes the design, budgets, outcomes, analysis and kill rules for a set of small comparative experiments on the instruction-following repair organ and the durable-learning store. It answers the gaps named by every review of the book so far: no comparison against verifier-selected resampling at a budget fixed in advance, no large base inside the same repair loop, no failure probabilities behind the failing-subset rule, and a durable-learning run whose isolation failed. It does not touch the registered discrimination study (osf.io/dah6v), which stays as frozen.

Owner: Chris Gascon. Prepared by Claude at his direction. Frozen by SHA-256 of this file recorded in the blue-fairy council log with a timestamp; a public commit of this file to the kit repository is offered as the external timestamp and is Chris's decision.

## Common apparatus

- Base models, all through Amazon Bedrock inference profiles in us-east-1 under the account the author authorized: Haiku 4.5 (`us.anthropic.claude-haiku-4-5-20251001-v1:0`), Llama 3.1 8B Instruct (`us.meta.llama3-1-8b-instruct-v1:0`), Llama 3.3 70B Instruct (`us.meta.llama3-3-70b-instruct-v1:0`).
- Generation settings for every arm: temperature 0.7, maxTokens 400, no system prompt. Bedrock exposes no seed, so "repetition" means an independent rerun of the whole arm.
- Task sets: T39, the public kit's 39 constraints with their checkers (`TASKS` in the kit at commit 3d20393); T20, the twenty constraints of the 2026-08-25 comparison (exp-p1.mjs, extracted verbatim as c20.mjs). Both are author-written and in-sample; this addendum does not claim otherwise. An external set is E5, planned separately.
- Repair loop: the kit's `runConstraintRepair` at commit 3d20393, `maxRetries` 3, default first-shot suffix and repair prompt. Total generation budget per item is therefore 4 (one first draft plus at most three repairs).
- Every model call is logged raw: prompt, response text, token usage, arm, item, repetition, timestamp. The generated texts are kept this time.
- Statistics: paired-by-item percentile bootstrap, 2,000 resamples, seed 12345, alpha 0.05, the kit's `pairedDeltaCI`. Where an arm is repeated, each repetition is reported on its own and the pooled estimate is the mean over repetitions with a cluster bootstrap that resamples items and carries all their repetitions together.
- Multiplicity: the primary outcomes below (one per experiment) are tested as stated. All secondary comparisons form one family and receive Benjamini-Hochberg control at q = 0.05. Kill outcomes are reported regardless.

## E1. Failure probabilities behind the failing-subset rule

Question: how often does the bare base fail each item, measured over several draws rather than one?

Design: bare Haiku 4.5, 8 independent draws per item, on T39 and T20. Outcome per item: failure probability p_fail = fails / 8.

Primary outcome: the number of items whose single-draw classification (first draw) disagrees with the majority classification over 8 draws, on T39.

Prediction written now: the redraw pilot suggested about half of single-draw failures pass on redraw; we expect a substantial share of T39's nine historical cold failures to show p_fail below 0.5.

Use: E1's p_fail values become the denominator for headroom in E2 and E3 (expected headroom = mean p_fail), reported beside the single-draw headroom. No number in the book built on single-draw selection is revised in this addendum; the book will report both denominators.

## E2. Repair against verifier-selected resampling at a budget fixed in advance

Question: at an equal, pre-fixed budget of 4 generations per item, does the repair loop beat drawing 4 unguided samples and letting the checker select a passing one?

Design: Haiku 4.5 on T39, 5 repetitions. Per item and repetition: one first draft, shared by both arms. Repair arm: the kit's loop continues from that draft with up to 3 repairs. Resampling arm: 3 further unguided draws of the same prompt; the item passes if the checker passes any of the 4. One-shot arm: the shared first draft alone. The budget is 4 for both arms regardless of how many calls repair actually uses; repair's realized calls are recorded.

Primary outcome: paired delta, repair minus resampling, pass rate over T39, pooled over the 5 repetitions.

Kill rule: if the pooled 95 percent interval includes zero, the book states that repair did not beat verifier-selected resampling at a matched budget on this set, and the repair chapter's survivor status is qualified accordingly. If the interval is entirely below zero, resampling won, and the book says so.

Secondary: repair minus one-shot; resampling minus one-shot; per-item breakdown by constraint class (word count, forbidden letter, JSON, structure); the attempts-to-success distribution.

## E3. The large base inside the same loop

Question: when the larger model gets the same repair loop and the same budget, does the cheap stack still win on reliability, and what does each pass cost?

Design: T39, 3 repetitions. Arms: 8B one-shot; 8B plus repair (budget 4); 70B one-shot; 70B plus repair (budget 4); 70B verifier-selected resampling at budget 4. Tokens metered from Bedrock usage. Cost is computed at the illustrative per-token rates used in the book's cost chapter and labeled illustrative; token counts are the primary record.

Primary outcome: paired delta, 8B plus repair minus 70B plus repair, pass rate over T39, pooled over 3 repetitions.

Kill rule: if 70B plus repair beats 8B plus repair with an interval clear of zero, the cost chapter's "reliability per dollar favours the cheap stack" is restated as a comparison that held only while the larger model lacked the wrapper, and the per-pass cost comparison is reported with the wrapper on both sides.

Secondary: 70B plus repair minus 70B one-shot; 70B plus repair minus 70B resampling; tokens per pass for every arm; the illustrative cost per pass.

If the 24-item held-out set of the 2026-08-25 cost pilot can be recovered from its script, the same five arms run on it as a secondary set. If it cannot, that is recorded and T39 stands alone.

## E4. Grammar-constrained decoding (planned; not run under this addendum's first freeze)

Design to be frozen in a second addendum once the serving path is chosen: an 8B open model served locally on CPU through llama.cpp or on a rented GPU, one GBNF grammar per constraint class that a grammar can express (word counts, forbidden letters, JSON shape, line structure), one generation per item, against the same model with the repair loop at budget 4. Constraints a grammar cannot express are reported as such and excluded from the comparison rather than scored as failures. The book's serving assumption is stated: constrained decoding requires control of the decoder, which a hosted API may not give.

## E5. An external constraint set across base families (planned)

Design to be frozen with E4: a public instruction-following set with its own verifiers (IFEval is the candidate), a stratified subset of fixed size chosen by seed before the run, three base families, three repetitions, the repair loop at budget 4 against one-shot and verifier-selected resampling. Contamination of a public benchmark is acknowledged as a limit.

## E6. Durable learning, rerun with the isolation recorded

Question: on a real base, does a rule derived by code from supplied answers, stored by the public kit's mechanism, and retrieved by a fresh process, change the score on new cipher words, and how does that compare with simply supplying the key in the prompt?

Design: Haiku 4.5. Twenty new plaintext words fixed in this addendum (below), none in the kit's CIPHER_WORDS or in any earlier run. One random letter substitution generated from seed 20260909. Session one, a fresh process with an empty store: each ciphered word is presented cold; the response is scored; the correct plaintext is then supplied as feedback, and a deterministic program derives the letter mapping from the accumulated (cipher, plain) pairs. The mapping is written as one lesson (cue "decode", content the mapping in plain language) through the kit's `DurableLearningOrgan.learn` into a `JsonFileStore`, and saved. Session two, a separate process started after session one has exited: the store is loaded from disk, the organ wraps the base, the same twenty ciphered words are presented, and the complete prompt sent to the model is recorded for every item. Control A, supplied key: a third fresh process with no store, the mapping placed in the prompt directly. Control B, cold repeat: a fourth fresh process, no store, no key. Three repetitions of the whole sequence.

Scoring, two graders reported separately for every arm: contains-word (the historical rule, normalized) and exact (the normalized whole response equals the word).

Primary outcome: warm minus cold, contains-word, paired by item, pooled over repetitions.

Kill and interpretation rules: if warm is not above cold, persistence through the public mechanism did not change behaviour on a real base, and the book says so. Warm is expected to approach the supplied-key control; the difference between them measures what retrieval loses, and is reported. The exact grader is expected to run well below contains-word; the gap is the answer-format cost the book already describes, and it is reported. This experiment tests persistence and use of a supplied rule; it does not test discovery, and the book will not call it learning.

Words: harvest, pillow, canyon, whisper, timber, saddle, velvet, ember, quartz, ribbon, falcon, marble, pepper, tunnel, anchor, glacier, basket, copper, violin, oyster.

## E7. Reporting

Every experiment is reported in the evidence appendix with its arms, budgets, n, repetitions, point estimates, intervals, the raw-log location and the kill rule's verdict, in the book's voice and register. Negative and null results appear at the same size as positive ones. No result is pooled with any earlier run. The panel is rerun on the rebuilt book afterwards as a regression check on the lay readers, not as a target.

## Deviations

Any departure from this addendum after the first call is made is logged with its reason before the affected result is reported, in the manner of the 2026-08-21 amendment to the main protocol.
