# E8 note: what the frozen analysis says, and one exploratory observation (2026-09-10)

Written after the run, beside READOUT-E8.md. The first section restates the frozen outcomes. The second section is exploratory: it was not in the plan, it uses the same records, and it is offered as a lead for the next design, not as a result.

## Under the frozen rule

The primary comparison, integrated minus repair only on positions 61 to 120, came out at -2.8 points with a 95 percent interval from -6.7 to +1.7 (bootstrap p 0.25, 60 prompts, three repetitions). The interval includes zero. Under the kill rule written before the run, the wire bought nothing measurable on this task family. The point estimate is on the wrong side of zero, and the interval does not exclude a small loss.

The secondary family behaved as predicted in one respect and not in another. All three organ arms beat the monolithic system prompt by 18 to 21 points on the second half, and those three comparisons survive Benjamini-Hochberg at q 0.05. None of the organ arms separated from monolithic resampling at the same four-generation budget (+3 to +6 points, intervals including zero), which repeats E2 and E5: at a matched budget, the repair loop and verifier-selected resampling are close. Integrated minus supplied rules was -1.7 points with an interval including zero: the wire did not reach the hand-written ceiling, and the ceiling itself sat level with the unwired stack.

The family was easier than intended in six of eight classes. On the second half, repair only passed every comma, ending, frequency, lowercase and bullet prompt and 92 percent of the word-count prompts, so the wire had almost no room to show anything there. Its room was in the forbidden-letter class (repair only 67 percent) and the sentence-count class (86 percent), and it changed nothing in the second and lost ground in the first.

The run completed with 2,899 calls and no call errors. A first start was stopped after about a minute for a process-supervision reason and its records are kept apart (raw-aborted-start-1/); they are not data. The integrated arm wrote 33, 32 and 31 lessons in the three repetitions, and the leakage check flagged none.

## Exploratory: the lesson that names the wrong letter

The whole second-half difference sits in one class. Forbidden-letter prompts passed 67 percent of the time under repair only, 54 percent under supplied rules and 42 percent under the wire (24 prompts per arm across the three repetitions). Every other class was level between the two stacks, and word count moved slightly the other way (96 against 92 percent).

The mechanism looks like a design property of the lesson template, not of memory as such. The wire stores one lesson per class and the lesson text carries the latest violation, which for this class names a specific letter: "the response uses the letter m 8 times". Forbidden-letter prompts vary the letter, so on most later prompts the recalled lesson talks about a letter the task does not forbid. In the records, 42 forbidden-letter prompts in the integrated arm received a recalled lesson; in 37 of them the lesson named a different letter from the one the prompt forbade, and those 37 passed 19 times and failed 18. The five that received a lesson naming the same letter all passed. The counts are small and the comparison was not planned, so this is a lead, not a finding.

Two things in the records argue against a simpler story. First, the recalled lessons did help first attempts overall: across all 360 prompts per arm, first attempts passed 73 percent of the time under the wire against 67 percent under repair only and 71 percent under supplied rules. Second, the loss appears after the first attempt: on forbidden-letter prompts the first attempt passed 7 percent of the time under both stacks, so the repair retries, not the first attempts, are where the wired stack recovered fewer prompts. One reading is that a lesson about the wrong letter, injected ahead of a repair prompt that names the right one, dilutes the specific feedback the loop depends on. That reading is testable: a lesson template that carries the class rule without the last failure's parameter, or that keys the cue on the parameter as well as the class, would separate the two explanations. That is a design for a later plan, frozen and registered before it runs, not something to fix in this one.

## What this changes

For the book's next edition: E8 joins E2 and E5 as a null under a matched budget, with a specific loss to report rather than a wash. For the negative-results paper: E8 is the cleanest of the set, because it was registered publicly before the run and the kill rule was met on the first try. For the kit: nothing changes in the code; the wire tested here is a harness-level composition, not a shipped organ, and it should stay that way until a plan shows it earns its place.
