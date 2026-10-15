import React, {useEffect, useRef, useState} from 'react';
import {ArrowUpRight, MessageSquare, Send, Sparkles, X} from 'lucide-react';
import {loadIndex, semanticRank, lexicalRank, choose, detectLang, forEmbedding} from './search';

// Exact FAQ questions, so they answer well even before the model has loaded.
const suggestions = ['What does he do now?', 'Does he have offshore experience?', 'Which projects use ROS?', 'Skill embedded apa saja?', 'How can I contact him?'];
const MODEL_MB = 150; // multilingual-e5-small q8 + tokenizer + ONNX runtime, downloaded once
const copy = {
  en: {none: "I couldn't find that in this portfolio. Try asking about Ansori's experience, projects, or skills, or email him directly.", from: 'From', open: 'Open page', related: 'Related'},
  id: {none: 'Maaf, saya tidak menemukan jawabannya di portofolio ini. Coba tanya tentang pengalaman, project, atau skill Ansori, atau hubungi langsung lewat email.', from: 'Dari', open: 'Buka halaman', related: 'Terkait'}
};
const greeting = {from: 'bot', text: "Hi! Ask me about Ansori's experience, projects, or skills. Bahasa Indonesia juga bisa.", links: []};

function linkProps(href) {
  if (/^https?:/.test(href)) return {href, target: '_blank', rel: 'noreferrer'};
  if (href.endsWith('.pdf')) return {href, download: true};
  return {href};
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([greeting]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  // model: off (keyword search, can be turned on) | loading | ready | failed (can retry) | unavailable
  const [model, setModel] = useState('off');
  const [progress, setProgress] = useState(0);
  const [failReason, setFailReason] = useState('');
  const index = useRef(null);
  const worker = useRef(null);
  const pending = useRef(new Map());
  const files = useRef({});
  const attempts = useRef(0);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);

  // A failed fetch is forgotten so the next question retries instead of failing for good.
  const getIndex = () => (index.current ??= fetch('/chat-index.json').then(r => {
    if (!r.ok) throw new Error('index ' + r.status);
    return r.json();
  }).then(loadIndex).catch(err => { index.current = null; throw err; }));

  // auto=true is the one silent retry after a failure; the model files are cached by
  // then, so the retry mostly re-fetches the ONNX runtime, which is what has stalled.
  async function startModel(auto = false) {
    if (worker.current) return;
    attempts.current = auto ? attempts.current + 1 : 1;
    let idx;
    try { idx = await getIndex(); } catch { return setModel('unavailable'); }
    if (!idx.vectors || typeof Worker === 'undefined') return setModel('unavailable');
    setModel('loading');
    const w = worker.current = new Worker(new URL('./worker.js', import.meta.url), {type: 'module'});
    // A failed or stalled load, or a crashed worker, must never leave the panel stuck on
    // "Loading" or a question unanswered: drop back to keyword search and allow a retry.
    // A stalled runtime download has been seen to hang without any error, hence the watchdog.
    let lastActivity = Date.now();
    const watchdog = setInterval(() => Date.now() - lastActivity > 90000 && fail('download stalled'), 5000);
    const fail = reason => {
      clearInterval(watchdog);
      w.terminate(); worker.current = null; files.current = {};
      pending.current.forEach(resolve => resolve(null)); pending.current.clear();
      // Shown in the status line, so a visitor (or the site owner) can tell a blocked
      // network from a phone running out of memory.
      setFailReason(String(reason || 'unknown error').slice(0, 80));
      if (attempts.current < 2) startModel(true);
      else setModel('failed');
    };
    w.onmessage = ({data}) => {
      lastActivity = Date.now();
      if (data.type === 'progress') {
        files.current[data.file] = data;
        const all = Object.values(files.current);
        setProgress(all.reduce((n, f) => n + f.loaded, 0) / Math.max(all.reduce((n, f) => n + f.total, 0), 1));
      } else if (data.type === 'ready') { clearInterval(watchdog); setModel('ready'); }
      else if (data.type === 'error') fail(data.message);
      else if (data.type === 'vector') {
        pending.current.get(data.id)?.(data.error ? null : data.vector);
        pending.current.delete(data.id);
      }
    };
    w.onerror = e => fail(e.message || 'worker crashed');
    w.postMessage({type: 'load', model: idx.model, dtype: idx.dtype});
  }

  useEffect(() => {
    if (!open) return;
    getIndex().catch(() => setModel('unavailable'));
    // Desktop visitors get the model straight away; on phones and data-saver
    // connections it waits for an explicit tap, since it is a 150 MB download.
    const saveData = navigator.connection?.saveData;
    if (!saveData && window.matchMedia('(min-width: 741px)').matches) startModel();
    inputRef.current?.focus();
    const esc = e => e.key === 'Escape' && close();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open]);

  useEffect(() => { listRef.current?.scrollTo({top: listRef.current.scrollHeight, behavior: 'smooth'}); }, [messages, busy]);

  // The launcher only exists while the panel is closed, so focus it after it renders.
  const wasOpen = useRef(false);
  useEffect(() => { if (!open && wasOpen.current) launcherRef.current?.focus(); wasOpen.current = open; }, [open]);

  function close() { setOpen(false); }

  const embed = text => new Promise(resolve => {
    const id = Math.random().toString(36).slice(2);
    pending.current.set(id, resolve);
    worker.current.postMessage({type: 'embed', id, text});
  });

  async function ask(raw) {
    const text = raw.trim().slice(0, 300);
    if (!text || busy) return;
    setInput('');
    setMessages(m => [...m, {from: 'user', text}]);
    setBusy(true);
    const lang = detectLang(text);
    let reply;
    try {
      const idx = await getIndex();
      const vector = model === 'ready' ? await embed(forEmbedding(text, lang)) : null;
      const result = choose(idx, vector ? semanticRank(idx, vector) : null, lexicalRank(idx, text));
      const t = copy[lang];
      if (!result) reply = {text: t.none, links: [['achad@achadansori.com', 'mailto:achad@achadansori.com']]};
      else if (result.item.k === 'faq') reply = {text: result.item.a[lang], links: result.item.links, related: result.related};
      else reply = {title: `${t.from} "${result.item.title}"`, text: result.item.text, links: [[t.open, result.item.href]], related: result.related};
      reply.relatedLabel = t.related;
    } catch {
      reply = {text: copy[lang].none, links: [['achad@achadansori.com', 'mailto:achad@achadansori.com']]};
    }
    setMessages(m => [...m, {from: 'bot', ...reply}]);
    setBusy(false);
  }

  // Following a link on a phone should show the page, not leave the sheet on top of it.
  const onPanelClick = e => { if (e.target.closest('a') && !window.matchMedia('(min-width: 741px)').matches) setOpen(false); };

  const status = {
    off: <>Quick keyword search. <button type="button" onClick={() => startModel()}><Sparkles size={13}/> Turn on smart search (~{MODEL_MB} MB, once)</button></>,
    loading: <>Loading smart search… {Math.round(progress * 100)}%<span className="chat-progress"><span style={{width: `${progress * 100}%`}}/></span></>,
    ready: <>Smart search on · runs in your browser</>,
    failed: <>Smart search couldn't load, using keyword search. <button type="button" onClick={() => startModel()}>Try again</button><small className="chat-fail-reason">{failReason}</small></>,
    unavailable: <>Quick keyword search</>
  }[model];

  return <>
    {!open && <button ref={launcherRef} className="chat-launcher" aria-label="Ask about my work" aria-expanded="false" aria-controls="chat-panel" onClick={() => setOpen(true)}><MessageSquare size={18}/><span>Ask about my work</span></button>}
    {open && <section id="chat-panel" className="chat-panel" role="dialog" aria-labelledby="chat-title" onClick={onPanelClick}>
      <div className="chat-head"><div><div className="eyebrow">PORTFOLIO ASSISTANT</div><h2 id="chat-title">Ask about Ansori</h2></div><button className="chat-close" aria-label="Close assistant" onClick={close}><X size={18}/></button></div>
      <div className="chat-status">{status}</div>
      <div className="chat-messages" ref={listRef} aria-live="polite">
        {messages.map((m, i) => <div key={i} className={'chat-msg ' + m.from}>
          {m.title && <strong>{m.title}</strong>}
          <p>{m.text}</p>
          {m.links?.length > 0 && <div className="chat-links">{m.links.map(([label, href]) => <a key={href} {...linkProps(href)}>{label} <ArrowUpRight size={13}/></a>)}</div>}
          {m.related?.length > 0 && <div className="chat-related"><span>{m.relatedLabel}:</span>{m.related.map(r => <a key={r.href} href={r.href}>{r.label}</a>)}</div>}
        </div>)}
        {busy && <div className="chat-msg bot typing" role="status" aria-label="Searching"><span/><span/><span/></div>}
        {messages.length === 1 && <div className="chat-suggestions">{suggestions.map(s => <button key={s} type="button" onClick={() => ask(s)}>{s}</button>)}</div>}
      </div>
      <form className="chat-input" onSubmit={e => { e.preventDefault(); ask(input); }}>
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} maxLength={300} placeholder="Ask in English or Bahasa Indonesia…" aria-label="Your question"/>
        <button type="submit" aria-label="Send" disabled={!input.trim() || busy}><Send size={17}/></button>
      </form>
      <p className="chat-note">Answers come only from this portfolio. For anything else, <a href="mailto:achad@achadansori.com">email Ansori</a>.</p>
    </section>}
  </>;
}
