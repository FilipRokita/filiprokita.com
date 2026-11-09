const { chromium } = require('@playwright/test');

const budgets = {
  'categories:performance': ['error', { minScore: 0.95 }],
  'categories:accessibility': ['error', { minScore: 1 }],
  'categories:best-practices': ['error', { minScore: 1 }],
  'categories:seo': ['error', { minScore: 1 }],
  'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
  'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }],
  'total-blocking-time': ['error', { maxNumericValue: 150 }],
};

// Uses the Chromium that Playwright installs, so there is one browser to maintain.
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      chromePath: process.env.CHROME_PATH ?? chromium.executablePath(),
      settings: { chromeFlags: '--no-sandbox' },
    },
    // The 404 page is noindex on purpose, so Lighthouse cannot give it a full SEO score.
    // It keeps every other budget.
    assert: {
      assertMatrix: [
        { matchingUrlPattern: '^(?!.*404\\.html).*$', assertions: budgets },
        {
          matchingUrlPattern: '404\\.html$',
          assertions: { ...budgets, 'categories:seo': 'off' },
        },
      ],
    },
    upload: { target: 'filesystem', outputDir: '.lighthouseci' },
  },
};
