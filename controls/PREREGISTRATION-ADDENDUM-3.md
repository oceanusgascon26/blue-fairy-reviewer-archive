# Preregistration addendum 3: the stack, redesigned after E6b failed (2026-09-09)

Written after E6b completed and before any E6c call. E6b's frozen prediction failed. With the repair loop enforcing a one-word reply around the memory-wrapped base, the format was met on every item (60 of 60 single words) and the answer was lost (contains 3 of 60, exact 2 of 60). The logged prompts show the lesson was injected on every call, so retrieval worked; the model, denied the room to substitute letter by letter, guessed a plausible English word instead. Memory alone kept the answer (58 of 60 contains) by reasoning at length and closing with a sentence such as "The decoded word is: harvest", which is not a bare word. The two organs did not compose; the format rule removed the working space the decoding needs. That result stands as E6b and is reported.

The fix follows from the diagnosis: keep the reasoning, constrain only the final line.

## E6c. The stack with a final-line rule

Task prompt, all arms: "Decode the following word. It was encoded with a letter substitution cipher. Work through the substitution letter by letter, then write the decoded word by itself on the last line.\nEncoded word: <cipher>".

Arms, each a fresh operating-system process, same twenty words, same seeded cipher, same E6 stores, Haiku 4.5, temperature 0.7, maxTokens 400, three repetitions:

1. Neither: the bare base.
2. Memory only: the kit's durable-learning organ wrapping the base, the E6 store for that repetition loaded from disk.
3. Repair only: the kit's repair loop around the bare base, `maxRetries` 3 (budget 4), default first-shot suffix and repair prompt, with a checker that reads only the last non-empty line of the reply and passes if it is a single word of letters (markdown emphasis marks and a trailing period are stripped before the test). The checker knows nothing about the answer.
4. Both: the repair loop around the memory-wrapped base, same checker and budget.

Graders, reported separately for every arm: final-line exact (the normalized last line equals the plaintext), contains (plaintext anywhere in the normalized reply), format (the checker's own verdict).

Primary outcome: final-line exact rate under Both minus the larger of Memory only and Repair only, paired by item, pooled over repetitions.

Predictions written now: Neither about 0 on every grader. Memory only about 95 percent contains and a minority final-line exact, since the model tends to close with a sentence rather than the bare word. Repair only high format compliance and about 0 exact. Both high final-line exact. The interaction on final-line exact, Both minus Memory minus Repair plus Neither, is expected to be positive.

Kill rules: if Both does not exceed the better single organ with an interval clear of zero, the book reports both failures, E6b and E6c, and does not claim that the organs compose on this task. If Repair only produces correct words, the run is void pending inspection.

## Reporting

E6b and E6c are reported together beside E6: the naive stack that failed, the diagnosis from the logged prompts, and the redesigned stack, whichever way it comes out. The book does not present the redesign as the first attempt.
