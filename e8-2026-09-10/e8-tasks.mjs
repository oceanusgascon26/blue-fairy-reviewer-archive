// E8 task family: eight machine-checkable constraint classes, deterministic checkers with specific violation
// messages, a seeded generator for 120 prompts (15 per class), and a stratified seeded sequence in which every
// class recurs. Pure module: no I/O, no model calls. Frozen by hash before any call (see FREEZE-E8.txt).

export const SEED = 20260910;

export function mulberry(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function shuffle(arr, rng) { const p = arr.slice(); for (let i = p.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } return p; }
const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

// Text measures. A word is a maximal run of non-whitespace characters. A sentence is a maximal run of text ending in
// one or more of . ! ? (a trailing run with no terminal mark counts as one sentence if it contains a letter).
export const words = t => t.trim().split(/\s+/).filter(Boolean);
export function sentences(t) {
  const flat = t.replace(/\s+/g, ' ').trim(); if (!flat) return [];
  const out = []; const re = /[^.!?]+[.!?]+/g; let m, last = 0;
  while ((m = re.exec(flat)) !== null) { out.push(m[0].trim()); last = re.lastIndex; }
  const tail = flat.slice(last).trim(); if (/[A-Za-z]/.test(tail)) out.push(tail);
  return out.filter(Boolean);
}
const countChar = (t, ch) => (t.toLowerCase().match(new RegExp(ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
const countWord = (t, w) => (t.match(new RegExp(`\\b${w}\\b`, 'gi')) || []).length;
const nonEmptyLines = t => t.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

// Cues. The memory organ recalls a lesson when its cue appears in the prompt (case-insensitive substring). Every prompt
// of a class contains that class's cue by construction of its template; no template, suffix, repair prompt or violation
// message contains another class's cue (asserted by selfCheck()).
export const CLASSES = {
  wordcount: { cue: 'Word count', desc: 'word count' },
  sentences: { cue: 'sentences', desc: 'sentence count' },
  noletter: { cue: 'without using the letter', desc: 'forbidden letter' },
  commas: { cue: 'comma', desc: 'comma count' },
  lowercase: { cue: 'lowercase', desc: 'lowercase' },
  bullets: { cue: 'bullet', desc: 'bullet lines' },
  ending: { cue: 'End your response with', desc: 'ending phrase' },
  frequency: { cue: 'Use the word', desc: 'word frequency' },
};
export const CLASS_IDS = Object.keys(CLASSES);

// 120 fresh topics, written for this pilot. None appears in the kit's T39 or T20 sets or in IFEval, and none contains a
// cue word (asserted by selfCheck()).
export const TOPICS = [
  'lighthouse keepers', 'sourdough starters', 'the invention of the paper clip', 'tidal pools', 'city pigeons', 'hand-drawn maps',
  'the smell of rain', 'wooden rollercoasters', 'night trains', 'beekeeping in cities', 'the first bicycles', 'glass blowing',
  'moss on old walls', 'the history of the umbrella', 'canal locks', 'origami cranes', 'cast-iron pans', 'the color of the sky at dusk',
  'garden snails', 'marathon pacing', 'the sound of a cello', 'saltwater aquariums', 'lost mittens', 'the first weather forecasts',
  'tugboats', 'wild blueberries', 'radio towers', 'grandfather clocks', 'the taste of cold water', 'bridge tolls',
  'thunderstorms in summer', 'a library card', 'kites on a windy beach', 'the invention of the zipper', 'ferry crossings', 'stone walls without mortar',
  'the winter solstice', 'street chess', 'paper lanterns', 'the life of a river otter', 'volcanic islands', 'bus shelters',
  'the smell of fresh bread', 'mountain huts', 'a well-worn hammer', 'ice fishing', 'the first photographs', 'copper roofs turning green',
  'apple orchards', 'the quiet of early morning', 'suspension footbridges', 'fireflies', 'a rusty bicycle bell', 'sand dunes',
  'the migration of geese', 'coffee roasting', 'wind farms at sea', 'the last bus of the night', 'handwritten recipes', 'pocket watches',
  'deep-sea vents', 'a child learning to whistle', 'harbor seals', 'the history of the pencil', 'mountain passes in snow', 'a sleeping cat',
  'steam locomotives', 'the sound of gravel underfoot', 'hot-air balloons', 'old maps of the moon', 'tea ceremonies', 'a shared umbrella',
  'the first subway lines', 'cliff swallows', 'wool sweaters', 'bonfires on the beach', 'the life of a honeybee', 'cobblestone streets',
  'frozen lakes', 'a violin maker at work', 'the invention of canned food', 'fog over a harbor', 'a spinning top', 'the northern lights',
  'planting tulip bulbs', 'the smell of pine needles', 'a lighthouse foghorn', 'clay pottery', 'the first air mail', 'porch swings',
  'a hidden waterfall', 'the history of ice cream', 'ships in bottles', 'a foggy morning run', 'the weight of a good book', 'chalk cliffs',
  'ravens', 'a wooden canoe', 'town squares at dawn', 'the invention of the thermos', 'a mountain stream', 'wind chimes',
  'winter wheat', 'a kite festival', 'quiet snowfall', 'the first telephones', 'tide tables', 'a loaf cooling on the counter',
  'starlings at dusk', 'a cabin stove', 'river barges', 'the invention of the hourglass', 'seashell collecting', 'a busy fish market',
  'maple syrup season', 'an empty train platform', 'the rings of a fallen tree', 'hand-knit socks', 'a mountain lookout tower', 'harvest moons',
];

const LETTERS = ['b', 'c', 'd', 'f', 'g', 'k', 'l', 'm', 'p', 'v', 'w', 'y'];
const PHRASES = ['Is there anything else I can help with?', 'That is all for today.', 'Thank you for reading.', 'Any other questions?', 'More next time.'];
const FREQ_WORDS = ['river', 'window', 'ladder', 'compass', 'mirror', 'candle', 'anchor', 'meadow'];

// Templates. Each returns { prompt, params }. The prompt of every class contains that class's cue.
export const TEMPLATES = {
  wordcount: (topic, rng) => { const lo = pick([25, 30, 35, 40, 45, 50, 60], rng); return { params: { lo, hi: lo + 4 }, prompt: `Write a short piece about ${topic}. Word count: between ${lo} and ${lo + 4} words.` }; },
  sentences: (topic, rng) => { const n = pick([2, 3, 4, 5], rng); return { params: { n }, prompt: `Write about ${topic} in exactly ${n} sentences.` }; },
  noletter: (topic, rng) => { const ok = LETTERS.filter(l => !topic.toLowerCase().includes(l)); const letter = pick(ok.length ? ok : LETTERS, rng); return { params: { letter }, prompt: `Write a short paragraph about ${topic} without using the letter "${letter}" anywhere in your response.` }; },
  commas: (topic, rng) => { const n = pick([0, 1, 2, 3], rng); return { params: { n }, prompt: n === 0 ? `Write a short paragraph about ${topic} that uses no commas at all.` : `Write a short paragraph about ${topic} that uses exactly ${n} comma${n === 1 ? '' : 's'}.` }; },
  lowercase: (topic) => ({ params: {}, prompt: `Write a short paragraph about ${topic} entirely in lowercase: no capital letters anywhere.` }),
  bullets: (topic, rng) => { const n = pick([3, 4, 5, 6], rng); return { params: { n }, prompt: `Give ${n} facts about ${topic} as exactly ${n} bullet lines, each starting with "- ", with no other text before or after them.` }; },
  ending: (topic, rng) => { const phrase = pick(PHRASES, rng); return { params: { phrase }, prompt: `Write a short paragraph about ${topic}. End your response with the exact phrase "${phrase}" and put nothing after it.` }; },
  frequency: (topic, rng) => { const word = pick(FREQ_WORDS, rng); const n = pick([2, 3, 4], rng); return { params: { word, n }, prompt: `Write a short paragraph about ${topic}. Use the word "${word}" exactly ${n} times.` }; },
};

// Checkers: pure functions of the model text, each returning { ok, violation }. The violation names the measured value
// and the requirement; it is what the repair loop feeds back and what the integrated arm stores.
export const CHECKERS = {
  wordcount: (t, p) => { const n = words(t).length; const ok = n >= p.lo && n <= p.hi; return { ok, violation: ok ? '' : `the response has ${n} words; the task asked for between ${p.lo} and ${p.hi} words` }; },
  sentences: (t, p) => { const n = sentences(t).length; const ok = n === p.n; return { ok, violation: ok ? '' : `the response has ${n} sentences; the task asked for exactly ${p.n}` }; },
  noletter: (t, p) => { const n = countChar(t, p.letter); const ex = [...new Set((t.toLowerCase().match(/[a-z]+/g) || []).filter(w => w.includes(p.letter)))].slice(0, 4); const ok = n === 0; const core = `the response uses the letter "${p.letter}" ${n} time${n === 1 ? '' : 's'}; the task forbade that letter entirely`; return { ok, violation: ok ? '' : core.replace(';', ` (for example in ${ex.map(w => `"${w}"`).join(', ')});`), lesson: ok ? '' : core }; },
  commas: (t, p) => { const n = countChar(t, ','); const ok = n === p.n; return { ok, violation: ok ? '' : `the response has ${n} commas; the task asked for exactly ${p.n}` }; },
  lowercase: (t) => { const caps = t.match(/[A-Z]/g) || []; const ex = [...new Set((t.match(/\b\w*[A-Z]\w*\b/g) || []))].slice(0, 4); const ok = caps.length === 0; const core = `the response has ${caps.length} capital letter${caps.length === 1 ? '' : 's'}; the task asked for lowercase only`; return { ok, violation: ok ? '' : core.replace(';', ` (for example in ${ex.map(w => `"${w}"`).join(', ')});`), lesson: ok ? '' : core }; },
  bullets: (t, p) => { const ls = nonEmptyLines(t); const b = ls.filter(l => l.startsWith('- ')).length; const ok = ls.length === p.n && b === p.n; return { ok, violation: ok ? '' : `the response has ${ls.length} non-empty lines, ${b} of which start with "- "; the task asked for exactly ${p.n} bullet lines and nothing else` }; },
  ending: (t, p) => { const ok = t.trimEnd().endsWith(p.phrase); return { ok, violation: ok ? '' : `the response does not finish with the exact phrase "${p.phrase}" as its final characters; the task asked for that phrase at the very end with nothing after it` }; },
  frequency: (t, p) => { const n = countWord(t, p.word); const ok = n === p.n; return { ok, violation: ok ? '' : `the word "${p.word}" appears ${n} time${n === 1 ? '' : 's'} in the response; the task asked for exactly ${p.n}` }; },
};

// Hand-written rules, one per class: the store contents of the supplied-rules arm and the body of the monolithic system
// prompt. Written before any call by the assistant that wrote the organ code; the plan says so.
export const SUPPLIED_RULES = {
  wordcount: 'Word count tasks: count every word before you finish and stay inside the requested window. Earlier answers ran long; when unsure, write fewer words and count again.',
  sentences: 'Sentence count tasks: count the sentences before you finish, one per terminal mark, and match the requested number exactly. Earlier answers added an extra sentence.',
  noletter: 'Forbidden letter tasks: scan every word for the banned letter before you finish and replace any word that contains it, including the topic itself if needed.',
  commas: 'Comma count tasks: count the commas before you finish and match the requested number exactly; rephrase to add or remove commas rather than adding text.',
  lowercase: 'Lowercase tasks: no capital letters anywhere, including the first word, the pronoun i, names and abbreviations.',
  bullets: 'Bullet line tasks: output exactly the requested number of lines, each starting with "- ", with no heading, introduction or closing line.',
  ending: 'Ending phrase tasks: the exact phrase must be the final characters of the response, with no punctuation, sign-off or blank text after it.',
  frequency: 'Word frequency tasks: count the exact occurrences of the required word before you finish, including plurals and capitalized forms, and match the number exactly.',
};
export const SYSTEM_PROMPT = 'Follow every formatting rule in the request exactly. Rules that apply to every task:\n' + CLASS_IDS.map(c => `- ${SUPPLIED_RULES[c]}`).join('\n');

// The 120 prompts (15 per class), each on its own topic, and the fixed stratified order: per class a seeded shuffle,
// the first 7 (even class index) or 8 (odd) into the first half, the rest into the second; each half then shuffled.
// Positions 1 to 60 are the first half, 61 to 120 the second, so every class appears 7 or 8 times in each half.
export function buildTasks(seed = SEED) {
  const rng = mulberry(seed);
  const topics = shuffle(TOPICS, rng);
  const tasks = [];
  CLASS_IDS.forEach((cls, ci) => {
    for (let k = 0; k < 15; k++) {
      const topic = topics[ci * 15 + k];
      const { prompt, params } = TEMPLATES[cls](topic, rng);
      tasks.push({ id: `${cls}-${String(k + 1).padStart(2, '0')}`, cls, cue: CLASSES[cls].cue, topic, params, prompt });
    }
  });
  const half1 = [], half2 = [];
  CLASS_IDS.forEach((cls, ci) => {
    const mine = shuffle(tasks.filter(t => t.cls === cls), rng);
    const k = ci % 2 === 0 ? 7 : 8;
    half1.push(...mine.slice(0, k)); half2.push(...mine.slice(k));
  });
  const order = [...shuffle(half1, rng), ...shuffle(half2, rng)];
  return order.map((t, i) => ({ pos: i + 1, ...t }));
}

// check() returns { ok, violation, lesson }: violation is what the repair loop feeds back (it may quote words from the
// response as examples); lesson is the example-free text the integrated arm is allowed to store (numbers and the rule only).
export function check(task, text) { const r = CHECKERS[task.cls](text, task.params); return { ok: r.ok, violation: r.violation, lesson: r.lesson ?? r.violation }; }

// Guards run before freezing: cue uniqueness, no cross-class cue in any template, topic, suffix or violation shape.
export function selfCheck(tasks) {
  const cues = CLASS_IDS.map(c => CLASSES[c].cue.toLowerCase());
  const problems = [];
  for (const t of tasks) {
    const p = t.prompt.toLowerCase();
    if (!p.includes(CLASSES[t.cls].cue.toLowerCase())) problems.push(`${t.id}: own cue missing`);
    for (const c of CLASS_IDS) if (c !== t.cls && p.includes(CLASSES[c].cue.toLowerCase())) problems.push(`${t.id}: contains cue of ${c}`);
  }
  for (const topic of TOPICS) for (const cue of cues) if (topic.toLowerCase().includes(cue)) problems.push(`topic "${topic}" contains cue "${cue}"`);
  if (new Set(TOPICS).size !== TOPICS.length) problems.push('duplicate topic');
  if (TOPICS.length !== 120) problems.push(`topics ${TOPICS.length} != 120`);
  const suffix = '\n\nOutput only the response, nothing else.'.toLowerCase();
  for (const cue of cues) if (suffix.includes(cue)) problems.push(`suffix contains cue "${cue}"`);
  for (const c of CLASS_IDS) for (const cue of cues) if (cue !== CLASSES[c].cue.toLowerCase() && SUPPLIED_RULES[c].toLowerCase().includes(cue)) problems.push(`rule ${c} contains cue "${cue}"`);
  const second = tasks.filter(t => t.pos > 60); for (const c of CLASS_IDS) { const n = second.filter(t => t.cls === c).length; if (n < 7 || n > 8) problems.push(`class ${c} has ${n} in second half`); }
  return problems;
}
