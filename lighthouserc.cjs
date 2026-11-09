const { chromium } = require('@playwright/test');

// Uses the Chromium that Playwright installs, so there is one browser to maintain.
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      chromePath: process.env.CHROME_PATH ?? chromium.executablePath(),
      settings: { chromeFlags: '--no-sandbox' },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: { target: 'filesystem', outputDir: '.lighthouseci' },
  },
};
