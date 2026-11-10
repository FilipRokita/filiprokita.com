# 🗂️ Repo layout

What every entry in the repository root is for.

## Today

| Path | What it is |
| :--- | :--- |
| [`README.md`](../README.md) | Project overview, stack and principles |
| [`SECURITY.md`](../SECURITY.md) | How to report a vulnerability |
| `.gitattributes` | Line ending rules |
| [`AGENTS.md`](../AGENTS.md) | Rules for AI coding agents working in this repository |
| [`docs/`](.) | Project documentation |
| [`.devcontainer/`](../.devcontainer/) | Dev container configuration and setup script. See [Dev environment](dev-environment.md) |
| [`src/`](../src/) | The site: `pages/` routes, `layouts/`, `components/`, `styles/` (tokens, base, motion), `lib/` pure helpers, `config/` site facts, `content/projects/` one file per project, `schemas/`, `assets/` images. See [Content](content.md) |
| [`src/blueprint/`](../src/blueprint/) | Blueprint mode: the lazy module that draws the page. See [Blueprint mode](blueprint.md) |
| `src/content.config.ts` | The projects collection and its loader |
| `astro.config.mjs` | Astro configuration: site URL, Tailwind, sitemap, fonts, the Content Security Policy and the build info |
| `tsconfig.json` | TypeScript configuration, extends Astro's strict preset |
| `package.json`, `package-lock.json` | Dependencies and npm scripts |
| `.nvmrc` | Node version for local and hosted builds |
| [`.agents/skills/`](../.agents/skills/) | Agent skills in the open SKILL.md format. `.claude/skills` is a symlink to it for Claude Code. See [Content](content.md#keep-projects-up-to-date) |
| [`scripts/`](../scripts/) | Helper scripts: `repo-facts.mjs` for the skill, and `blueprint-bom.mjs`, which `npm run build` runs after Astro |
| [`public/`](../public/) | Static files served as they are, including the share image `og.png` |
| [`design/`](../design/) | Source of the generated images. `npm run assets` renders the share image `public/og.png` from `og.html` and `public/apple-touch-icon.png` from the favicon |
| [`tests/`](../tests/), `vitest.config.ts` | Unit tests. See [Testing](testing.md) |
| `eslint.config.js` | ESLint rules: TypeScript, Astro and accessibility |
| `.prettierrc.mjs`, `.prettierignore` | Prettier settings and what it skips |
| [`e2e/`](../e2e/), `playwright.config.ts` | Browser tests. See [Testing](testing.md) |
| `lighthouserc.cjs` | Lighthouse CI settings and score thresholds |
| [`wrangler.jsonc`](../wrangler.jsonc) | Cloudflare deploy config: serves `dist/` as static assets, with `404.html` for unknown paths. Deploy with `npm run build` then `npx wrangler deploy` |
| [`.github/`](../.github/) | CI workflow and Dependabot configuration |

## Local-only folders

These stay out of git and are described in [`AGENTS.md`](../AGENTS.md).

| Path | What it holds |
| :--- | :--- |
| `plans/` | Plans, local to one machine |
| `dev-only/` | Scratch space for prototypes and experiments |
