// After the build: measures what each page references and writes dist/blueprint/bom.json,
// keyed by route. Blueprint mode draws it as a bill of materials, so the numbers are never typed in.
//   node scripts/blueprint-bom.mjs
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const ATTRIBUTE = /([\w:-]+)="([^"]*)"/g;
const TAG = /<(link|script|img)\b([^>]*)>/g;
const FONT_URL = /url\(\s*["']?([^"')]+\.woff2)["']?\s*\)/g;

/** The attributes of one tag, as an object. */
const attributesOf = (source) =>
  Object.fromEntries(
    [...source.matchAll(ATTRIBUTE)].map(([, name, value]) => [name, value]),
  );

/** What a page references: its stylesheets, scripts and images (as paths), and its font files. */
export function referencesOf(html, readText) {
  const stylesheets = new Set();
  const scripts = new Set();
  const images = new Set();
  for (const [, tag, source] of html.matchAll(TAG)) {
    const attributes = attributesOf(source);
    if (tag === 'link' && attributes.rel === 'stylesheet' && attributes.href)
      stylesheets.add(attributes.href);
    if (tag === 'link' && attributes.rel === 'modulepreload' && attributes.href)
      scripts.add(attributes.href);
    if (tag === 'script' && attributes.src) scripts.add(attributes.src);
    if (tag === 'img' && attributes.src) images.add(attributes.src);
  }
  // Font files are named in @font-face rules, in the page itself or in a stylesheet it links.
  const fonts = new Set();
  for (const text of [html, ...[...stylesheets].map(readText)]) {
    for (const [, url] of text.matchAll(FONT_URL)) fonts.add(url);
  }
  return {
    stylesheets: [...stylesheets],
    scripts: [...scripts],
    images: [...images],
    fonts: [...fonts],
  };
}

/**
 * The bill of materials of one page. Text (HTML, CSS, JS) is counted gzipped, because that is what
 * travels. Fonts and images are counted as they are, because they are already compressed.
 * `readFile` returns the bytes of a file of the build by its path on the site, or null.
 */
export function measurePage(html, readFile) {
  const readText = (path) => readFile(path)?.toString('utf8') ?? '';
  const references = referencesOf(html, readText);
  const gzipped = (paths) =>
    paths
      .map((path) => readFile(path))
      .filter(Boolean)
      .map((bytes) => gzipSync(bytes).length);
  const raw = (paths) =>
    paths
      .map((path) => readFile(path))
      .filter(Boolean)
      .map((bytes) => bytes.length);
  const total = (sizes) => ({
    n: sizes.length,
    bytes: sizes.reduce((sum, size) => sum + size, 0),
  });
  return {
    html: { n: 1, bytes: gzipSync(Buffer.from(html)).length },
    css: total(gzipped(references.stylesheets)),
    js: total(gzipped(references.scripts)),
    fonts: total(raw(references.fonts)),
    images: total(raw(references.images)),
  };
}

/** Every `index.html` in the build, with the route it is served at. */
function pagesIn(root, directory = root, found = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) pagesIn(root, path, found);
    else if (entry.name === 'index.html')
      found.push([
        path,
        `/${path.slice(root.length + 1, -'index.html'.length)}`,
      ]);
  }
  return found;
}

function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
  if (!existsSync(root))
    throw new Error('Run the build first: there is no dist/ folder.');
  const readFile = (path) => {
    const file = join(root, path.split('?')[0]);
    return existsSync(file) ? readFileSync(file) : null;
  };
  const pages = Object.fromEntries(
    pagesIn(root).map(([file, route]) => [
      route,
      measurePage(readFileSync(file, 'utf8'), readFile),
    ]),
  );
  mkdirSync(join(root, 'blueprint'), { recursive: true });
  writeFileSync(join(root, 'blueprint', 'bom.json'), JSON.stringify(pages));
  console.log(`blueprint bom: ${Object.keys(pages).length} pages`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
