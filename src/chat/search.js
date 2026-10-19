// Answer selection for the portfolio assistant. Pure functions, shared by the
// widget and the calibration script, so thresholds tested in Node match the site.

// multilingual-e5 squeezes cosine scores into a narrow band (unrelated text still
// lands around 0.75), so these were tuned with scripts/chat-eval.mjs, not picked by feel.
// lex: weight of keyword overlap when ranking. Small models match sentence shape
// ("Tell me about X") strongly, so a named project in the question needs the help.
// relief: how far below the threshold a result may score if the keywords agree.
// Acceptance always looks at the semantic score, so off-topic questions that share
// a single word with the portfolio still get no answer.
export const T = { faq: 0.88, page: 0.83, lex: 0.06, relief: 0.03, related: 0.84 };

export function loadIndex(json) {
  const index = { items: json.items, model: json.model, dtype: json.dtype, vectors: null };
  if (json.vectors) {
    const { dim, owners, data } = json.vectors;
    const bytes = Uint8Array.from(atob(data), c => c.charCodeAt(0));
    const raw = new Int8Array(bytes.buffer);
    const vecs = new Float32Array(raw.length);
    for (let r = 0; r < owners.length; r++) {
      let norm = 0;
      for (let d = 0; d < dim; d++) norm += raw[r * dim + d] ** 2;
      norm = Math.sqrt(norm) || 1;
      for (let d = 0; d < dim; d++) vecs[r * dim + d] = raw[r * dim + d] / norm;
    }
    index.vectors = { dim, owners, vecs };
  }
  index.lexical = buildLexical(index.items);
  return index;
}

// Best score per item for a normalised query vector, highest first.
export function semanticRank(index, query) {
  const { dim, owners, vecs } = index.vectors;
  const best = new Map();
  for (let r = 0; r < owners.length; r++) {
    let s = 0;
    for (let d = 0; d < dim; d++) s += vecs[r * dim + d] * query[d];
    if (s > (best.get(owners[r]) ?? -1)) best.set(owners[r], s);
  }
  return [...best].map(([item, score]) => ({ item, score })).sort((a, b) => b.score - a.score);
}

const STOP = new Set(('a an the is are was were be been do does did of to in on at for with and or but by from as it its this that these those what which who whom how where when why can could would should will has have had he his him she her you your i me my we our they them about any some there tell show give me please ' +
  'apa apakah siapa bagaimana gimana berapa mana kapan kenapa mengapa yang dan atau di ke dari untuk dengan pada ini itu ada adalah saja aja sih dong kah nya dia ia kamu anda saya aku tolong mau ingin bisa sudah belum pernah punya tentang ceritakan jelaskan sebutkan bikin buat membuat use used uses using pakai memakai menggunakan ' +
  'sedang lagi dimana kemana darimana adakah ya yah nih kok deh sama juga aja apa2 like likes suka ' +
  // The whole portfolio is about him, so his name says nothing about the topic.
  'ansori achad muhammad').split(' '));
// Light stemming so kerja / bekerja / pekerjaan meet, and so do programmed / programming
// and microcontroller(s). It runs on the query and the documents alike, so a word that
// gets trimmed oddly still only matches itself.
const SUFFIX = /(kan|an|i)$/, PREFIX = /^(meng|meny|mem|men|me|peng|peny|pem|pen|pe|ber|be|ter|di|ke)/, EN_SUFFIX = /(ing|ed|es|s)$/;
const stem = w => {
  if (w.length < 5 || /\d/.test(w)) return w;
  const en = w.replace(EN_SUFFIX, '');
  if (en !== w && en.length >= 4) return en;
  if (w.length < 6) return w;
  const s = w.replace(SUFFIX, '');
  const p = s.replace(PREFIX, '');
  return p.length >= 4 ? p : s;
};
// "CAN" is a bus, "can" is a stop word; RPLIDAR is a LiDAR and YOLOv8 is a YOLO.
const tokenize = s => s.replace(/\bCAN\b|\bcan[ -]?bus\b/gi, m => (m === 'CAN' || /bus/i.test(m) ? ' canbus ' : m))
  .toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}+#]+/gu, ' ').split(' ')
  .map(w => w.replace(/nya$/, '')).filter(w => w.length > 1 && !STOP.has(w))
  .flatMap(w => (/^yolov\d+$/.test(w) ? [w, 'yolo'] : /.lidar$/.test(w) ? [w, 'lidar'] : [stem(w)]));

// Small BM25 over each item's search text, used before the model is ready or when it can't load.
function buildLexical(items) {
  const docs = items.map(it => tokenize(it.s));
  const df = new Map();
  docs.forEach(d => new Set(d).forEach(w => df.set(w, (df.get(w) ?? 0) + 1)));
  const avg = docs.reduce((n, d) => n + d.length, 0) / docs.length;
  return { docs, df, avg, n: docs.length };
}

// cover is the share of the question's keywords the item contains.
export function lexicalRank(index, query) {
  const { docs, df, avg, n } = index.lexical;
  const terms = [...new Set(tokenize(query))];
  return docs.map((doc, item) => {
    let score = 0, hits = 0;
    for (const t of terms) {
      const tf = doc.filter(w => w === t).length;
      if (!tf) continue;
      hits++;
      const idf = Math.log(1 + (n - df.get(t) + 0.5) / (df.get(t) + 0.5));
      score += idf * (tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * doc.length / avg));
    }
    return { item, score, cover: hits / terms.length };
  }).filter(r => r.score > 0).sort((a, b) => b.score - a.score);
}

const ID_WORDS = /\b(apa|apakah|siapa|bagaimana|gimana|berapa|dimana|mana|kapan|kenapa|mengapa|yang|dan|atau|dengan|untuk|dari|pernah|punya|bisa|sudah|belum|saya|kamu|anda|dia|ini|itu|ada|tentang|pengalaman|kerja|bekerja|kuliah|lulus|keahlian|proyek|ceritakan|jelaskan|tolong|mau|ingin|juara|cara|menghubungi|sekarang|sedang|lagi|saja|aja|dong|nya)\b/gi;
const EN_WORDS = /\b(what|who|how|where|when|why|which|does|did|is|are|has|have|can|the|and|with|about|tell|his|he|you|your|experience|work|projects?)\b/gi;
export const detectLang = s => ((s.match(ID_WORDS) ?? []).length > (s.match(EN_WORDS) ?? []).length ? 'id' : 'en');

// Text sent to the embedding model, for visitor questions and FAQ questions alike.
// His name pulls any question towards "Who is Ansori?", so it becomes a pronoun.
const NAME = String.raw`\b(?:muhammad\s+)?(?:achad\s+)?ansori`;
export const forEmbedding = (s, lang) => lang === 'id'
  ? s.replace(new RegExp(NAME + 'nya\\b|' + NAME + '\\b', 'gi'), 'dia')
  : s.replace(new RegExp(NAME + "['’]s\\b", 'gi'), 'his').replace(new RegExp(NAME + '\\b', 'gi'), 'he');

// How a typed question is compared with the FAQ's own: lower case, no punctuation, and
// without filler words, so "dia bisa apa", "Dia bisa apa saja?" and "dia bisa apa sih" meet.
const FILLER = new Set('saja aja sih dong ya yah nih kah deh kok please tolong'.split(' '));
export const normalizeQuestion = s => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
  .split(' ').filter(w => !FILLER.has(w)).join(' ');

// Picks the reply. sem is semanticRank() output, or null before the model is ready,
// in which case only the keyword ranking is used. question enables the exact-match
// shortcut, which answers questions made only of common words ("Dia bisa apa saja?")
// that keyword search has nothing to go on for.
export function choose(index, sem, lex, question = '') {
  const item = r => index.items[r.item];
  const asked = normalizeQuestion(question);
  const exact = asked ? index.items.findIndex(it => it.k === 'faq' && it.q?.includes(asked)) : -1;
  if (exact >= 0) return { item: index.items[exact], score: 1, related: [] };
  const lexMax = lex[0]?.score || 0;
  const lexOf = new Map(lex.map(r => [r.item, r.score / lexMax]));
  let ranked, accept;
  if (sem) {
    ranked = sem.map(r => ({ item: r.item, sem: r.score, lex: lexOf.get(r.item) ?? 0 }))
      .map(r => ({ ...r, score: r.sem + T.lex * r.lex })).sort((a, b) => b.score - a.score);
    accept = r => {
      const t = item(r).k === 'faq' ? T.faq : T.page;
      return r.sem >= t || (r.sem >= t - T.relief && r.lex >= 0.5);
    };
  } else {
    // BM25 has no absolute scale; a curated answer reads better than an excerpt,
    // so it gets a little room over a page that matched slightly better.
    // Without the model there is no sense of meaning, so a match must also cover most
    // of the question: "Who won the World Cup?" shares only "won" with the awards answer.
    ranked = lex.map(r => ({ item: r.item, lex: r.score / lexMax, cover: r.cover, score: r.score * (item(r).k === 'faq' ? 1.25 : 1) }))
      .sort((a, b) => b.score - a.score);
    accept = r => lexMax >= 2 && r.lex >= 0.5 && r.cover > 0.5;
  }
  const pick = ranked.find(accept);
  if (!pick) return null;
  const chosen = item(pick);
  const seen = new Set([chosen.href, ...(chosen.links ?? []).map(l => l[1])]);
  const related = [];
  for (const r of ranked) {
    if (related.length === 3) break;
    const it = item(r);
    const close = sem ? r.sem >= Math.max(T.related, pick.sem - 0.05) : r.lex >= 0.6;
    if (!close || it.k !== 'page' || seen.has(it.href)) continue;
    seen.add(it.href);
    related.push({ label: it.kind === 'cv' ? 'Experience & CV' : it.title.split(': ')[0], href: it.href });
  }
  return { item: chosen, score: pick.sem ?? pick.score, related };
}
