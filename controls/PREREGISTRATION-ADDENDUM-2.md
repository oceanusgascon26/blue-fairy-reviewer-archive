# Preregistration addendum 2: the two organs stacked on the cipher task (2026-09-09)

Written after E6 completed and before any E6b call. E6 found that the stored rule, retrieved by the public kit's mechanism on a real base, produced the correct plaintext in 58 of 60 warm answers (contains-word grader) and a compliant answer in none of them (exact grader): told to reply with only the decoded word, the model narrated its substitution every time. The supplied-key control behaved the same way. Chris's instruction: the book has to demonstrate this working, so if it does not, fix it and make it work. The fix the design already contains is the other organ. This addendum freezes that test.

## E6b. A two-by-two on the same twenty words

Question: do the memory organ and the repair organ together produce what neither produces alone, a correct answer in the requested form?

Arms, each a fresh operating-system process, each on the same twenty words and the same seeded substitution cipher as E6, Haiku 4.5, temperature 0.7, maxTokens 400:

1. Neither: the bare base, the E6 task prompt ("Decode the following word ... Reply with only the decoded word.").
2. Memory only: the kit's durable-learning organ wrapping the base, loading the E6 store for that repetition from disk (one lesson, cue "decode").
3. Repair only: the kit's repair loop around the bare base, `maxRetries` 3 (budget 4), default first-shot suffix and repair prompt, with a format checker that knows nothing about the answer: the reply must be a single word of letters only.
4. Both: the repair loop around the memory-wrapped base, same checker and budget. The repair prompt carries the task text, so the cue matches and the lesson is injected on every attempt.

Three repetitions, one per E6 store. Every prompt sent to the model is logged raw.

Graders, reported separately for every arm: exact (normalized whole response equals the plaintext), contains (plaintext appears anywhere in the normalized response), format (single word of letters only, the repair checker's own verdict, correct or not).

Primary outcome: exact-match rate of Both minus the larger of Memory only and Repair only, paired by item, pooled over repetitions.

Predictions written now: Neither about 0 exact and 0 contains. Memory only about 0 exact and about 95 percent contains, as in E6. Repair only high format compliance and about 0 exact, since a compliant single word cannot be the right word without the key. Both high exact. If those predictions hold, the exact-match rate under Both exceeds the sum of the two single-organ rates, and that excess is the interaction on this task, at the level of a mechanism demonstration: one task, twenty self-authored words, one base, three repetitions. It is not the registered composition study and the book will not present it as such.

Kill rules: if Both does not exceed the better single organ with an interval clear of zero, the book reports that stacking did not deliver a compliant correct answer and keeps E6's format failure as the last word on this task. If Repair only produces correct answers (it should not be able to), the checker or the isolation is suspect and the run is void pending inspection of the logged prompts.

Secondary: contains under every arm; format compliance under every arm; repair calls used in arms 3 and 4; the words that fail under Both.

## Reporting

E6b is reported beside E6 in the evidence appendix, in the book's voice, with the raw-log location and the verdict under the rules above. It does not revise E6.
