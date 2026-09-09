# Preregistration addendum 8: E6d, the stored rule on words held out from building it (2026-09-09)

Written before any E6d call. Every memory result in the book so far scored the same twenty words that supplied the mapping. The research readers name that gap in every sample: no held-out item anywhere in the memory line. This addendum freezes the held-out test.

## E6d. Durable learning scored on held-out words

Design as E6 (addendum 1) with one change: the words that build the mapping and the words that test it are disjoint.

Training words, the twenty E6 words: harvest, pillow, canyon, whisper, timber, saddle, velvet, ember, quartz, ribbon, falcon, marble, pepper, tunnel, anchor, glacier, basket, copper, violin, oyster. Held-out words, twenty new ones: jungle, candle, window, silver, garden, rocket, puzzle, wizard, forest, bridge, planet, castle, dragon, shadow, summer, yellow, pocket, ladder, magnet, bottle. The same seeded substitution as E6 (seed 20260909). The training words contain no j, k or x, so three held-out words (jungle, rocket, pocket) carry a letter the stored rule cannot map; the share of held-out words fully covered by the rule is reported, and those three are kept in the set.

Session one, this process, empty store: each training word presented cold, its plaintext then supplied, a program deriving the letter mapping from the pairs and writing one lesson (cue "decode") through the kit's organ into a JSON store. Session two, a fresh process: the store loaded from disk, the organ wrapping the base, the twenty held-out words presented. Two controls in fresh processes on the held-out words: the mapping placed directly in the prompt (supplied key), and a cold run. Haiku 4.5 through Bedrock, temperature 0.7, 400-token ceiling, no system prompt, the one-word reply request as in E6. Three repetitions, every prompt logged. Graders as in E6: contains-word and whole-response exact.

Primary outcome: warm minus cold on the held-out words, contains-word, pooled over repetitions by the item bootstrap of E6 (2,000 resamples). Kill rule: if the interval includes zero, the book says the stored rule did not transfer to words it was not built from. If it lies above zero, the book says the rule transferred to held-out words, with the coverage limit stated. Secondary: warm minus supplied key; results on the three words with an unmapped letter reported separately; the training-word cold rate as a replication of E6's session one.

Prediction written now: warm well above cold on the seventeen fully covered words; the three words with an unmapped letter mostly missed in both warm and supplied-key arms; warm close to supplied key, as in E6.

## Reporting

E6d is reported beside E6 in the evidence appendix under the frozen rule, with the held-out list, the coverage share and the raw-log location; the durable-learning chapter gains one sentence stating the held-out result; P3's "transfer to words held out from constructing the mapping" line is replaced by it.
