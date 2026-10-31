# Design system — Wavelet Reference

The redesign treats the page as a **mastering-console instrument**: dark instrument
chrome, one warm "signal" color doing the work of a VU meter, a cool periwinkle for the
second device, mono type for every number, and an editorial serif for the words that
carry opinions. Everything below is a decision, not a default.

---

## 1 · Concept

| Input | Output |
|---|---|
| Subject: audio DSP / EQ | Instrument-panel aesthetic: charts, dB grids, mono data plates |
| Tone: reasoned, evidence-first | Editorial serif display + restrained accents; nothing decorative without meaning |
| Two devices compared everywhere | Two color-coded identities carried through chips, panels, table columns, and the hero chart |
| Portfolio piece | Zero dependencies, documented tokens, print stylesheet, a11y passes |

## 2 · Font pairing

| Role | Face | Why |
|---|---|---|
| Display (hero, part titles) | **Fraunces** (variable, optical sizing 9→144) | An editorial serif with real character; the optical axis keeps small section titles sturdy and the 4rem hero crisp. Italic + amber carries the "reference" emphasis. |
| Text & UI | **Inter** | Neutral, legible grotesque; deliberately quiet so data and accents speak. |
| Data, labels, code | **JetBrains Mono** | Tabular, technical, self-evident for dB/ms values; used for all micro-labels in uppercase with +0.12em tracking. |

Type scale is fluid via `clamp()` — e.g. hero `clamp(2.5rem, 1.7rem + 3.6vw, 4.4rem)`,
section titles `clamp(1.45rem, 1.1rem + 1.2vw, 2rem)`. Prose measure is capped at
64–70ch; headings use `text-wrap: balance`.

## 3 · Color

Dark (default) and light ("warm paper") themes are pure token swaps — every tint is
derived with `color-mix()` so both themes stay in lock-step.

| Token | Dark | Light | Meaning |
|---|---|---|---|
| `--bg0/1/2/3` | `#07070a → #1c1c26` | `#f5f2ea → #e4dfcf` | page → raised → inset → hover |
| `--ink / --ink2 / --ink3` | `#f2efe8 / #a9a6b4 / #6e6b7c` | `#23201a / #5d5849 / #8d8776` | text hierarchy |
| `--sig` | `#ffb224` | `#9c5c06` | amber signal · Redmi 12 · primary accent |
| `--sig2` | `#9ba3ff` | `#4b50c4` | periwinkle · KZ EDX Pro · examples |
| `--ok / --bad` | `#4ade80 / #ff7a70` | `#157a38 / #c03a2e` | ON / OFF statuses |

Contrast notes: body text ≥ 7:1 in both themes; accents used on text are ≥ 4.6:1 on
their backgrounds in light mode (amber is darkened to `#9c5c06` there on purpose);
status badges pair a tinted fill with a 28%-mix border, so color is never the only
signal (a dot + label carries it too).

Ambient depth comes from two fixed radial glows (amber top-left, periwinkle
bottom-right) and a 4–5% SVG-turbulence grain layer — texture, not decoration.

## 4 · Layout

- App shell: sticky 60px top bar + **268px sticky sidebar** + reading column capped at
  `57.5rem` with 64ch prose measure.
- Sidebar holds preset chips, a `/`-to-search filter, three grouped nav sections with
  counts, and collapses into a focus-trapped drawer under 1024px.
- Sections repeat one anatomy — icon tile → mono eyebrow → serif title → prose →
  parameter `<dl>` → callouts → device grid — so a 19-section document stays scannable.
- `scroll-margin-top` and `scroll-padding-top` keep anchor jumps clear of the bar;
  part dividers get italic ghost numerals ("05", "A") for rhythm.

## 5 · Iconography

One inline SVG sprite (`<symbol>` + `<use>`) — 30 glyphs on a 24px grid, 2px round
strokes, no icon font, no icon library. The `.ic` base class sets
`fill:none; stroke:currentColor`, so icons inherit color from context (amber in
feature tiles, periwinkle in example callouts, neutral in card headers).

## 6 · Data graphics

| Graphic | Spec |
|---|---|
| **Hero frequency-response chart** | SVG 760×300. X-axis is *logarithmic* (62.5 Hz → 10 kHz, log2-spaced bands — 8 kHz and 10 kHz sit honestly close). dB gridlines at +3/0/−3/−6 with the 0 dB line dashed. Curve is a Catmull-Rom → cubic Bézier spline; gradient area fills between curve and the 0 dB line; 4px points carry native tooltips. Toggling Redmi ↔ KZ morphs values *and* color over 620 ms with `easeInOutCubic`; on first paint the stroke draws itself on. |
| **Cut-depth band chart** (Redmi EQ panel) | Pure CSS: bars hang from the 0 dB baseline, `height: calc(var(--v) * 7px)` from inline custom properties — zero JS, works in print and no-JS, animates when `.in-view`. |
| **Headroom meters** (genre dependence) | Same technique — `width: var(--w)` transitions to 85%/55%/18% on reveal, indigo→amber gradient. |
| **Stat strip** | Mono numerals, `tabular-nums`, counts up once when visible. |

## 7 · Micro-interactions

- Reading progress: 2px gradient bar (amber→periwinkle), `transform: scaleX` for cheap
  repaints.
- Back-to-top: 46px button with an SVG progress ring mirroring scroll depth.
- Scroll-spy: active nav link gets an inset accent rail (`box-shadow`, so no layout
  shift) + `aria-current`.
- Copy buttons on preset dumps: icon flips to a check, button tints green, a toast
  confirms; label reverts after 1.8 s.
- Theme toggle: pre-paint boot script (no flash), `localStorage` persistence,
  `theme-color` meta sync, and the chart repaints in the new palette instantly.
- Keyboard: `/` focuses section filter (opens the drawer on mobile), `Esc` clears /
  closes, Tab is trapped inside the open drawer.

## 8 · Motion

Two durations do everything: ~260 ms for state changes, 600 ms for entrances
(+120 ms transition delays for hero stagger). One easing family
(`cubic-bezier(.25,.8,.35,1)`); one spring for tiny pops. `prefers-reduced-motion`
collapses all transitions to 0.01 ms, skips the count-up, the morph, and the draw-on.

## 9 · Accessibility & performance

- Landmarks + skip link; `aria-expanded/pressed/current` where relevant; focus-visible
  rings throughout; drawers trap focus and restore it on close.
- Charts degrade gracefully: values live in adjacent pills/tables, band bars are pure
  CSS, and a `<noscript>` block reveals everything without JS.
- No framework, no analytics, one CSS file, one JS file (~8 KB each, uncompressed).
  `IntersectionObserver` everywhere instead of scroll math; scroll handlers are
  rAF-throttled and passive.
- Modern CSS (`color-mix`, `:has`, `text-wrap`, `100dvh`) with graceful fallbacks; the
  print stylesheet re-inks to monochrome-friendly light tokens and avoids breaking
  cards across pages.
