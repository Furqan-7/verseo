# verseo-framer-website

A Next.js project generated from [https://verseo.framer.website/](https://verseo.framer.website/) by [FNJ](https://framertonextjs.com).

## What this is

5 page(s) built from 87 React section component(s). Unlike a
look-alike export, these are real components you can read and edit — and they
still render **the same DOM** as the original Framer site: every element,
attribute, text node and hydration marker, in the same order. Framer's runtime
adopts the page exactly as it would its own, so nothing about the published
behaviour changes.

(The bytes are not character-for-character identical, and don't need to be:
React writes `fetchPriority` where Framer wrote `fetchpriority`, and
re-serialises `style="a: 1;"` as `style="a:1"`. Both parse to the same DOM
and compute the same CSS.)

```
src/views/         one component per route, composed from its sections
src/sections/      the Framer sections, one file each, named as you named them
src/manifest.json  the <head> and the verbatim fragments for each page
scripts/           the prerender step
app/               route handlers that serve the prerendered HTML
public/assets/     self-hosted images, fonts and media
```

## Running it

```bash
npm install
npm run dev
```

## Before you deploy: set `SITE_URL`

```bash
SITE_URL=https://your-domain.com
```

Framer hard-codes `<link rel="canonical">` and `og:url` to its own domain.
Left alone, your deployed copy would tell Google the real page still lives on
Framer, so they were rewritten to root-relative paths at conversion — at which
point nobody yet knew your domain.

Setting `SITE_URL` makes them absolute again at build time, pointing at you.
Without it they stay relative: still valid, but a weaker signal to Google and
a failing Lighthouse canonical audit. On Vercel this falls back to your
production domain automatically, so setting it explicitly matters most
everywhere else.

## Editing

Edit any file under `src/sections/` and refresh — the dev server renders the
components on every request, so the change is there. (`npm run build` renders
them once to static HTML, which is what production serves.)

Two things in the generated JSX are load-bearing rather than stylistic:

- **`<Suspense>` boundaries** are Framer's hydration markers. Its runtime reads
  them to adopt this DOM instead of re-rendering the page, so removing one
  changes how that part of the page boots.
- **`data-fnj-slot` spans** are placeholders for fragments React cannot emit in
  place (scripts, comments). The prerender step swaps them for the original
  bytes.

Everything else — classes, styles, text, structure — is ordinary JSX.
