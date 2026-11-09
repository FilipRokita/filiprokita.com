// @ts-check
import { execSync } from 'node:child_process';
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

export default defineConfig({
  site: 'https://www.filiprokita.com',
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
  ],
  vite: {
    plugins: [tailwindcss()],
    define: {
      __BUILD__: JSON.stringify({
        date: new Date().toISOString().slice(0, 10),
        commit,
      }),
    },
  },
});
