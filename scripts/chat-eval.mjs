// Checks the portfolio assistant against known questions: `npm run chat:eval`.
// Run it after editing src/chat/faq.json or the thresholds in src/chat/search.js.
// Each case lists acceptable answers: a FAQ id, a page path, or null when the
// assistant should admit it has no answer.
import fs from 'node:fs';
import path from 'node:path';
import { pipeline, env } from '@huggingface/transformers';
import { loadIndex, semanticRank, lexicalRank, choose, detectLang, forEmbedding } from '../src/chat/search.js';

const cases = [
  ['What does Ansori do?', ['intro', 'current-role']],
  ['Where does he work now?', ['current-role']],
  ['Has he worked offshore?', ['offshore-rov']],
  ['Which projects use ROS?', ['ros']],
  ['What microcontrollers has he programmed?', ['skills-embedded']],
  ['Can he design a PCB?', ['skills-hardware']],
  ['What awards has he won?', ['awards']],
  ['How do I contact him?', ['contact']],
  ['Is he looking for a job?', ['availability']],
  ['How does Jaladhi avoid collisions?', ['/projects/q_jaladhi/', 'jaladhi']],
  ['Explain the vehicle he built for the underwater robot contest', ['e-auv', '/projects/f_emosver/', 'marine-robotics']],
  ['Sistem deteksi helm cara kerjanya bagaimana?', ['safety-detection', '/projects/safety-detection/']],
  ['What frame rate did the defect detection reach?', ['/projects/b_toshin_cv/', 'computer-vision']],
  ['Tell me about the smart door lock', ['/projects/m_smartdoorlock/']],
  ['How much overshoot did the bicopter have?', ['/projects/n_bicopterpid/', 'control']],
  ['Is there a YOLOv11 tutorial?', ['/blog/2025/complete-guide-yolov11-object-detection/']],
  ['Did he build an aerator for fish ponds?', ['/projects/e_venambak_autove/', 'aquaculture']],
  ['Pengalaman kerja di offshore?', ['offshore-rov']],
  ['Bisa bikin PCB?', ['skills-hardware']],
  ['Kuliah di mana?', ['education']],
  ['Project yang pakai ROS apa saja?', ['ros']],
  ['Juara apa saja?', ['awards']],
  ['Bagaimana cara menghubunginya?', ['contact']],
  ['Berapa gajinya?', ['availability']],
  ['Ceritakan tentang kapal Jaladhi', ['/projects/q_jaladhi/', 'jaladhi', 'education']],
  ['Pernah bikin alat pakan ikan otomatis?', ['/projects/d_venambak_feederve/', 'production', 'aquaculture']],
  ['Does he know CAN bus?', ['skills-embedded', 'current-role']],
  ['Has he trained neural networks?', ['computer-vision', 'bangkit']],
  ['Has he used LiDAR?', ['/projects/q_jaladhi/', '/projects/j_asv_2024/', '/projects/k_jalavahana/', 'ros', 'computer-vision']],
  ['Apakah dia pernah memimpin tim?', ['leadership']],
  ['Bahasa pemrograman yang dikuasai?', ['skills-programming']],
  // Casual Indonesian, typed the way visitors actually type on a phone.
  ['ansori sedang kerja dimana', ['current-role']],
  ['lagi kerja apa sekarang', ['current-role']],
  ['dia lulusan mana', ['education']],
  ['kontaknya apa', ['contact']],
  ['sertifikatnya apa aja', ['certifications']],
  ['punya pengalaman robot bawah air?', ['e-auv', 'marine-robotics', '/projects/f_emosver/']],
  ['keahliannya di bidang apa', ['intro', 'skills-embedded', 'skills-hardware', 'skills-programming']],
  ['dia bisa apa saja', ['intro']],
  ['kemampuannya apa aja', ['intro']],
  ['Bisa bahasa apa saja?', ['languages']],
  ['Pakai software CAD apa?', ['cad']],
  ['Hobinya apa aja?', ['hobbies']],
  ['Does he like running?', ['hobbies']],
  // The suggestion buttons as shown in the Indonesian interface (src/i18n.js).
  ['Project mana yang pakai ROS?', ['ros']],
  ['Tell me a joke', [null]],
  ['What is 2 + 2?', [null]],
  ["What's the weather today?", [null]],
  ['Write me a poem about cats', [null]],
  ['Who won the 2022 World Cup?', [null]],
  ['Cuaca hari ini bagaimana?', [null]],
  ['Resep nasi goreng yang enak', [null]],
  ['Siapa presiden Indonesia?', [null]],
];

const json = JSON.parse(fs.readFileSync('public/chat-index.json', 'utf8'));
const index = loadIndex(json);
if (!index.vectors) throw new Error('public/chat-index.json has no vectors; run `npm run chat:index` first.');
env.cacheDir = path.resolve('.cache/transformers');
const extract = await pipeline('feature-extraction', index.model, { dtype: index.dtype });

const label = r => (r ? (r.item.k === 'faq' ? r.item.id : r.item.href) : null);
const quiet = process.argv.includes('--quiet');
let pass = 0, keywordPass = 0;
for (const [question, expected] of cases) {
  const q = (await extract('query: ' + forEmbedding(question, detectLang(question)), { pooling: 'mean', normalize: true })).data;
  const ranked = semanticRank(index, q);
  const lexical = lexicalRank(index, question);
  const got = choose(index, ranked, lexical, question);
  const keyword = choose(index, null, lexical, question); // what visitors get before the model loads
  const ok = expected.includes(label(got));
  pass += ok;
  keywordPass += expected.includes(label(keyword));
  const top = r => `${label({ item: index.items[r.item] })} ${r.score.toFixed(3)}`;
  const topFaq = ranked.find(r => index.items[r.item].k === 'faq');
  const topPage = ranked.find(r => index.items[r.item].k === 'page');
  if (quiet && ok && !expected.includes(label(keyword))) console.log(`kw    ${question}\n      keyword-only → ${label(keyword)}`);
  if (!quiet || !ok) console.log(`${ok ? 'PASS' : 'FAIL'}  ${question}\n      → ${label(got)}${got ? ' ' + got.score.toFixed(3) : ''}   [faq ${top(topFaq)} | page ${top(topPage)}]   keyword-only: ${label(keyword)}${got?.related.length ? '\n      related: ' + got.related.map(r => r.label).join(', ') : ''}`);
}
console.log(`\n${pass}/${cases.length} passed (keyword-only fallback: ${keywordPass}/${cases.length})`);
process.exitCode = pass === cases.length ? 0 : 1;
