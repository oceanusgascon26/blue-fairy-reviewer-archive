# E9 note: what the frozen analysis says, and what the records suggest (2026-09-10)

Written after the run, beside READOUT-E9.md. The first section restates the frozen outcomes. The second is exploratory: not in the plan, drawn from the same records, offered as leads and not as results.

## Under the frozen rule

The primary comparison, Wire B minus repair only on positions 61 to 120, came out at -6.1 points with a 95 percent interval from -13.3 to +0.6 (bootstrap p 0.08, 60 prompts, three repetitions). The interval includes zero. Under the kill rule written before the run, no parameter-free wire earns its place on this family either. The point estimate is again on the wrong side of zero.

The family had room this time. Base passed 40.6 percent of the second half and repair only 82.2 percent, so a wire had about eighteen points to work with. None of the three used them. On the second half, Wire A finished at 74.4 percent, Wire B at 76.1, Wire C at 81.7, repair only at 82.2 and supplied rules at 83.9.

Nothing in the secondary family survives Benjamini-Hochberg at q 0.05; three comparisons sit at an adjusted p of 0.078. Read as descriptive: E8's loss replicated, with Wire A at -7.8 points against repair only (interval -15.6 to -0.6); keying the lesson on the parameter recovered most of it, with Wire C at +7.2 against Wire A (interval +0.6 to +14.4) and level with repair only (-0.6); Wire B, the parameter-free design, landed between them and fell 7.8 points short of the hand-written ceiling. Neither Wire B nor Wire C reached that ceiling, and the ceiling itself was only 1.7 points above the unwired stack.

The mechanism outcomes point the same way in every wired arm. Lessons raised first attempts: on the second half, repair only passed 41.7 percent of first attempts, Wire A 47.2, Wire B 43.9, Wire C 51.7 and supplied rules 45.0. Lessons lowered recovery: of the first attempts that failed, the unwired repair loop recovered 73 of 105 (70 percent), Wire A 49 of 95 (52 percent), Wire B 58 of 101 (57 percent), Wire C 54 of 87 (62 percent), supplied rules 70 of 99 (71 percent). The wire trades a better first shot for a worse repair, and the trade nets to zero or below.

The run completed with 4,284 calls and no call errors. The wired arms wrote 61 to 69 lessons per repetition; Wire C recalled a lesson on 61 to 63 of the 120 prompts in each repetition; the leakage check flagged nothing.

## Exploratory: where the recovery goes

The recovery loss is not spread evenly. By class on the second half, the unwired loop and the wired arms recover about the same share of word-count failures (19 of 32 unwired; 22, 17 and 21 of 32 to 34 for A, B and C) and of comma failures. The forbidden-letter class carries the loss: the unwired loop recovered 25 of 35 first-attempt failures there, Wire A 10 of 36, Wire B 20 of 36 and Wire C 17 of 32. Supplied rules recovered 27 of 36. So a hand-written procedural rule ("scan every word for the banned letter and replace any word that contains it") sat ahead of the same repair prompt without cost, while the three mechanical lessons, all of which restate a count or a letter, cost 15 to 40 points of recovery in that class. That narrows the dilution story from "any block" to "a block that restates failure statistics next to a repair prompt that already gives the specific one". It is a reading of 36 prompts per arm and it is not tested here.

The E8 mismatch replicated for Wire A. Of its 69 recalled forbidden-letter lessons, 66 named a letter the current prompt did not forbid, and those prompts passed 19 times and failed 47. Wire C's keyed lessons removed the mismatch by construction, and its forbidden-letter pass rate rose from Wire A's 28 percent to 58, still short of the unwired loop's 72.

One caution on reading Wire C's recall pattern: on the second half, prompts that recalled a keyed lesson passed 78 percent of the time and prompts that recalled nothing passed 91 percent. That is selection, not harm: a keyed lesson exists only for parameters that already failed once, so the recalled set is the harder set.

## What this changes

Two pilots, the same answer. E8 said the wire bought nothing on an easy family; E9 says it bought nothing on a hard one, and shows why: the lesson helps the first attempt and hurts the repair, and the two cancel. The parameter fix (Wire C) was real and insufficient. For the book's next edition and the negative-results paper, E8 and E9 are the matched pair the note after E8 asked for: a mechanism that failed, and the test of why. For the kit, nothing changes; the wire stays a harness-level experiment. The one design that this pair points at, and that no plan has yet tested, is a wire whose lesson is a procedure rather than a statistic, recalled only when the repair prompt is not already carrying the specific. That is a plan to freeze and register before it runs, not a fix to make now.
