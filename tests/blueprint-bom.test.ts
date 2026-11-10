import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { measurePage, referencesOf } from '../scripts/blueprint-bom.mjs';

const html = `<!doctype html><html><head>
<link rel="stylesheet" href="/_astro/a.css">
<link rel="modulepreload" href="/_astro/chunk.js">
<style>@font-face{font-family:X;src:url(/_astro/fonts/x.woff2) format("woff2")}</style>
<script type="module" src="/_astro/app.js"></script>
</head><body><img src="/_astro/one.webp" alt=""><img src="/_astro/one.webp" alt=""></body></html>`;

const files: Record<string, Buffer> = {
  '/_astro/a.css': Buffer.from(
    '@font-face{src:url(/_astro/fonts/y.woff2)}' + 'a{color:red}'.repeat(50),
  ),
  '/_astro/chunk.js': Buffer.from('export const a=1;'.repeat(30)),
  '/_astro/app.js': Buffer.from('import "./chunk.js";'.repeat(30)),
  '/_astro/fonts/x.woff2': Buffer.alloc(1000),
  '/_astro/fonts/y.woff2': Buffer.alloc(500),
  '/_astro/one.webp': Buffer.alloc(2000),
};
const readFile = (path: string) => files[path] ?? null;

describe('referencesOf', () => {
  it('lists what the page points at, once each', () => {
    const references = referencesOf(
      html,
      (path: string) => files[path]?.toString() ?? '',
    );
    expect(references.stylesheets).toEqual(['/_astro/a.css']);
    expect(references.scripts.sort()).toEqual([
      '/_astro/app.js',
      '/_astro/chunk.js',
    ]);
    expect(references.images).toEqual(['/_astro/one.webp']);
    expect(references.fonts.sort()).toEqual([
      '/_astro/fonts/x.woff2',
      '/_astro/fonts/y.woff2',
    ]);
  });
});

describe('measurePage', () => {
  const bom = measurePage(html, readFile);

  it('counts text gzipped', () => {
    expect(bom.html).toEqual({
      n: 1,
      bytes: gzipSync(Buffer.from(html)).length,
    });
    expect(bom.css).toEqual({
      n: 1,
      bytes: gzipSync(files['/_astro/a.css']).length,
    });
    expect(bom.js.n).toBe(2);
  });

  it('counts fonts and images as they are', () => {
    expect(bom.fonts).toEqual({ n: 2, bytes: 1500 });
    expect(bom.images).toEqual({ n: 1, bytes: 2000 });
  });

  it('skips a file the build does not have', () => {
    const missing = measurePage(html, () => null);
    expect(missing.css).toEqual({ n: 0, bytes: 0 });
    expect(missing.fonts.n).toBe(0);
  });
});
