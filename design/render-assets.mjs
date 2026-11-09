// Renders the generated images with Playwright:
//   design/og.html   -> public/og.png (1200x630 share image)
//   public/favicon.svg -> public/apple-touch-icon.png (180x180)
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const path = (name) => fileURLToPath(new URL(name, import.meta.url));

const browser = await chromium.launch();

const share = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await share.goto(`file://${path('./og.html')}`);
await share.screenshot({ path: path('../public/og.png') });

const icon = await browser.newPage({ viewport: { width: 180, height: 180 } });
const svg = readFileSync(path('../public/favicon.svg'), 'utf8');
await icon.setContent(
  `<body style="margin:0">${svg.replace('<svg ', '<svg width="180" height="180" ')}</body>`,
);
await icon.screenshot({
  path: path('../public/apple-touch-icon.png'),
  omitBackground: true,
});

await browser.close();
