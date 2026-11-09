// Renders design/og.html to public/og.png with Playwright.
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('./og.html', import.meta.url));
const target = fileURLToPath(new URL('../public/og.png', import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(`file://${source}`);
await page.screenshot({ path: target });
await browser.close();
