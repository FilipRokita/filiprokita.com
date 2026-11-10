// @ts-check
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// The short commit of this build, for the footer. Not every build has git history.
const commit = (() => {
  try {
    return execSync('git rev-parse --short HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return '';
  }
})();

// Whether this build is of main. Only main gets there through the required checks, so only it may say
// so. It is known from the CI of the host (Cloudflare, GitHub Actions). A build on a laptop never is.
const onMain =
  (process.env.WORKERS_CI_BRANCH ?? process.env.GITHUB_REF_NAME) === 'main';

// The inline theme script runs before paint, so it cannot be a bundled file. The CSP allows it by hash.
const themeInitHash = `sha256-${createHash('sha256')
  .update(readFileSync('./src/scripts/theme-init.js', 'utf8'))
  .digest('base64')}`;

export default defineConfig({
  site: 'https://www.filiprokita.com',
  security: {
    csp: {
      scriptDirective: {
        resources: ["'self'", "'inline-speculation-rules'"],
        hashes: [themeInitHash],
      },
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "object-src 'none'",
        "base-uri 'none'",
        "form-action 'none'",
      ],
    },
  },
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Geist',
      cssVariable: '--font-geist',
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Geist Mono',
      cssVariable: '--font-geist-mono',
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin'],
    },
    {
      // Handwriting for the blueprint notes. Declared only: the file loads when a note uses it.
      provider: fontProviders.fontsource(),
      name: 'Caveat',
      cssVariable: '--font-hand',
      weights: ['700'],
      styles: ['normal'],
      subsets: ['latin'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
    define: {
      __BUILD__: JSON.stringify({
        date: new Date().toISOString().slice(0, 10),
        commit,
        onMain,
      }),
    },
  },
});
