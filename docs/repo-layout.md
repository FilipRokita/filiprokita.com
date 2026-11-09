# 🗂️ Repo layout

What every entry in the repository root is for.

## Today

| Path | What it is |
| :--- | :--- |
| [`README.md`](../README.md) | Project overview, stack, principles and roadmap |
| [`AGENTS.md`](../AGENTS.md) | Rules for AI coding agents working in this repository |
| [`docs/`](.) | Project documentation |
| [`.devcontainer/`](../.devcontainer/) | Dev container configuration and setup script. See [Dev environment](dev-environment.md) |
| [`src/`](../src/) | The site: `pages/` routes, `layouts/`, `components/`, `styles/` (tokens, base, motion), `lib/` pure helpers, `config/` site facts, `content/projects/` one file per project, `schemas/`, `assets/` images. See [Content](content.md) |
| `src/content.config.ts` | The projects collection and its loader |
| `astro.config.mjs` | Astro configuration: the site URL and the Tailwind plugin |
| `tsconfig.json` | TypeScript configuration, extends Astro's strict preset |
| `package.json`, `package-lock.json` | Dependencies and npm scripts |
| `.nvmrc` | Node version for local and hosted builds |
| [`.agents/skills/`](../.agents/skills/) | Agent skills in the open SKILL.md format. `.claude/skills` is a symlink to it for Claude Code. See [Content](content.md#keep-projects-up-to-date) |
| [`scripts/`](../scripts/) | Helper scripts, such as `repo-facts.mjs` for the skill |
| [`public/`](../public/) | Static files served as they are, including the share image `og.png` |
| [`design/`](../design/) | Source of the generated images. `npm run assets` renders the share image `public/og.png` from `og.html` and `public/apple-touch-icon.png` from the favicon |
| [`tests/`](../tests/), `vitest.config.ts` | Unit tests. See [Testing](testing.md) |
| `eslint.config.js` | ESLint rules: TypeScript, Astro and accessibility |
| `.prettierrc.mjs`, `.prettierignore` | Prettier settings and what it skips |
| [`e2e/`](../e2e/), `playwright.config.ts` | Browser tests. See [Testing](testing.md) |
| `lighthouserc.cjs` | Lighthouse CI settings and score thresholds |
| [`.github/`](../.github/) | CI workflow and Dependabot configuration |

## Planned

These appear as the roadmap in the README is completed.

| Path | What it will be |
| :--- | :--- |

## Local-only folders

These stay out of git and are described in [`AGENTS.md`](../AGENTS.md).

| Path | What it holds |
| :--- | :--- |
| `plans/` | Plans, local to one machine |
| `dev-only/` | Scratch space for prototypes and experiments |
