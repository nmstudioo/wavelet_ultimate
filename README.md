# Wavelet — Complete Feature Reference (v2.0)

![License](https://img.shields.io/badge/license-MIT-FFB224?style=flat-square)
![Dependencies](https://img.shields.io/badge/dependencies-none-4ADE80?style=flat-square)
![Build](https://img.shields.io/badge/build-none%20needed-9BA3FF?style=flat-square)
![Hosting](https://img.shields.io/badge/hosting-GitHub%20Pages%20ready-FFB224?style=flat-square)

A single-page technical reference for the **Wavelet** Android equalizer app — every
control explained with the reasoning behind it, plus real, validated preset values for a
**Redmi 12 built-in speaker** and a **KZ EDX Pro** wired earphone.

This repository is the *presentation redesign* of the reference: hand-built HTML, CSS and
JavaScript — zero frameworks, zero build step, zero trackers — designed like a mastering
console and engineered to be read.

> Independent reference — not affiliated with the Wavelet app or its developer.

---

## What's inside

- **Two-theme design system** — "studio instrument panel" dark mode + warm paper light
  mode, driven entirely by CSS custom properties (toggle persists, OS preference respected).
- **Interactive frequency-response chart** — the Redmi 12 Graphic-EQ curve and the KZ
  AutoEq-only flat line, drawn as a smooth Catmull-Rom SVG spline on a logarithmic
  frequency axis, with a morphing device toggle.
- **Organized navigation** — sticky table of contents with scroll-spy highlighting,
  `/`-to-filter search, and a focus-trapped mobile drawer.
- **Living data** — headroom meters and the cut-depth band chart animate on scroll;
  stat counters count up; preset dumps copy to the clipboard in one click.
- **Reading amenities** — gradient progress bar, back-to-top with a progress ring,
  staggered section reveals, print stylesheet, reduced-motion support.

## Structure

```
wavelet-reference/
├── index.html              # the entire reference (content + structure)
├── assets/
│   ├── css/main.css        # design system: tokens → components → responsive → print
│   ├── js/main.js          # 10 small modules, vanilla ES2020+
│   └── img/favicon.svg
├── .github/workflows/deploy.yml   # publishes to GitHub Pages on push to main
├── .nojekyll               # skip Jekyll processing on GitHub Pages
├── DESIGN.md               # design decisions, tokens, interaction inventory
├── LICENSE                 # MIT
└── README.md
```

## Run locally

Any static file server works:

```bash
# from the repo root — pick your favorite
python3 -m http.server 8000
# or
npx serve .
```

Then open <http://localhost:8000>. (Opening `index.html` directly also works — all asset
paths are relative so the page is deployable at any URL depth.)

## Publish on GitHub Pages

1. Create a new repository (e.g. `wavelet-reference`) and push this folder's contents
   to `main`.
2. **Repo → Settings → Pages → Build and deployment → Source: *GitHub Actions***.
3. Push, or run the workflow manually (**Actions → Deploy to GitHub Pages → Run
   workflow**). The included workflow uploads the site and deploys it.

The site then lives at `https://<your-username>.github.io/wavelet-reference/`.

Optional polish after publishing:

- Uncomment `og:image` in `index.html` and replace `YOUR-USERNAME` so link previews
  resolve (`assets/img/og-cover.png` is included — swap in your own screenshot if you
  prefer).
- Put your name in the `LICENSE` copyright line if you'd like.
- Set **Settings → General → Description** so search results read well.

## Customize

- **Colors, fonts, spacing, motion** → edit the token block at the top of
  `assets/css/main.css` (both themes live there). Derived tints recompute automatically
  via `color-mix()`.
- **Chart data** → `SERIES` / `BANDS` near the top of the `Chart` module in
  `assets/js/main.js`.
- **Content** → `index.html` is plain semantic HTML; sections follow one repeating
  anatomy (header → prose → parameters → examples → device panels).

## Design system

See [DESIGN.md](DESIGN.md) for the full rationale: font pairing, type scale, palette
with contrast notes, layout grid, iconography, data-graphic specs, the micro-interaction
inventory, and accessibility/performance decisions.

## Credits

- **Wavelet** — the Android headphone equalizer app this reference documents.
- **AutoEq** — the measurement database the KZ EDX Pro preset relies on.
- Content, code and design in this repo: hand-written for portfolio purposes.

## License

MIT — see [LICENSE](LICENSE). The document text may additionally be treated as
reference notes: credit is appreciated, lock-in is not intended.
