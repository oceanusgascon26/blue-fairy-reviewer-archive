# E8, the machine-checked composition pilot: plan draft for Chris's approval (2026-09-09; NOT frozen, NOT registered)

The question the research and executive readers of the book keep asking: does wiring organs together buy anything the same organs unwired do not, against a conventional baseline given the same budget? The registered report (osf.io/dah6v) asks that with human raters and is unfunded. This pilot asks the cheapest machine-checkable version of it, on Bedrock, for under a hundred dollars, under a public OSF preregistration this time.

## What "integrated" means here

Today the two organs stack without talking. The memory organ injects a stored lesson ahead of the prompt when the lesson's cue appears in it; the repair loop retries on a checker failure; nothing the repair loop learns reaches the store. E6c showed the stack delivering what neither organ alone delivered on the cipher task, but the lesson in that store was written by hand. Integration in this pilot is one specific wire. When the repair loop's first attempt fails a checker, it writes a lesson to the store. The cue is a fixed keyword for that constraint class. The content is the checker's violation message and the rule, with no response text. The memory organ recalls the lesson on later tasks of the same class. A rule the model broke once becomes a standing instruction next time. That is the smallest version of organs composing on one being that a machine can check.

## Arms

Six arms. All use Haiku 4.5 through Bedrock, temperature 0.7, maxTokens 400, a ceiling of four generations per task, each arm and repetition in a fresh process.

1. Base. One generation per task.
2. Repair only. The E6c stack (repair loop around the memory-wrapped base) with an empty store that nothing writes to. Both organs are present and unwired; the memory organ never fires. This is what the kit does today.
3. Integrated. The same stack with the wire. The store starts empty in every repetition and fills only from the repair loop's own failures.
4. Supplied rules. The same stack with a store pre-loaded by hand with one rule per constraint class before the run and nothing written during it. The analogue of E6's supplied-key control: the ceiling the wire is trying to reach.
5. Monolithic prompt. The bare base with a fixed system prompt that states all eight rules up front, one generation per task. The prompt-engineering answer.
6. Monolithic resampling. Arm 5 with verifier-selected best-of-four, the same budget as the repair loop.

The system prompt for arms 5 and 6 and the hand-written rules for arm 4 are written and frozen before any call. If Chris can arrange for someone other than the assistant that wrote the organ code to write them, better; otherwise the assistant writes them and the plan says so.

## Tasks

A sequence, not a set. 120 machine-checkable prompts in eight constraint classes: word count, sentence count, forbidden letter, comma count, casing, bullet lines, ending phrase, word frequency. Fifteen per class, generated from templates over fresh topics, written for this pilot and not reused from T39, T20 or IFEval. A seeded shuffle orders them so every class recurs across the sequence. Integration can only pay off when a rule recurs; the sequence is what makes the comparison fair to it. Every prompt of a class contains that class's cue word by construction of its template, so recall is decided by the cue and not by topic. Three repetitions of the whole sequence, each with a fresh shuffle from a seed fixed in the plan.

## Outcomes

Primary: integrated minus repair only, pass rate over positions 61 to 120 of the sequence, after the store has met every class several times. Paired by prompt and pooled over repetitions by a cluster bootstrap that resamples prompts and carries their repetitions together (2,000 resamples, seed 12345, alpha 0.05). Kill rule: an interval that includes zero means the wire bought nothing measurable on this task family, and the book's next edition says so.

Secondary, all reported, one Benjamini-Hochberg family at q = 0.05:

- Integrated minus supplied rules, how much of the ceiling the wire recovers.
- Each organ arm minus each monolithic arm.
- Pass rate by class.
- Pass rate by position in blocks of twenty for the integrated and repair-only arms, the learning curve.
- Calls and tokens per arm.
- The count and full text of every lesson written, and a check that no lesson contains any response text or topic word.

Predictions written now. Integrated above repair only on the classes whose violation message names a fixable rule (counts, commas, casing, ending phrase), and level with it on forbidden letters. Supplied rules at or above integrated. The monolithic prompt close to supplied rules on first-pass rate, since it is handed every rule too. Resampling near the repair loop, as in E2 and E5. If repair only is already near the ceiling on the second half, the family is too easy and the run says so.

## Registration

A new public OSF project with this plan as an OSF Preregistration, not embargoed, created before any call, with the code, the task generator, the frozen system prompt and hand-written rules, and the seeds listed. The raw records and results go to the same project and to the reviewer archive afterward.

## Cost and time

At most 120 tasks x 3 repetitions x 6 arms x 4 generations, 8,640 short Haiku calls; most arms use one call per task, so the real count is nearer 4,000. Under fifty dollars at Bedrock's Haiku prices. One evening to build, one to run, one to write in.

## Open for Chris

- Approve or change the definition of integrated.
- Who writes the monolithic system prompt and the supplied rules.
- Whether the book's next edition or the negative-results paper is the reporting home.
