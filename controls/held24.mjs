// The 24 held-out constraints of the 2026-08-25 cost pilot (exp-3-4.mjs), extracted verbatim as a module.
const stripFence = t => t.replace(/```json|```/g, '').trim();
const words = t => t.split(/\s+/).filter(Boolean);
const sentences = t => t.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
export const HELD24 = [
  { id:'w15', p:'Write exactly 15 words. Output only the text.', c:t=>words(t).length===15 },
  { id:'w25', p:'Write exactly 25 words. Output only the text.', c:t=>words(t).length===25 },
  { id:'no-t', p:'Write one sentence with no letter t. Output only the sentence.', c:t=>!/[tT]/.test(t)&&sentences(t).length>=1 },
  { id:'upper-10-15', p:'Write 10 to 15 words in ALL UPPERCASE. Output only the text.', c:t=>{const n=words(t).length;const L=t.replace(/[^A-Za-z]/g,'');return L===L.toUpperCase()&&n>=10&&n<=15;} },
  { id:'json-id-status', p:'Output only valid JSON with exactly the keys id and status, where status is "ok" or "fail". No prose.', c:t=>{try{const o=JSON.parse(stripFence(t));return Object.keys(o).sort().join(',')==='id,status'&&['ok','fail'].includes(o.status);}catch{return false;}} },
  { id:'bul3', p:'Output exactly 3 bullet points, each line starting with "- ". No other text.', c:t=>t.split('\n').filter(l=>l.trim().startsWith('- ')).length===3 },
  { id:'bul7', p:'Output exactly 7 bullet points, each line starting with "- ". No other text.', c:t=>t.split('\n').filter(l=>l.trim().startsWith('- ')).length===7 },
  { id:'sentT', p:'Write 2 sentences that each start with the letter T. Output only the sentences.', c:t=>{const s=sentences(t);return s.length>=2&&s.every(x=>/^t/i.test(x));} },
  { id:'test-x4', p:'Write a short paragraph where the word "test" appears exactly 4 times. Output only the paragraph.', c:t=>(t.toLowerCase().match(/\btest\b/g)||[]).length===4 },
  { id:'w40', p:'Write exactly 40 words. Output only the text.', c:t=>words(t).length===40 },
  { id:'short5-12', p:'Write at least 12 words where no word exceeds 5 letters. Output only the text.', c:t=>{const w=words(t).map(x=>x.replace(/[^A-Za-z]/g,''));return w.length>=12&&!w.find(x=>x.length>5);} },
  { id:'digits3', p:'Write a sentence containing exactly three digit characters. Output only the sentence.', c:t=>(t.match(/[0-9]/g)||[]).length===3 },
  { id:'jsonnum2', p:'Output only a valid JSON array of exactly 2 numbers. No prose.', c:t=>{try{const a=JSON.parse(stripFence(t));return Array.isArray(a)&&a.length===2&&a.every(x=>typeof x==='number');}catch{return false;}} },
  { id:'sent4', p:'Write exactly 4 sentences. Output only the sentences.', c:t=>sentences(t).length===4 },
  { id:'ends-done', p:'Write two sentences; the whole response must end with the exact word: done. Output only the text.', c:t=>/done\.?$/i.test(t.trim())&&sentences(t).length>=2 },
];
