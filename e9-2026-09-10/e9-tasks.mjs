// E9 task family: five hardened machine-checkable constraint classes with six parameter values each, deterministic
// checkers (the E8 checkers, with an exact word count), a seeded balanced generator for 120 prompts (24 per class) and a
// stratified fixed sequence. Self-contained: nothing is imported from the E8 folder. Pure module: no I/O, no model calls.

export const SEED = 20260911;

export function mulberry(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function shuffle(arr, rng) { const p = arr.slice(); for (let i = p.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } return p; }

// Text measures, as in E8: a word is a maximal run of non-whitespace; a sentence is a maximal run ending in . ! ?
// (a trailing run with a letter and no terminal mark counts as one).
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

// Class cues (the memory organ recalls by case-insensitive substring of the prompt). Every prompt of a class contains its
// class cue; no template, topic, suffix, rule or parameter cue contains another class's cue (selfCheck asserts this).
export const CLASSES = {
  wordcount: { cue: 'Word count', desc: 'word count', unit: 'words' },
  sentences: { cue: 'sentences', desc: 'sentence count', unit: 'sentences' },
  noletter: { cue: 'without using the letter', desc: 'forbidden letter', unit: 'occurrences of the banned letter' },
  commas: { cue: 'comma', desc: 'comma count', unit: 'commas' },
  frequency: { cue: 'Use the word', desc: 'word frequency', unit: 'occurrences' },
};
export const CLASS_IDS = Object.keys(CLASSES);

// Six parameter values per class, each used exactly four times in the class's 24 prompts.
export const PARAMS = {
  wordcount: [20, 30, 40, 50, 60, 75].map(N => ({ N })),
  sentences: [3, 4, 5, 6, 7, 8].map(n => ({ n })),
  noletter: ['c', 'd', 'l', 'm', 'p', 's'].map(letter => ({ letter })),
  commas: [0, 1, 2, 3, 4, 5].map(n => ({ n })),
  frequency: [['river', 3], ['river', 5], ['window', 3], ['window', 5], ['ladder', 3], ['ladder', 5]].map(([word, n]) => ({ word, n })),
};
export const paramKey = (cls, p) => cls === 'wordcount' ? `N${p.N}` : cls === 'noletter' ? p.letter : cls === 'frequency' ? `${p.word}-${p.n}` : `n${p.n}`;

// The parameter phrase exactly as it appears in the prompt: the cue of a Wire C lesson.
export function paramCue(cls, p) {
  if (cls === 'wordcount') return `exactly ${p.N} words`;
  if (cls === 'sentences') return `exactly ${p.n} sentences`;
  if (cls === 'noletter') return `the letter "${p.letter}"`;
  if (cls === 'commas') return p.n === 0 ? 'no commas at all' : `exactly ${p.n} comma${p.n === 1 ? '' : 's'}`;
  return `"${p.word}" exactly ${p.n} times`;
}

export const TEMPLATES = {
  wordcount: (topic, p) => `Write about ${topic}. Word count: exactly ${p.N} words.`,
  sentences: (topic, p) => `Write about ${topic} in exactly ${p.n} sentences.`,
  noletter: (topic, p) => `Write a short paragraph about ${topic} without using the letter "${p.letter}" anywhere in your response.`,
  commas: (topic, p) => p.n === 0 ? `Write a short paragraph about ${topic} that uses no commas at all.` : `Write a short paragraph about ${topic} that uses exactly ${p.n} comma${p.n === 1 ? '' : 's'}.`,
  frequency: (topic, p) => `Write a short paragraph about ${topic}. Use the word "${p.word}" exactly ${p.n} times.`,
};

// The E8 topic pool, unchanged (120 topics, none containing a cue).
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

// Checkers: pure functions of the response text. Each returns { ok, violation, lesson, measured, target }. violation is what the
// repair loop feeds back (it may quote response words as examples); lesson is the example-free text a Wire A or Wire C lesson
// may store; measured and target are the numbers a Wire B lesson summarizes (target 0 for the forbidden letter).
export const CHECKERS = {
  wordcount: (t, p) => { const n = words(t).length; const ok = n === p.N; const core = `the response has ${n} words; the task asked for exactly ${p.N} words`; return { ok, violation: ok ? '' : core, lesson: ok ? '' : core, measured: n, target: p.N }; },
  sentences: (t, p) => { const n = sentences(t).length; const ok = n === p.n; const core = `the response has ${n} sentences; the task asked for exactly ${p.n}`; return { ok, violation: ok ? '' : core, lesson: ok ? '' : core, measured: n, target: p.n }; },
  noletter: (t, p) => { const n = countChar(t, p.letter); const ex = [...new Set((t.toLowerCase().match(/[a-z]+/g) || []).filter(w => w.includes(p.letter)))].slice(0, 4); const ok = n === 0; const core = `the response uses the letter "${p.letter}" ${n} time${n === 1 ? '' : 's'}; the task forbade that letter entirely`; return { ok, violation: ok ? '' : core.replace(';', ` (for example in ${ex.map(w => `"${w}"`).join(', ')});`), lesson: ok ? '' : core, measured: n, target: 0 }; },
  commas: (t, p) => { const n = countChar(t, ','); const ok = n === p.n; const core = `the response has ${n} commas; the task asked for exactly ${p.n}`; return { ok, violation: ok ? '' : core, lesson: ok ? '' : core, measured: n, target: p.n }; },
  frequency: (t, p) => { const n = countWord(t, p.word); const ok = n === p.n; const core = `the word "${p.word}" appears ${n} time${n === 1 ? '' : 's'} in the response; the task asked for exactly ${p.n}`; return { ok, violation: ok ? '' : core, lesson: ok ? '' : core, measured: n, target: p.n }; },
};
export function check(task, text) { return CHECKERS[task.cls](text, task.params); }

// The five E8 supplied rules for these classes, verbatim: the store of the supplied-rules arm.
export const SUPPLIED_RULES = {
  wordcount: 'Word count tasks: count every word before you finish and stay inside the requested window. Earlier answers ran long; when unsure, write fewer words and count again.',
  sentences: 'Sentence count tasks: count the sentences before you finish, one per terminal mark, and match the requested number exactly. Earlier answers added an extra sentence.',
  noletter: 'Forbidden letter tasks: scan every word for the banned letter before you finish and replace any word that contains it, including the topic itself if needed.',
  commas: 'Comma count tasks: count the commas before you finish and match the requested number exactly; rephrase to add or remove commas rather than adding text.',
  frequency: 'Word frequency tasks: count the exact occurrences of the required word before you finish, including plurals and capitalized forms, and match the number exactly.',
};

// 120 prompts: 24 per class, each parameter value four times, each on its own topic. The forbidden-letter prompts take topics
// that do not contain their letter. Then the fixed stratified order: per class a seeded shuffle, twelve prompts to each half,
// each half shuffled. Positions 1 to 60 are the first half, 61 to 120 the second.
export function buildTasks(seed = SEED) {
  const rng = mulberry(seed);
  const pool = shuffle(TOPICS, rng);
  const tasks = [];
  const used = new Set();
  const takeTopic = pred => { const t = pool.find(x => !used.has(x) && (!pred || pred(x))); if (!t) throw new Error('topic pool exhausted'); used.add(t); return t; };
  // forbidden letters first, since they constrain the topic
  for (const cls of ['noletter', ...CLASS_IDS.filter(c => c !== 'noletter')]) {
    const params = shuffle(PARAMS[cls].flatMap(p => [p, p, p, p]), rng);
    params.forEach((p, k) => {
      const topic = cls === 'noletter' ? takeTopic(x => !x.toLowerCase().includes(p.letter)) : takeTopic();
      tasks.push({ id: `${cls}-${String(k + 1).padStart(2, '0')}`, cls, cue: CLASSES[cls].cue, paramCue: paramCue(cls, p), paramKey: paramKey(cls, p), topic, params: p, prompt: TEMPLATES[cls](topic, p) });
    });
  }
  const half1 = [], half2 = [];
  for (const cls of CLASS_IDS) { const mine = shuffle(tasks.filter(t => t.cls === cls), rng); half1.push(...mine.slice(0, 12)); half2.push(...mine.slice(12)); }
  const order = [...shuffle(half1, rng), ...shuffle(half2, rng)];
  return order.map((t, i) => ({ pos: i + 1, ...t }));
}

export function selfCheck(tasks) {
  const cues = CLASS_IDS.map(c => CLASSES[c].cue.toLowerCase());
  const problems = [];
  for (const t of tasks) {
    const p = t.prompt.toLowerCase();
    if (!p.includes(CLASSES[t.cls].cue.toLowerCase())) problems.push(`${t.id}: own cue missing`);
    if (!p.includes(t.paramCue.toLowerCase())) problems.push(`${t.id}: parameter cue missing from prompt`);
    for (const c of CLASS_IDS) if (c !== t.cls && p.includes(CLASSES[c].cue.toLowerCase())) problems.push(`${t.id}: contains cue of ${c}`);
    if (t.cls === 'noletter' && t.topic.toLowerCase().includes(t.params.letter)) problems.push(`${t.id}: topic contains the banned letter`);
  }
  // a parameter cue must match only prompts of its own class and parameter
  for (const t of tasks) for (const u of tasks) if (u.prompt.toLowerCase().includes(t.paramCue.toLowerCase()) && (u.cls !== t.cls || u.paramKey !== t.paramKey)) problems.push(`${t.id}: parameter cue also matches ${u.id}`);
  for (const topic of TOPICS) for (const cue of cues) if (topic.toLowerCase().includes(cue)) problems.push(`topic "${topic}" contains cue "${cue}"`);
  if (new Set(tasks.map(t => t.topic)).size !== tasks.length) problems.push('a topic is used twice');
  if (tasks.length !== 120) problems.push(`tasks ${tasks.length} != 120`);
  const suffix = '\n\nOutput only the response, nothing else.'.toLowerCase();
  for (const cue of cues) if (suffix.includes(cue)) problems.push(`suffix contains cue "${cue}"`);
  for (const c of CLASS_IDS) for (const cue of cues) if (cue !== CLASSES[c].cue.toLowerCase() && SUPPLIED_RULES[c].toLowerCase().includes(cue)) problems.push(`rule ${c} contains cue "${cue}"`);
  for (const c of CLASS_IDS) {
    const mine = tasks.filter(t => t.cls === c);
    if (mine.length !== 24) problems.push(`class ${c} has ${mine.length} prompts`);
    if (mine.filter(t => t.pos > 60).length !== 12) problems.push(`class ${c} has ${mine.filter(t => t.pos > 60).length} in the second half`);
    for (const p of PARAMS[c]) { const k = paramKey(c, p); const n = mine.filter(t => t.paramKey === k).length; if (n !== 4) problems.push(`class ${c} parameter ${k} used ${n} times`); }
  }
  return problems;
}
