# Preregistration addendum 4: an external constraint set across three base families (2026-09-09)

Written before any E5 call. Every research reader of this book has asked for the repair result on a constraint set the authors did not write, with variance measured across generations and on more than one base family. This addendum freezes that test. It does not include grammar-constrained decoding, which needs a serving path the hosted models do not expose; that comparator stays open as E4.

## E5. IFEval slice, three bases, three repetitions

Task set: IFEval (Zhou et al., 2023), the public instruction-following benchmark with verifiable instructions, taken from the reference implementation in google-research/instruction_following_eval (input_data.jsonl, 541 prompts; instructions.py, instructions_registry.py and instructions_util.py as the checkers). A slice of 60 prompts is drawn from the 541 by a seeded shuffle (seed 20260909) before any call; the slice is written to e5-slice.json and is fixed for every arm and base. IFEval is public and may sit in the training data of any base; this is a contamination limit of the design, stated now and in the book.

Pass criterion per prompt: strict prompt-level accuracy in IFEval's sense, every instruction on the prompt satisfied by the reference checker on the raw response.

Bases, through Amazon Bedrock as in the first addendum: Haiku 4.5, Llama 3.1 8B Instruct, Llama 3.3 70B Instruct. Temperature 0.7, maxTokens 1,200 (IFEval responses can be long), no system prompt.

Arms per prompt, base and repetition, budget four generations, first draft shared:

1. One-shot: the prompt plus the kit's first-shot suffix ("Output only the response, nothing else."), one generation.
2. Repair: the kit's loop as implemented in Python for this run, mirroring src/organs/instruction-following/repair.ts at commit 3d20393: continue from the shared first draft; while the check fails and retries remain (at most three), re-prompt with the task, the previous attempt and the specific violation, generate, re-check. The violation text is the reference checker's own description of each unmet instruction, joined.
3. Verifier-selected resampling: three further unguided generations of the same first-shot prompt; the prompt passes if any of the four passes the checker.

Three repetitions of the whole design. Every call logged raw with prompt, response, token usage, base, arm, prompt key and repetition.

Primary outcome: repair minus verifier-selected resampling, pass rate over the 60 prompts, pooled over the three bases and three repetitions by a cluster bootstrap that resamples prompts and carries all their arms, bases and repetitions together (2,000 resamples, seed 12345).

Kill rule: if the pooled interval includes zero, the book states that on an external set the repair loop did not beat verifier-selected resampling at a matched budget, and the repair chapter's claim is confined to what the one-shot comparison and the cost comparison support. If the interval lies below zero, resampling won on the external set, and the book says so.

Secondary, all reported: repair minus one-shot per base (transfer of the mechanism to a set the authors did not write); resampling minus one-shot per base; repair minus resampling per base; the spread of one-shot pass rates across repetitions per base (generation variance); calls used by repair; pass rates by instruction category where a category has at least ten prompts in the slice. Secondary comparisons form one Benjamini-Hochberg family at q = 0.05.

Predictions written now: one-shot pass rates well below the self-authored set's, since IFEval prompts carry several instructions each; repair above one-shot on every base; repair against resampling smaller than on the self-authored set and likely to include zero, because on multi-instruction prompts a re-prompt that names one unmet instruction can break another.

## Reporting

E5 is reported in the evidence appendix beside the other controls, with the frozen verdict, the contamination limit, and the raw-log location. E4 remains open and is named as such.
