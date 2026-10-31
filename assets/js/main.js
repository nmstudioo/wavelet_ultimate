/* Wavelet Reference — main.js (v3). Vanilla ES2020, no dependencies. */
(() => {
'use strict';
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const token = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const hex2rgb = h => { const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h || ''); return m ? [1, 2, 3].map(i => parseInt(m[i], 16)) : [255, 155, 94]; };
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t)), rgb = c => `rgb(${c})`;
const ease = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
const svgEl = (t, a = {}) => { const e = document.createElementNS('http://www.w3.org/2000/svg', t); for (const k in a) e.setAttribute(k, a[k]); return e; };
const sg = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v);

/* Toast */
const Toast = (() => { const el = $('#toast'), m = $('#toastMsg'); let t; return { show(s) { if (!el) return; m.textContent = s; el.classList.add('is-visible'); clearTimeout(t); t = setTimeout(() => el.classList.remove('is-visible'), 2200); } }; })();
const write = async s => { try { await navigator.clipboard.writeText(s); return true; } catch { try { const a = Object.assign(document.createElement('textarea'), { value: s }); a.style.cssText = 'position:fixed;opacity:0'; document.body.append(a); a.select(); const ok = document.execCommand('copy'); a.remove(); return ok; } catch { return false; } } };

/* Theme */
const Theme = (() => {
  const K = 'wavelet-theme', root = document.documentElement, btn = $('#themeToggle'), meta = $('meta[name=theme-color]');
  const BG = { dark: '#080b0d', light: '#f0f3f0' };
  const apply = (t, persist = true) => {
    root.dataset.theme = t; meta && (meta.content = BG[t]); btn && btn.setAttribute('aria-pressed', t === 'light');
    if (persist) try { localStorage.setItem(K, t); } catch {}
    document.dispatchEvent(new Event('themechange'));
  };
  return { init() {
    btn && btn.addEventListener('click', () => apply(root.dataset.theme === 'dark' ? 'light' : 'dark'));
    matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => { let s; try { s = localStorage.getItem(K); } catch {} if (!s) apply(e.matches ? 'light' : 'dark', false); });
    apply(root.dataset.theme === 'light' ? 'light' : 'dark', false);
  } };
})();

/* Reading progress + back-to-top ring (single rAF-throttled handler) */
const Progress = (() => {
  const bar = $('#progress'), btn = $('#backTop'), ring = $('#btProg'), C = 2 * Math.PI * 19; let tick = false;
  const upd = () => { tick = false; const max = document.documentElement.scrollHeight - innerHeight, p = max > 0 ? Math.min(1, scrollY / max) : 0;
    bar && (bar.style.transform = `scaleX(${p})`); btn && btn.classList.toggle('is-visible', scrollY > 420); ring && (ring.style.strokeDashoffset = C * (1 - p)); };
  const on = () => { if (!tick) { tick = true; requestAnimationFrame(upd); } };
  return { init() { ring && (ring.style.strokeDasharray = C); addEventListener('scroll', on, { passive: true }); addEventListener('resize', on, { passive: true });
    btn && btn.addEventListener('click', () => scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' })); upd(); } };
})();

/* Reveal + in-view data graphics */
const Reveal = { init() {
  setTimeout(() => $$('.hero [data-d]').forEach(e => e.classList.add('is-in')), 60);
  const obs = (sel, cls, o) => { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add(cls); io.unobserve(e.target); } }), o); $$(sel).forEach(e => io.observe(e)); };
  obs('.reveal', 'is-in', { threshold: .05, rootMargin: '0px 0px -4% 0px' });
  obs('[data-animate]', 'in-view', { threshold: .15 });
} };

/* Scrollspy: updates nav + keeps active link visible in the sidebar */
const Spy = { init() {
  const links = $$('.side-nav a[data-spy]'), secs = $$('main section[id]'); if (!links.length) return;
  const set = id => links.forEach(a => { const on = a.dataset.spy === id; a.classList.toggle('is-active', on); on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
    if (on) { const sc = a.closest('.side-scroll'), r = a.getBoundingClientRect(), s = sc.getBoundingClientRect(); if (r.top < s.top || r.bottom > s.bottom) a.scrollIntoView({ block: 'nearest', behavior: REDUCED ? 'auto' : 'smooth' }); } });
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && set(e.target.id)), { rootMargin: '-20% 0px -65% 0px' });
  secs.forEach(s => io.observe(s));
  const h = location.hash.slice(1); if (h && secs.some(s => s.id === h)) set(h);
} };

/* Drawer */
const Drawer = (() => {
  const side = $('#sidebar'), ov = $('#sideOverlay'), tg = $('#navToggle'), mq = matchMedia('(max-width:1024px)'); let last = null;
  const isOpen = () => side.classList.contains('is-open');
  const open = () => { last = document.activeElement; side.classList.add('is-open'); ov.classList.add('is-open'); tg.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; setTimeout(() => ($('#navFilter') || side).focus(), 320); };
  const close = () => { side.classList.remove('is-open'); ov.classList.remove('is-open'); tg.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; last && last.focus && last.focus(); last = null; };
  return { mq, isOpen, open, init() {
    tg.addEventListener('click', () => isOpen() ? close() : open()); ov.addEventListener('click', close);
    $$('a', side).forEach(a => a.addEventListener('click', () => isOpen() && close()));
    document.addEventListener('keydown', e => { if (!isOpen()) return; if (e.key === 'Escape') return close();
      if (e.key === 'Tab') { const f = $$('a[href],button,input', side).filter(x => x.offsetParent); if (!f.length) return; const a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } } });
    mq.addEventListener('change', e => { if (!e.matches && isOpen()) close(); });
  } };
})();

/* Nav filter: "/" focuses, Esc clears */
const NavFilter = { init() {
  const inp = $('#navFilter'), empty = $('#sideEmpty'), groups = $$('[data-group]'), links = $$('.side-nav a'); if (!inp) return;
  const run = () => { const q = inp.value.trim().toLowerCase(); let n = 0;
    links.forEach(a => { const m = !q || a.textContent.toLowerCase().includes(q); a.parentElement.hidden = !m; m && n++; });
    groups.forEach(g => g.hidden = ![...g.querySelectorAll('li')].some(l => !l.hidden)); empty && (empty.hidden = n !== 0 || !q); };
  inp.addEventListener('input', run);
  document.addEventListener('keydown', e => { const t = e.target, typing = t instanceof HTMLElement && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName));
    if (e.key === '/' && !typing) { e.preventDefault(); Drawer.mq.matches && !Drawer.isOpen() && Drawer.open(); inp.focus(); inp.select(); }
    else if (e.key === 'Escape' && t === inp) { if (inp.value) { inp.value = ''; run(); } else inp.blur(); }
    else if (e.key === 'Enter' && t === inp) { const f = links.find(a => !a.parentElement.hidden); f && f.click(); } });
} };

/* Anchors: hover a section title → copy deep link */
const Anchors = { init() {
  $$('.sec .sec-title').forEach(h => { const id = h.closest('section').id; if (!id) return;
    const b = Object.assign(document.createElement('button'), { className: 'anchor', type: 'button', textContent: '#' });
    b.setAttribute('aria-label', `Copy link to ${h.textContent.trim()}`);
    b.addEventListener('click', async () => { const u = location.href.split('#')[0] + '#' + id; history.replaceState(null, '', '#' + id); Toast.show(await write(u) ? 'Section link copied' : 'Link set in address bar'); });
    h.append(b); });
} };

/* Hero chart: frequency response with ghost comparison + scrub readout */
const Chart = (() => {
  const svg = $('#eqChart'), seg = $('#curveSeg'), cap = $('#eqCaption');
  const F = [62.5, 125, 250, 500, 1000, 2000, 4000, 8000, 10000], L = ['62.5', '125', '250', '500', '1k', '2k', '4k', '8k', '10k'];
  const S = { redmi: [-6, -4, -2, 0, 0, 0, -1, -3, -4], kz: Array(9).fill(0) };
  const CAP = { redmi: 'Redmi 12 · built-in speaker — Graphic Equalizer baseline, unchanged in v2.0. Hover or use ← → to read each band.',
                kz: 'KZ EDX Pro · wired IEM — Graphic EQ flat at 0 dB: AutoEq is the only active correction layer (see Feature 01).' };
  const W = 760, H = 300, P = { l: 46, r: 20, t: 20, b: 48 }, TOP = 6, BOT = -8, OCT = Math.log2(F[8] / F[0]);
  const y = db => P.t + (TOP - db) / (TOP - BOT) * (H - P.t - P.b), x = i => P.l + Math.log2(F[i] / F[0]) / OCT * (W - P.l - P.r);
  let area, path, ghost, dots = [], guides = [], stops = [], tip, key = 'redmi', raf, sel = -1, cur = S.redmi.slice();
  const col = k => hex2rgb(token(k === 'kz' ? '--sig2' : '--sig'));
  const spline = pts => { let d = `M${pts[0]}`; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i - 1] || pts[i], b = pts[i], c = pts[i + 1], e = pts[i + 2] || c;
    d += `C${[b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6, c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6, c[0], c[1]].map(n => n.toFixed(1))}`; } return d; };
  const pts = v => v.map((n, i) => [x(i), y(n)]);
  const paint = (v, c) => { cur = v; const p = pts(v), d = spline(p);
    path.setAttribute('d', d); path.setAttribute('stroke', rgb(c));
    area.setAttribute('d', `${d}L${p[8][0]},${y(0)}L${p[0][0]},${y(0)}Z`); area.setAttribute('fill', 'url(#cg)'); stops.forEach(s => s.setAttribute('stop-color', rgb(c)));
    dots.forEach((o, i) => { o.setAttribute('cx', p[i][0]); o.setAttribute('cy', p[i][1]); o.style.color = rgb(c); o.setAttribute('stroke', rgb(c)); });
    sel >= 0 && place(sel); };
  const paintGhost = () => { const o = key === 'kz' ? 'redmi' : 'kz'; ghost.setAttribute('d', spline(pts(S[o]))); ghost.setAttribute('stroke', rgb(col(o))); };
  const select = i => { sel = i; dots.forEach((d, j) => d.classList.toggle('on', j === i)); guides.forEach((g, j) => g.classList.toggle('on', j === i)); tip.style.display = i < 0 ? 'none' : ''; i >= 0 && place(i); };
  const place = i => { const v = S[key][i], px = x(i), py = y(cur[i]), w = 118, tx = Math.min(Math.max(px - w / 2, P.l), W - P.r - w), ty = py < 80 ? py + 16 : py - 46;
    tip.setAttribute('transform', `translate(${tx} ${ty})`); const t = $$('text', tip); $('rect', tip).setAttribute('width', w);
    t[0].textContent = `${L[i]} Hz`; t[1].textContent = `${sg(v)} dB`; t[1].setAttribute('x', w - 10); t[1].setAttribute('text-anchor', 'end'); };
  const nearest = e => { const r = svg.getBoundingClientRect(), px = (e.clientX - r.left) * W / r.width; let b = 0, bd = 1e9; F.forEach((_, i) => { const d = Math.abs(x(i) - px); d < bd && (bd = d, b = i); }); return b; };
  const show = (k, anim = true) => {
    const from = cur.slice(), fc = col(key), to = S[k], tc = col(k); key = k; cap && ($('span:last-child', cap).textContent = CAP[k]); paintGhost();
    if (REDUCED || !anim) return paint(to, tc);
    cancelAnimationFrame(raf); const t0 = performance.now();
    const f = n => { const t = Math.min(1, (n - t0) / 640), e = ease(t); paint(from.map((v, i) => v + (to[i] - v) * e), mix(fc, tc, e)); t < 1 ? raf = requestAnimationFrame(f) : paint(to, tc); }; raf = requestAnimationFrame(f); };
  const build = () => {
    const defs = svgEl('defs'), g = svgEl('linearGradient', { id: 'cg', x1: 0, y1: 0, x2: 0, y2: 1 });
    stops = [svgEl('stop', { offset: 0, 'stop-opacity': .32 }), svgEl('stop', { offset: 1, 'stop-opacity': 0 })]; g.append(...stops); defs.append(g); svg.append(defs);
    [3, 0, -3, -6].forEach(db => { svg.append(svgEl('line', { x1: P.l, x2: W - P.r, y1: y(db), y2: y(db), class: db ? 'grid-line' : 'grid-zero' }));
      const t = svgEl('text', { x: P.l - 12, y: y(db) + 3.5, 'text-anchor': 'end', class: 'axis-label' }); t.textContent = db > 0 ? '+' + db : db < 0 ? '−' + -db : '0'; svg.append(t); });
    F.forEach((_, i) => { const l = svgEl('line', { x1: x(i), x2: x(i), y1: P.t, y2: H - P.b, class: 'band-guide' }); guides.push(l); svg.append(l);
      const t = svgEl('text', { x: x(i), y: H - 26, 'text-anchor': 'middle', class: 'axis-label' }); t.textContent = L[i]; svg.append(t); });
    const u = (tx, a) => { const t = svgEl('text', { ...a, class: 'axis-label axis-unit' }); t.textContent = tx; svg.append(t); };
    u('dB', { x: P.l - 12, y: P.t - 6, 'text-anchor': 'end' }); u('Hz', { x: W - P.r, y: H - 26, 'text-anchor': 'end' });
    ghost = svgEl('path', { class: 'ghost' }); area = svgEl('path'); path = svgEl('path', { class: 'curve' }); svg.append(ghost, area, path);
    F.forEach(() => { const d = svgEl('circle', { r: 4, class: 'pt' }); dots.push(d); svg.append(d); });
    tip = svgEl('g', { class: 'tip', style: 'display:none', 'pointer-events': 'none' }); tip.append(svgEl('rect', { height: 34, rx: 8 }), svgEl('text', { x: 10, y: 14 }), svgEl('text', { x: 108, y: 27, class: 'd' })); $$('text', tip)[0].setAttribute('y', 22); $$('text', tip)[1].setAttribute('y', 22); svg.append(tip);
    paintGhost(); paint(S.redmi, col('redmi'));
    if (!REDUCED) { const n = path.getTotalLength(); Object.assign(path.style, { strokeDasharray: n, strokeDashoffset: n }); requestAnimationFrame(() => { path.style.transition = 'stroke-dashoffset 1s cubic-bezier(.22,.8,.3,1)'; path.style.strokeDashoffset = 0; }); setTimeout(() => { path.style.cssText = ''; }, 1150); }
  };
  return { init() {
    if (!svg || !seg) return; build(); svg.tabIndex = 0;
    svg.addEventListener('pointermove', e => select(nearest(e))); svg.addEventListener('pointerdown', e => select(nearest(e)));
    svg.addEventListener('pointerleave', () => document.activeElement !== svg && select(-1));
    svg.addEventListener('blur', () => select(-1));
    svg.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); select(Math.max(0, Math.min(8, (sel < 0 ? (e.key === 'ArrowRight' ? -1 : 9) : sel) + (e.key === 'ArrowRight' ? 1 : -1)))); } else if (e.key === 'Escape') select(-1); });
    $$('.seg-btn', seg).forEach(b => b.addEventListener('click', () => { seg.dataset.active = b.dataset.series; $$('.seg-btn', seg).forEach(o => { o.classList.toggle('is-active', o === b); o.setAttribute('aria-pressed', o === b); }); show(b.dataset.series); }));
    document.addEventListener('themechange', () => show(key, false));
  } };
})();

/* Count-up stats */
const CountUp = { init() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; io.unobserve(e.target); const el = e.target, T = +el.dataset.count, c = el.dataset.format === 'comma', s = el.dataset.suffix || '';
    const f = n => (c ? Math.round(n).toLocaleString('en-US') : Math.round(n)) + s; if (REDUCED) return el.textContent = f(T);
    const t0 = performance.now(), step = n => { const t = Math.min(1, (n - t0) / 950); el.textContent = f(T * ease(t)); t < 1 && requestAnimationFrame(step); }; requestAnimationFrame(step); }), { threshold: .6 });
  $$('.stat-value[data-count]').forEach(e => io.observe(e));
} };

/* Copy preset dumps */
const Copy = { init() { $$('.dump-copy').forEach(b => b.addEventListener('click', async () => {
  const pre = $('pre', b.closest('.dump')); if (!pre) return;
  if (!await write(pre.textContent)) return Toast.show('Copy failed — select the text manually');
  const set = on => { b.classList.toggle('is-copied', on); $('span', b).textContent = on ? 'Copied' : 'Copy'; $('use', b).setAttribute('href', on ? '#i-check' : '#i-copy'); };
  set(true); Toast.show('Preset copied to clipboard'); setTimeout(() => set(false), 1800); })); } };

const boot = () => [Theme, Progress, Reveal, Spy, Drawer, NavFilter, Anchors, Chart, CountUp, Copy].forEach(m => m.init());
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
