// Builds docs/brand/preview-dark.png and preview-light.png for the README: the home page in a
// browser window and on a phone, in each theme.
// It needs a build first (npm run build), then it serves dist/ with astro preview.
//   npm run preview-image
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const path = (name) => fileURLToPath(new URL(name, import.meta.url));
const port = 4177;
const base = `http://localhost:${port}/`;

const server = spawn(
  process.execPath,
  [
    path('../node_modules/astro/bin/astro.mjs'),
    'preview',
    '--ignore-lock',
    '--port',
    String(port),
  ],
  { stdio: 'ignore' },
);

try {
  for (let i = 0; i < 40; i++) {
    if (
      await fetch(base).then(
        (r) => r.ok,
        () => false,
      )
    )
      break;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  const browser = await chromium.launch();
  const shot = async (viewport, scale, height, colorScheme) => {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: scale,
      colorScheme,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto(base);
    await page.waitForTimeout(600);
    const buffer = await page.screenshot({
      clip: { x: 0, y: 0, width: viewport.width, height },
    });
    await context.close();
    return `data:image/png;base64,${buffer.toString('base64')}`;
  };

  for (const scheme of ['dark', 'light']) {
    const desktop = await shot({ width: 1440, height: 900 }, 1, 840, scheme);
    const phone = await shot({ width: 390, height: 844 }, 2, 780, scheme);

    const html = readFileSync(path('./preview.html'), 'utf8')
      .replace('{{DESKTOP}}', desktop)
      .replace('{{PHONE}}', phone);
    writeFileSync(path('./.preview-built.html'), html);

    const page = await browser.newPage({
      viewport: { width: 1600, height: 1000 },
    });
    await page.goto(`file://${path('./.preview-built.html')}`);
    await page.screenshot({
      path: path(`../docs/brand/preview-${scheme}.png`),
    });
    await page.close();
  }
  await browser.close();
} finally {
  server.kill();
}
