import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://127.0.0.1:4173' },
  // Serves the production build on its own port, never a dev server, so run `npm run build` first.
  webServer: {
    // --ignore-lock keeps the server in the foreground, where Playwright manages it. Without it
    // Astro starts a background server when it runs under an AI agent, and the command exits.
    command: 'npx astro preview --host 127.0.0.1 --port 4173 --ignore-lock',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
});
