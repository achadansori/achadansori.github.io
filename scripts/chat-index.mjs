// Builds public/chat-index.json for the portfolio assistant (src/chat).
// Every FAQ question and every section of the project, CV, and article pages is
// embedded here with the same model the browser loads, so the browser only has to
// embed the visitor's question. If the model cannot be downloaded, the index is
// still written without vectors and the widget falls back to keyword search.
import fs from 'node:fs';
import path from 'node:path';
import { forEmbedding } from '../src/chat/search.js';

const MODEL = 'Xenova/multilingual-e5-small';
const DTYPE = 'q8';
const OUT = 'public/chat-index.json';

const content = JSON.parse(fs.readFileSync('src/content.json', 'utf8'));
const faq = JSON.parse(fs.readFileSync('src/chat/faq.json', 'utf8'));

const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', middot: '·', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '—', times: '×', hellip: '…' };
const decode = s => s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => e[0] === '#' ? String.fromCodePoint(parseInt(e[1] === 'x' ? e.slice(2) : e.slice(1), e[1] === 'x' ? 16 : 10)) : entities[e] ?? ' ');
const text = html => decode(html.replace(/<(script|style|iframe)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
// Short excerpt for the chat bubble, cut at a sentence end where possible.
const snippet = (s, max = 300) => {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
  return (end > max * 0.5 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, '') + '…');
};

const items = [];
const inputs = []; // [itemIndex, textToEmbed]

for (const f of faq) {
  const i = items.push({ k: 'faq', id: f.id, a: f.a, links: f.links, s: [...f.q.en, ...f.q.id, f.a.en, f.a.id].join(' ') }) - 1;
  for (const lang of ['en', 'id']) for (const q of f.q[lang]) inputs.push([i, 'query: ' + forEmbedding(q, lang)]);
}

// minBody drops write-up sections that are only a heading over images or video.
const addPage = (title, href, body, kind, minBody = 40) => {
  if (body.length < minBody) return;
  const i = items.push({ k: 'page', kind, title, href, text: snippet(body), s: title + ' ' + body }) - 1;
  inputs.push([i, 'passage: ' + (title + '. ' + body).slice(0, 1200)]);
};

for (const page of content.pages) {
  if (page.type === 'cv') {
    // One chunk per CV entry, linked to its section anchor.
    for (const card of page.html.split(/<div class="card"/).slice(1)) {
      const anchor = card.match(/^\s*id="([^"]+)"/)?.[1];
      const section = text(card.match(/<h2>([\s\S]*?)<\/h2>/)?.[1] ?? '');
      const entries = card.split('<li class="list-group-item">').slice(1);
      for (const entry of entries.length ? entries : [card]) {
        const heading = text(entry.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)?.[1] ?? '');
        // CV entries such as awards are short by nature (year and issuer), so keep them all.
        addPage(heading ? `${section}: ${heading}` : section, '/cv/' + (anchor ? '#' + anchor : ''), text(entry.replace(/<h3[\s\S]*?<\/h3>/, '')), 'cv', 1);
      }
    }
    continue;
  }
  // Articles carry no description, so their opening paragraphs stand in for one.
  addPage(page.title, page.path, page.description || snippet(text(page.html), 600), page.type);
  if (page.type !== 'project') continue; // articles are long; the opening is enough to route a question
  // One chunk per heading section of the project write-up.
  const parts = page.html.split(/<h[23][^>]*>/i).slice(1);
  for (const part of parts) {
    const [head, ...rest] = part.split(/<\/h[23]>/i);
    const heading = text(head);
    if (heading === page.title) continue;
    addPage(`${page.title}: ${heading}`, page.path, text(rest.join(' ')), 'project');
  }
}

let vectors = null;
try {
  const { pipeline, env } = await import('@huggingface/transformers');
  env.cacheDir = path.resolve('.cache/transformers');
  const extract = await pipeline('feature-extraction', MODEL, { dtype: DTYPE });
  const dim = 384;
  const all = new Int8Array(inputs.length * dim);
  for (let b = 0; b < inputs.length; b += 32) {
    const batch = inputs.slice(b, b + 32);
    const out = (await extract(batch.map(x => x[1]), { pooling: 'mean', normalize: true })).tolist();
    out.forEach((v, j) => {
      // int8 keeps the index small; the browser renormalises, so no scale is stored.
      const peak = Math.max(...v.map(Math.abs)) || 1;
      v.forEach((x, d) => { all[(b + j) * dim + d] = Math.round((x / peak) * 127); });
    });
  }
  vectors = { dim, owners: inputs.map(x => x[0]), data: Buffer.from(all.buffer).toString('base64') };
} catch (err) {
  console.warn(`::warning::Chat index built without vectors (keyword search only): ${err.message}`);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ model: MODEL, dtype: DTYPE, items, vectors }));
console.log(`Chat index: ${items.length} items, ${inputs.length} vectors${vectors ? '' : ' (not embedded)'}, ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB.`);
