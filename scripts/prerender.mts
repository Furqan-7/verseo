// Writes every page to .rendered/ as the exact HTML Framer published.
//
// Runs automatically before `dev` and `build` — see package.json. The
// rendering itself lives in src/render.ts, which the route handlers also use
// in development, so what you see while editing is what gets built.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

// react-dom's development build warns about the non-standard style properties
// Framer emits (webkit-user-drag). The rendered output is identical either
// way, so render through the production build and keep the console clean.
// This must happen before src/render.ts pulls react in.
(process.env as Record<string, string | undefined>).NODE_ENV ??= "production";

const { manifest, renderPage } = await import("../src/render.js");

const root = process.cwd();

for (const page of manifest.pages) {
  const mod = await import(pathToFileURL(resolve(root, `src/views/${page.component}.tsx`)).href);
  const doc = await renderPage(page, mod.default);
  const out = join(root, ".rendered", page.file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, doc);
  console.log(`  ${page.route.padEnd(24)} ${(doc.length / 1024).toFixed(0)} KB`);
}

console.log(`prerendered ${manifest.pages.length} page(s) to .rendered/`);
