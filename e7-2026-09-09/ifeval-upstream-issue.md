instruction_following_eval: letter_frequency substitutes a random letter when kwargs carry a non-alphabetic character (prompt 1122), and the language checks depend on an unseeded langdetect

Two reproducibility defects in `instruction_following_eval`, found while using the reference checkers to score and to drive a repair loop on a 60-prompt slice of `input_data.jsonl`. Files at the current head of `instruction_following_eval/`; the local copies I used are byte-identical to upstream (sha256 checked on 2026-09-09).

### 1. `keywords:letter_frequency` silently changes the requirement

`LetterFrequencyChecker.build_description` (instructions.py, lines 1337 to 1343) does this when the supplied letter is missing or not in a-z:

```python
if (not letter or len(letter) > 1 or ord(letter.lower()) < 97 or ord(letter.lower()) > 122):
    self._letter = random.choice(list(string.ascii_letters))
```

Prompt key 1122 in `input_data.jsonl` reaches that branch:

```json
{"key": 1122, "instruction_id_list": ["change_case:english_lowercase", "keywords:letter_frequency"],
 "kwargs": [{}, {"let_relation": "at least", "letter": "#", "let_frequency": 4}]}
```

The prompt asks for "at least 4 hashtags, starting with '#'". The checker cannot score `#`, so it draws a random ASCII letter and scores that instead, with a different letter on every process. Scores for this prompt are therefore not reproducible, and any harness that feeds `build_description()` back to the model as feedback tells it something the prompt never asked. Our repair log has the checker demanding "the letter v should appear at least 4 times" on this prompt.

Suggested fixes: either give 1122 a checker that can express the hashtag requirement (or drop the prompt), and make `build_description` raise or return a fixed sentinel instead of drawing a random letter. Similar random fallbacks exist just below: `let_frequency` gets `random.randint(1, _LETTER_FREQUENCY)` when None or negative, and `let_relation` gets `random.choice(_COMPARISON_RELATION)` when None. A seed or an explicit error would make those reproducible too.

### 2. The language checks are unseeded

`ResponseLanguageChecker.check_following` (line 158), `CapitalLettersEnglishChecker` (line 1416) and `LowercaseLettersEnglishChecker` (line 1448) call `langdetect.detect()` without setting `langdetect.DetectorFactory.seed`. langdetect's detector is randomized unless that seed is set, and on short or mixed answers the verdict changes between runs.

Reproduction on our saved answers: replaying 2,267 model responses across the 60-prompt slice under seeds 0, 1, 7 and 42 changed the pass judgment on 45 responses across three prompts (keys 1122, 279 and 1219). Depending on the seed, that flipped between 9 and 11 of the 1,620 arm-level pass flags (60 prompts x 3 bases x 3 repetitions x 3 arms), on 6 or 7 prompt, base and repetition cases. Setting `DetectorFactory.seed = 0` (or any fixed value) at import time in `instructions_util.py` removes the variance.

Both findings, the replay script and the raw responses are in a public archive: https://github.com/oceanusgascon26/blue-fairy-reviewer-archive (controls/e5-seed-replay.py and its output controls/e5-seed-replay.json, the raw responses in controls/raw/e5-*.jsonl, controls/results-e5.json). Happy to open a PR for the seed and the sentinel if that is welcome.
