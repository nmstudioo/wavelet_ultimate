/* ═════════════════════════════════════════════════════════════════════
   WAVELET REFERENCE — main.js
   Vanilla ES2020+, no dependencies. Organized as small modules:

     01 · Helpers
     02 · Theme          dark/light toggle, persistence, meta sync
     03 · Progress       reading bar + back-to-top progress ring
     04 · Reveal         entrance animations (sections, hero, charts)
     05 · ScrollSpy      active sidebar link while reading
     06 · Drawer         mobile navigation drawer + focus trap
     07 · Nav filter     "/" to search the table of contents
     08 · Curve chart    SVG frequency-response instrument (hero)
     09 · Count-up       animated stat numbers
     10 · Copy & toast   one-click preset dumps
═════════════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  /* ════════════════════════════════════════════════════════════════
     01 · HELPERS
  ═════════════════════════════════════════════════════════════════ */

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Read a CSS custom property from :root (trimmed). */
  const token = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  /** Parse "#rrggbb" → [r, g, b]; falls back to [255,178,36]. */
  const hexToRgb = (hex) => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
    return m
      ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
      : [255, 178, 36];
  };

  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const rgb = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  /** Shortest-drawing SVG element helper. */
  const svgEl = (tag, attrs = {}) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
  };

  /* ════════════════════════════════════════════════════════════════
     02 · THEME
  ═════════════════════════════════════════════════════════════════ */

  const Theme = (() => {
    const KEY = 'wavelet-theme';
    const root = document.documentElement;
    const btn = $('#themeToggle');
    const meta = $('meta[name="theme-color"]');
    const THEME_BG = { dark: '#07070a', light: '#f5f2ea' };

    const current = () => root.dataset.theme === 'light' ? 'light' : 'dark';

    const apply = (theme, { persist = true } = {}) => {
      root.dataset.theme = theme;
      if (meta) meta.setAttribute('content', THEME_BG[theme]);
      if (btn) btn.setAttribute('aria-pressed', String(theme === 'light'));
      if (persist) { try { localStorage.setItem(KEY, theme); } catch (_) {} }
      document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    };

    const toggle = () => apply(current() === 'dark' ? 'light' : 'dark');

    const init = () => {
      if (btn) btn.addEventListener('click', toggle);
      // Follow the OS while the visitor hasn't chosen manually.
      matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        let stored = null;
        try { stored = localStorage.getItem(KEY); } catch (_) {}
        if (!stored) apply(e.matches ? 'light' : 'dark', { persist: false });
      });
      apply(current(), { persist: false });
    };

    return { init, current };
  })();

  /* ════════════════════════════════════════════════════════════════
     03 · PROGRESS — reading bar + back-to-top ring
  ═════════════════════════════════════════════════════════════════ */

  const Progress = (() => {
    const bar = $('#progress');
    const btn = $('#backTop');
    const ring = $('#btProg');
    const CIRC = 2 * Math.PI * 19; // r = 19

    let ticking = false;

    const update = () => {
      ticking = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

      if (bar) bar.style.transform = `scaleX(${p})`;
      if (btn) btn.classList.toggle('is-visible', window.scrollY > 420);
      if (ring) ring.style.strokeDashoffset = String(CIRC * (1 - p));
    };

    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };

    const init = () => {
      if (ring) ring.style.strokeDasharray = String(CIRC);
      addEventListener('scroll', onScroll, { passive: true });
      addEventListener('resize', onScroll, { passive: true });
      if (btn) btn.addEventListener('click', () =>
        window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }));
      update();
    };

    return { init };
  })();

  /* ════════════════════════════════════════════════════════════════
     04 · REVEAL — entrances for sections, hero, and data graphics
  ═════════════════════════════════════════════════════════════════ */

  const Reveal = (() => {
    const init = () => {
      // Hero elements: staged on load via their data-d delays.
      requestAnimationFrame(() => {
        setTimeout(() => $$('.hero [data-d]').forEach((el) => el.classList.add('is-in')), 60);
      });

      // Sections & part dividers.
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.05, rootMargin: '0px 0px -4% 0px' });
      $$('.reveal').forEach((el) => io.observe(el));

      // Data graphics (meters, band chart): fill when they enter.
      const ioAnim = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            ioAnim.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      $$('[data-animate]').forEach((el) => ioAnim.observe(el));
    };

    return { init };
  })();

  /* ════════════════════════════════════════════════════════════════
     05 · SCROLLSPY — highlight the section being read
  ═════════════════════════════════════════════════════════════════ */

  const Spy = (() => {
    const links = $$('.side-nav a[data-spy]');

    const setActive = (id) => {
      links.forEach((a) => {
        const on = a.dataset.spy === id;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    };

    const init = () => {
      if (!links.length) return;
      const sections = $$('main section[id]');
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      }, { rootMargin: '-20% 0px -65% 0px' });
      sections.forEach((s) => io.observe(s));

      // Initial state from the URL hash, if any.
      if (location.hash) {
        const id = location.hash.slice(1);
        if (sections.some((s) => s.id === id)) setActive(id);
      }
    };

    return { init };
  })();

  /* ════════════════════════════════════════════════════════════════
     06 · DRAWER — mobile navigation
  ═════════════════════════════════════════════════════════════════ */

  const Drawer = (() => {
    const side = $('#sidebar');
    const overlay = $('#sideOverlay');
    const toggle = $('#navToggle');
    const mq = matchMedia('(max-width: 1024px)');
    let lastFocus = null;

    const isOpen = () => side.classList.contains('is-open');

    const open = () => {
      lastFocus = document.activeElement;
      side.classList.add('is-open');
      overlay.classList.add('is-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      const first = $('#navFilter') || side.querySelector('a');
      if (first) setTimeout(() => first.focus(), 320);
    };

    const close = () => {
      side.classList.remove('is-open');
      overlay.classList.remove('is-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      lastFocus = null;
    };

    const init = () => {
      if (toggle) toggle.addEventListener('click', () => (isOpen() ? close() : open()));
      if (overlay) overlay.addEventListener('click', close);

      // Closing after picking a section (mobile).
      $$('a', side).forEach((a) =>
        a.addEventListener('click', () => { if (isOpen()) close(); }));

      // Esc closes; Tab stays inside while open.
      document.addEventListener('keydown', (e) => {
        if (!isOpen()) return;
        if (e.key === 'Escape') { close(); return; }
        if (e.key === 'Tab') {
          const focusables = $$('a[href], button, input', side)
            .filter((el) => el.offsetParent !== null);
          if (!focusables.length) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault(); last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
          }
        }
      });

      // Reset if the viewport grows past the breakpoint.
      mq.addEventListener('change', (e) => { if (!e.matches && isOpen()) close(); });
    };

    return { init, open, close, isOpen, mq };
  })();

  /* ════════════════════════════════════════════════════════════════
     07 · NAV FILTER — "/" to search the table of contents
  ═════════════════════════════════════════════════════════════════ */

  const NavFilter = (() => {
    const input = $('#navFilter');
    const empty = $('#sideEmpty');
    const groups = $$('[data-group]');
    const links = $$('.side-nav a');

    const run = () => {
      const q = (input.value || '').trim().toLowerCase();
      let visible = 0;

      links.forEach((a) => {
        const match = !q || a.textContent.toLowerCase().includes(q);
        a.parentElement.hidden = !match;
        if (match) visible++;
      });

      groups.forEach((g) => {
        const anyVisible = [...g.querySelectorAll('li')].some((li) => !li.hidden);
        g.hidden = !anyVisible;
      });

      if (empty) empty.hidden = visible !== 0 || q === '';
    };

    const init = () => {
      if (!input) return;

      input.addEventListener('input', run);

      document.addEventListener('keydown', (e) => {
        const target = e.target;
        const typing = target instanceof HTMLElement &&
          (target.isContentEditable ||
           /^(input|textarea|select)$/i.test(target.tagName));

        if (e.key === '/' && !typing) {
          e.preventDefault();
          if (Drawer.mq.matches && !Drawer.isOpen()) Drawer.open();
          input.focus();
          input.select();
          return;
        }

        if (e.key === 'Escape' && target === input) {
          if (input.value) {
            input.value = '';
            run();
          } else {
            input.blur();
          }
        }
      });
    };

    return { init };
  })();

  /* ════════════════════════════════════════════════════════════════
     08 · CURVE CHART — the hero frequency-response instrument
  ═════════════════════════════════════════════════════════════════ */

  const Chart = (() => {
    const svg = $('#eqChart');
    const seg = $('#curveSeg');
    const caption = $('#eqCaption');

    /* Real preset data (unchanged from the reference content):
       Redmi 12 Graphic EQ baseline & KZ "AutoEq only" flat manual EQ. */
    const BANDS = [62.5, 125, 250, 500, 1000, 2000, 4000, 8000, 10000];
    const LABELS = ['62.5', '125', '250', '500', '1k', '2k', '4k', '8k', '10k'];
    const SERIES = {
      redmi: [-6, -4, -2, 0, 0, 0, -1, -3, -4],
      kz:    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    };
    const CAPTIONS = {
      redmi: 'Redmi 12 · built-in speaker — Graphic Equalizer baseline, unchanged in v2.0. Hover the points for per-band dB values.',
      kz:    'KZ EDX Pro · wired IEM — Graphic EQ flat at 0 dB: AutoEq is the only active correction layer (see Feature 01).',
    };

    /* Geometry (viewBox units) */
    const W = 760, H = 300;
    const PAD = { l: 46, r: 20, t: 20, b: 48 };
    const DB_TOP = 6, DB_BOTTOM = -8;
    const MAX_OCT = Math.log2(BANDS[BANDS.length - 1] / BANDS[0]);

    let area, path, dots = [], gradStops = [];
    let currentKey = 'redmi';
    let raf = null;

    const yOf = (db) =>
      PAD.t + (DB_TOP - db) / (DB_TOP - DB_BOTTOM) * (H - PAD.t - PAD.b);
    const xOf = (i) =>
      PAD.l + (Math.log2(BANDS[i] / BANDS[0]) / MAX_OCT) * (W - PAD.l - PAD.r);

    /** Catmull-Rom spline through points → smooth cubic-bezier path. */
    const smoothPath = (pts) => {
      if (pts.length < 2) return '';
      let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] || pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] || p2;
        const c1x = p1[0] + (p2[0] - p0[0]) / 6;
        const c1y = p1[1] + (p2[1] - p0[1]) / 6;
        const c2x = p2[0] - (p3[0] - p1[0]) / 6;
        const c2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
      }
      return d;
    };

    const pointsFor = (values) => values.map((v, i) => [xOf(i), yOf(v)]);

    const paint = (values, color) => {
      const pts = pointsFor(values);
      const d = smoothPath(pts);

      path.setAttribute('d', d);
      path.setAttribute('stroke', rgb(color));

      area.setAttribute(
        'd', `${d} L ${pts[pts.length - 1][0].toFixed(2)} ${yOf(0).toFixed(2)} L ${pts[0][0].toFixed(2)} ${yOf(0).toFixed(2)} Z`);
      area.setAttribute('fill', 'url(#curveGrad)');

      gradStops[0].setAttribute('stop-color', rgb(color));
      gradStops[1].setAttribute('stop-color', rgb(color));

      dots.forEach((dot, i) => {
        dot.setAttribute('cx', pts[i][0].toFixed(2));
        dot.setAttribute('cy', pts[i][1].toFixed(2));
        dot.setAttribute('stroke', rgb(color));
        const v = Math.round(values[i]);
        dot.querySelector('title').textContent =
          `${LABELS[i]} Hz · ${v > 0 ? '+' : ''}${v} dB`;
      });
    };

    const seriesColor = (key) => hexToRgb(key === 'kz' ? token('--sig2') : token('--sig'));

    const show = (key, { animate = true } = {}) => {
      const from = SERIES[currentKey].slice();
      const fromColor = seriesColor(currentKey);
      const to = SERIES[key];
      const toColor = seriesColor(key);
      currentKey = key;

      if (caption) {
        const text = caption.querySelector('span:last-child');
        if (text) text.textContent = CAPTIONS[key];
      }

      if (REDUCED || !animate) { paint(to, toColor); return; }

      if (raf) cancelAnimationFrame(raf);
      const t0 = performance.now();
      const DUR = 620;

      const frame = (now) => {
        const t = Math.min(1, (now - t0) / DUR);
        const e = easeInOutCubic(t);
        paint(from.map((v, i) => v + (to[i] - v) * e), mix(fromColor, toColor, e));
        if (t < 1) raf = requestAnimationFrame(frame);
        else paint(to, toColor);
      };
      raf = requestAnimationFrame(frame);
    };

    const build = () => {
      /* Gradient */
      const defs = svgEl('defs');
      const grad = svgEl('linearGradient',
        { id: 'curveGrad', x1: '0', y1: '0', x2: '0', y2: '1' });
      const stopTop = svgEl('stop', { offset: '0.12', 'stop-opacity': '0.05' });
      const stopBottom = svgEl('stop', { offset: '1', 'stop-opacity': '0.4' });
      grad.append(stopTop, stopBottom);
      defs.append(grad);
      gradStops = [stopTop, stopBottom];
      svg.append(defs);

      /* dB gridlines + labels */
      [3, 0, -3, -6].forEach((db) => {
        const y = yOf(db);
        const line = svgEl('line', {
          x1: PAD.l, x2: W - PAD.r, y1: y, y2: y,
          class: db === 0 ? 'grid-zero' : 'grid-line',
        });
        svg.append(line);
        const label = svgEl('text', {
          x: PAD.l - 12, y: y + 3.5, 'text-anchor': 'end', class: 'axis-label',
        });
        label.textContent = db > 0 ? `+${db}` : String(db);
        svg.append(label);
      });

      /* Per-band guides + frequency labels */
      BANDS.forEach((_, i) => {
        const x = xOf(i);
        svg.append(svgEl('line', {
          x1: x, x2: x, y1: PAD.t, y2: H - PAD.b, class: 'band-guide',
        }));
        const label = svgEl('text', {
          x: x, y: H - 26, 'text-anchor': 'middle', class: 'axis-label',
        });
        label.textContent = LABELS[i];
        svg.append(label);
      });

      /* Axis units */
      const dbUnit = svgEl('text',
        { x: PAD.l - 12, y: PAD.t - 6, 'text-anchor': 'end', class: 'axis-unit' });
      dbUnit.textContent = 'dB';
      const hzUnit = svgEl('text',
        { x: W - PAD.r, y: H - 26, 'text-anchor': 'end', class: 'axis-unit' });
      hzUnit.textContent = 'Hz';
      svg.append(dbUnit, hzUnit);

      /* Area, curve, points (order = paint order) */
      area = svgEl('path', { class: 'curve-area' });
      path = svgEl('path', { class: 'curve' });
      svg.append(area, path);

      SERIES.redmi.forEach((_, i) => {
        const dot = svgEl('circle', { r: 4, class: 'pt' });
        dot.append(svgEl('title'));
        svg.append(dot);
        dots.push(dot);
      });

      paint(SERIES.redmi, seriesColor('redmi'));

      /* Draw-on entrance, once. */
      if (!REDUCED) {
        const len = path.getTotalLength();
        path.style.strokeDasharray = String(len);
        path.style.strokeDashoffset = String(len);
        requestAnimationFrame(() => {
          path.style.transition = 'stroke-dashoffset 0.9s cubic-bezier(0.25, 0.8, 0.35, 1)';
          path.style.strokeDashoffset = '0';
        });
        setTimeout(() => {
          path.style.transition = '';
          path.style.strokeDasharray = '';
          path.style.strokeDashoffset = '';
        }, 1100);
      }
    };

    const init = () => {
      if (!svg || !seg) return;

      build();

      $$('.seg-btn', seg).forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = btn.dataset.series;
          seg.dataset.active = key;
          $$('.seg-btn', seg).forEach((b) => {
            const on = b === btn;
            b.classList.toggle('is-active', on);
            b.setAttribute('aria-pressed', String(on));
          });
          show(key);
        });
      });

      // Repaint with the new palette when the theme flips (no morph).
      document.addEventListener('themechange', () =>
        show(currentKey, { animate: false }));
    };

    return { init };
  })();

  /* ════════════════════════════════════════════════════════════════
     09 · COUNT-UP — hero statistics
  ═════════════════════════════════════════════════════════════════ */

  const CountUp = (() => {
    const run = (el) => {
      const target = Number(el.dataset.count);
      if (!Number.isFinite(target)) return;
      const useComma = el.dataset.format === 'comma';
      const suffix = el.dataset.suffix || '';
      const format = (n) =>
        (useComma ? Math.round(n).toLocaleString('en-US') : String(Math.round(n))) + suffix;

      if (REDUCED) { el.textContent = format(target); return; }

      const t0 = performance.now();
      const DUR = 950;
      const frame = (now) => {
        const t = Math.min(1, (now - t0) / DUR);
        el.textContent = format(target * easeInOutCubic(t));
        if (t < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };

    const init = () => {
      const els = $$('.stat-value[data-count]');
      if (!els.length) return;
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            io.unobserve(entry.target);
            run(entry.target);
          }
        });
      }, { threshold: 0.6 });
      els.forEach((el) => io.observe(el));
    };

    return { init };
  })();

  /* ════════════════════════════════════════════════════════════════
     10 · COPY & TOAST
  ═════════════════════════════════════════════════════════════════ */

  const Toast = (() => {
    const el = $('#toast');
    const msg = $('#toastMsg');
    let timer = null;

    const show = (text) => {
      if (!el) return;
      if (msg) msg.textContent = text;
      el.classList.add('is-visible');
      clearTimeout(timer);
      timer = setTimeout(() => el.classList.remove('is-visible'), 2200);
    };

    return { show };
  })();

  const Copy = (() => {
    const flash = (btn, on) => {
      btn.classList.toggle('is-copied', on);
      const label = btn.querySelector('span');
      const icon = btn.querySelector('use');
      if (label) label.textContent = on ? 'Copied' : 'Copy';
      if (icon) icon.setAttribute('href', on ? '#i-check' : '#i-copy');
    };

    const write = async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {
        // Legacy fallback for non-secure contexts.
        try {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.append(ta);
          ta.select();
          const ok = document.execCommand('copy');
          ta.remove();
          return ok;
        } catch (_) {
          return false;
        }
      }
    };

    const init = () => {
      $$('.dump-copy').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const pre = btn.closest('.dump').querySelector('pre');
          if (!pre) return;
          const ok = await write(pre.textContent);
          if (!ok) { Toast.show('Copy failed — select the text manually'); return; }
          flash(btn, true);
          Toast.show('Preset copied to clipboard');
          setTimeout(() => flash(btn, false), 1800);
        });
      });
    };

    return { init };
  })();

  /* ════════════════════════════════════════════════════════════════
     BOOT
  ═════════════════════════════════════════════════════════════════ */

  const boot = () => {
    Theme.init();
    Progress.init();
    Reveal.init();
    Spy.init();
    Drawer.init();
    NavFilter.init();
    Chart.init();
    CountUp.init();
    Copy.init();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
