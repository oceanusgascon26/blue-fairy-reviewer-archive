# Builds one GBNF grammar per constraint of the kit's 39-item set for E4 (grammar-constrained decoding), writes grammars.json
# and grammars/<id>.gbnf, and tests every grammar against positive and negative strings with a small GBNF matcher (no model calls).
# The kit's checkers stay the judge in the experiment; the grammars encode this reading of each checker.
import json, os, re, sys, hashlib, itertools
sys.setrecursionlimit(20000)
D = os.path.dirname(os.path.abspath(__file__))

LETTERS = [chr(c) for c in range(65, 91)] + [chr(c) for c in range(97, 123)]
def cls(exclude=""):  # a character class of letters excluding the given letters in both cases
    ex = set(exclude.lower()) | set(exclude.upper())
    return "[" + "".join(c for c in LETTERS if c not in ex) + "]"
SENT_BODY = "[^.!?\\n]"            # a sentence body character: no terminal punctuation, no newline
END = "[.!?]"

def sentences(n, body=SENT_BODY, first=None):
    s = ("s ::= %s %s* %s" % (first, body, END)) if first else ("s ::= %s+ %s" % (body, END))
    root = "root ::= s" + ((' (" " s){%d}' % (n - 1)) if n > 1 else "")
    return root + "\n" + s

def wordcount(n):
    return 'root ::= w (" " w){%d}\nw ::= [^ \\t\\n]+' % (n - 1)

def titlecase(n):
    return 'root ::= w (" " w){%d}\nw ::= [A-Z] [^ \\t\\n]*' % (n - 1)

def bullets(n, marker):
    return 'root ::= line ("\\n" line){%d}\nline ::= "%s " [^\\n]+' % (n - 1, marker)

def no_letters(letters, n_sent):
    body = "[^" + "".join(sorted(set(letters.lower()) | set(letters.upper()))) + ".!?\\n]"
    return sentences(n_sent, body=body)

def commas(c):
    return 'root ::= seg ("," seg){%d} %s\nseg ::= [^,.!?\\n]+' % (c, END)

def word_freq(target, k, n_sent):
    """Exactly k occurrences of target (case-insensitive, whole word) across exactly n_sent sentences; words are letters only."""
    L = len(target); rules = []
    # non-target word: trie complement of the target, case-insensitive, letters only
    rules.append("nt ::= %s L* | %s p1" % (cls(target[0]), cls_lit(target[0])))
    for i in range(1, L):
        rules.append("p%d ::= %s L* | %s p%d |" % (i, cls(target[i]), cls_lit(target[i]), i + 1))   # the trailing empty alternative allows a proper prefix as a whole word
    rules.append("p%d ::= L+" % L)                                                                   # the full target must continue with more letters to count as another word
    rules.append("tgt ::= " + " ".join(cls_lit(ch) for ch in target))
    rules.append("L ::= [A-Za-z]")
    # product automaton: s_i_j starts a sentence with i targets so far and j sentences done; m_i_j is mid-sentence
    rules.append("root ::= s_0_0")
    for i in range(k + 1):
        for j in range(n_sent):
            alts_s = ["nt m_%d_%d" % (i, j)] + (["tgt m_%d_%d" % (i + 1, j)] if i < k else [])
            rules.append("s_%d_%d ::= %s" % (i, j, " | ".join(alts_s)))
            alts_m = ['" " nt m_%d_%d' % (i, j)] + (['" " tgt m_%d_%d' % (i + 1, j)] if i < k else [])
            if j + 1 < n_sent: alts_m.append('%s " " s_%d_%d' % (END, i, j + 1))
            elif i == k: alts_m.append(END)
            rules.append("m_%d_%d ::= %s" % (i, j, " | ".join(alts_m)))
    return "\n".join(rules)

def cls_lit(ch): return "[" + ch.lower() + ch.upper() + "]"

JSON_STR = 'str ::= "\\"" [^"\\\\\\n]* "\\""'
GRAMMARS = {
    "wordcount-20": wordcount(20), "wordcount-33": wordcount(33),
    "no-letter-e": no_letters("e", 2), "no-letter-a": no_letters("a", 1),
    "json-keys": 'root ::= "{" ws "\\"name\\"" ws ":" ws str ws "," ws "\\"age\\"" ws ":" ws (num | str) ws "," ws "\\"city\\"" ws ":" ws str ws "}"\n' + JSON_STR + '\nnum ::= [0-9]+\nws ::= [ \\n]*',
    "json-array-5": 'root ::= "[" ws str (ws "," ws str){4} ws "]"\n' + JSON_STR + '\nws ::= [ \\n]*',
    "lowercase-nocomma": 'root ::= [^A-Z,.!?\\n]+ [.!?]',
    "bullets-4": bullets(4, "-"), "bullets-6": bullets(6, "*"),
    "word-twice": word_freq("morning", 2, 3),
    "startswith-S": sentences(3, first="[sS]"),
    "endswith-phrase": 'root ::= s " " s " THE END"\ns ::= [^.!?\\n]+ [.!?]',
    "title-case-line": titlecase(5),
    "sentences-4": sentences(4),
    "no-vowel-a-e": no_letters("ae", 1),
    "exactly-two-commas": commas(2),
    "wc-12": wordcount(12), "wc-15": wordcount(15), "wc-25": wordcount(25), "wc-40": wordcount(40), "wc-50": wordcount(50),
    "no-o": no_letters("o", 1), "no-t": no_letters("t", 1), "no-s": no_letters("s", 1), "no-i": no_letters("i", 1), "no-n": no_letters("n", 1),
    "commas-1": commas(1), "commas-3": commas(3),
    "sent-2": sentences(2), "sent-5": sentences(5), "sent-6": sentences(6),
    "start-T": sentences(4, first="[tT]"), "start-B": sentences(4, first="[bB]"), "start-M": sentences(4, first="[mM]"),
    "water-3": word_freq("water", 3, 4), "time-2": word_freq("time", 2, 3),
    "uppercase": 'root ::= [^a-z.!?\\n]+ [.!?]',
    "excl-3": 'root ::= s (" " s){2}\ns ::= [^.!?\\n]+ "!"',
    "title-7": titlecase(7),
}
assert len(GRAMMARS) == 39, len(GRAMMARS)

# ---- a small GBNF matcher for testing (literals, classes, sequences, alternation, groups, * + ? {m} {m,n}, rule references) ----
def parse_grammar(text):
    rules = {}
    for line in text.split("\n"):
        if not line.strip(): continue
        name, expr = line.split("::=", 1); rules[name.strip()] = parse_alt(tokenize(expr))
    return rules
def tokenize(expr):
    toks = []; i = 0; e = expr.strip()
    while i < len(e):
        c = e[i]
        if c.isspace(): i += 1
        elif c == '"':
            j = i + 1; s = ""
            while e[j] != '"':
                if e[j] == "\\": s += {"n": "\n", "t": "\t", '"': '"', "\\": "\\"}[e[j + 1]]; j += 2
                else: s += e[j]; j += 1
            toks.append(("lit", s)); i = j + 1
        elif c == "[":
            j = i + 1; neg = False; chars = set()
            if e[j] == "^": neg = True; j += 1
            items = []
            while e[j] != "]":
                if e[j] == "\\": items.append({"n": "\n", "t": "\t", "\\": "\\", "]": "]", '"': '"'}[e[j + 1]]); j += 2
                else: items.append(e[j]); j += 1
            k = 0
            while k < len(items):
                if k + 2 < len(items) and items[k + 1] == "-": chars.update(chr(x) for x in range(ord(items[k]), ord(items[k + 2]) + 1)); k += 3
                else: chars.add(items[k]); k += 1
            toks.append(("cls", (neg, frozenset(chars)))); i = j + 1
        elif c in "()|*+?": toks.append((c, c)); i += 1
        elif c == "{":
            j = e.index("}", i); parts = e[i + 1:j].split(","); lo = int(parts[0]); hi = lo if len(parts) == 1 else (int(parts[1]) if parts[1] else None)
            toks.append(("rep", (lo, hi))); i = j + 1
        else:
            j = i
            while j < len(e) and (e[j].isalnum() or e[j] in "_-"): j += 1
            toks.append(("ref", e[i:j])); i = j
    return toks
def parse_alt(toks):
    alts = [[]]; i = 0
    while i < len(toks):
        t = toks[i]
        if t[0] == "|": alts.append([]); i += 1; continue
        if t[0] == "(":
            depth = 1; j = i + 1
            while depth:
                if toks[j][0] == "(": depth += 1
                elif toks[j][0] == ")": depth -= 1
                j += 1
            node = ("group", parse_alt(toks[i + 1:j - 1])); i = j
        else: node = t; i += 1
        while i < len(toks) and toks[i][0] in ("*", "+", "?", "rep"):
            q = toks[i]; lo, hi = {"*": (0, None), "+": (1, None), "?": (0, 1)}.get(q[0], q[1]); node = ("repeat", (node, lo, hi)); i += 1
        alts[-1].append(node)
    return ("alt", alts)
def match(rules, node, s, i):
    kind = node[0]
    if kind == "lit":
        if s.startswith(node[1], i): yield i + len(node[1])
    elif kind == "cls":
        neg, chars = node[1]
        if i < len(s) and ((s[i] in chars) != neg): yield i + 1
    elif kind == "ref": yield from match(rules, rules[node[1]], s, i)
    elif kind == "group": yield from match(rules, node[1], s, i)
    elif kind == "alt":
        for seq in node[1]: yield from match_seq(rules, seq, s, i)
    elif kind == "repeat":
        inner, lo, hi = node[1]
        def rep(pos, count):
            if count >= lo: yield pos
            if hi is None or count < hi:
                for p in match(rules, inner, s, pos):
                    if p == pos: continue
                    yield from rep(p, count + 1)
        yield from rep(i, 0)
def match_seq(rules, seq, s, i):
    if not seq: yield i; return
    for p in match(rules, seq[0], s, i): yield from match_seq(rules, seq[1:], s, p)
def accepts(grammar, s):
    rules = parse_grammar(grammar); return any(p == len(s) for p in match(rules, rules["root"], s, 0))

# ---- tests: positives must be accepted (and should pass the kit checker, checked separately in Node), negatives rejected ----
W = lambda n: " ".join(["word"] * n)
TESTS = {
    "wordcount-20": ([W(20)], [W(19), W(21), W(20) + " "]),
    "wordcount-33": ([W(33)], [W(32)]),
    "no-letter-e": (["A mountain holds its snow. It stands tall."], ["A mountain holds its snow. It stands tall. Extra.", "The mountain."]),
    "no-letter-a": (["Music soothes the mind."], ["Music has a beat."]),
    "json-keys": (['{"name": "Ann", "age": 33, "city": "Oslo"}', '{"name":"A","age":"x","city":"B"}'], ['{"name": "Ann", "age": 33}', '{"age": 1, "name": "A", "city": "B"}']),
    "json-array-5": (['["apple", "pear", "fig", "kiwi", "plum"]'], ['["apple", "pear"]', '[1,2,3,4,5]']),
    "lowercase-nocomma": (["snow falls quietly on the roofs."], ["Snow falls.", "snow falls, quietly."]),
    "bullets-4": (["- hold\n- clip\n- pick\n- hook"], ["- hold\n- clip\n- pick", "* hold\n* clip\n* pick\n* hook"]),
    "bullets-6": (["* a\n* b\n* c\n* d\n* e\n* f"], ["* a\n* b\n* c\n* d\n* e"]),
    "word-twice": (["Morning coffee wakes me. The morning is slow. I drink it warm."], ["Morning coffee wakes me. The morning is slow.", "Coffee wakes me. It is slow. I drink it warm.", "Morning coffee. Morning tea. Morning again."]),
    "startswith-S": (["Sam runs. Sally jumps. Spot sleeps."], ["Sam runs. Sally jumps.", "Sam runs. Bob jumps. Spot sleeps."]),
    "endswith-phrase": (["Plants take light. They make sugar. THE END"], ["Plants take light. THE END", "Plants take light. They make sugar."]),
    "title-case-line": (["Stars Beyond The Quiet Dark"], ["Stars beyond the quiet dark", "Stars Beyond The Dark"]),
    "sentences-4": (["A. B. C. D."], ["A. B. C.", "A. B. C. D. E."]),
    "no-vowel-a-e": (["Sky glows bright."], ["The sky glows."]),
    "exactly-two-commas": (["Stalls, voices, and fruit fill the market."], ["Stalls and fruit fill the market.", "Stalls, voices, fruit, and noise."]),
    "wc-12": ([W(12)], [W(11)]), "wc-15": ([W(15)], [W(16)]), "wc-25": ([W(25)], [W(24)]), "wc-40": ([W(40)], [W(39)]), "wc-50": ([W(50)], [W(51)]),
    "no-o": (["A vast sea sparkles."], ["The ocean sparkles."]), "no-t": (["A garden blooms."], ["The garden blooms."]), "no-s": (["A train waited."], ["A train waits."]),
    "no-i": (["A bakery smells warm."], ["A bakery is warm."]), "no-n": (["A desert bakes."], ["A desert burns."]),
    "commas-1": (["Books, quiet."], ["Books quiet.", "Books, quiet, rows."]), "commas-3": (["Boats, ropes, gulls, salt."], ["Boats, ropes, gulls."]),
    "sent-2": (["A. B."], ["A."]), "sent-5": (["A. B. C. D. E."], ["A. B. C. D."]), "sent-6": (["A. B. C. D. E. F."], ["A. B. C. D. E."]),
    "start-T": (["Trees. Tall. Thick. Tough."], ["Trees. Tall. Thick.", "Trees. Big. Thick. Tough."]), "start-B": (["Boats. Bells. Birds. Bays."], ["Boats. Bells. Birds."]),
    "start-M": (["Moss. Mist. Mud. Maple."], ["Moss. Mist. Mud."]),
    "water-3": (["Water runs. Water falls. The water shines. Fish swim."], ["Water runs. Water falls. Fish swim. Birds sing.", "Water runs. Water falls. Water shines. Water glows."]),
    "time-2": (["Time passes. The time is late. Clocks tick."], ["Time passes. Clocks tick. Hands move.", "Time. Time. Time."]),
    "uppercase": (["WE WON THE DAY."], ["We won.", "WE WON. TWICE."]),
    "excl-3": (["Drums beat! Lights shine! We dance!"], ["Drums beat! Lights shine!", "Drums beat. Lights shine! We dance!"]),
    "title-7": (["Seven Ships Sail Past The Frozen Coast"], ["Seven ships sail past the frozen coast", "Seven Ships Sail Past The Coast"]),
}
bad = 0
for tid, g in GRAMMARS.items():
    pos, neg = TESTS[tid]
    for s in pos:
        if not accepts(g, s): bad += 1; print("FAIL accept", tid, repr(s[:60]))
    for s in neg:
        if accepts(g, s): bad += 1; print("FAIL reject", tid, repr(s[:60]))
print("grammar tests: %d grammars, %d positives, %d negatives, %d failures" % (len(GRAMMARS), sum(len(v[0]) for v in TESTS.values()), sum(len(v[1]) for v in TESTS.values()), bad))
os.makedirs(D + "/grammars", exist_ok=True)
for tid, g in GRAMMARS.items(): open(D + "/grammars/%s.gbnf" % tid, "w", newline="\n").write(g + "\n")
json.dump({"tests": {k: {"positive": v[0], "negative": v[1]} for k, v in TESTS.items()}, "grammars": GRAMMARS}, open(D + "/grammars.json", "w", encoding="utf-8"), indent=1)
print("grammars.json sha256", hashlib.sha256(open(D + "/grammars.json", "rb").read()).hexdigest())
sys.exit(1 if bad else 0)
