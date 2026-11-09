# 🗂️ Repo layout

What every entry in the repository root is for.

## Today

| Path | What it is |
| :--- | :--- |
| [`README.md`](../README.md) | Project overview, stack, principles and roadmap |
| [`AGENTS.md`](../AGENTS.md) | Rules for AI coding agents working in this repository |
| [`docs/`](.) | Project documentation |
| [`.devcontainer/`](../.devcontainer/) | Dev container configuration and setup script. See [Dev environment](dev-environment.md) |
| [`src/`](../src/) | The site. `pages/` holds the routes, `styles/` the global CSS |
| `astro.config.mjs` | Astro configuration: the site URL and the Tailwind plugin |
| `tsconfig.json` | TypeScript configuration, extends Astro's strict preset |
| `package.json`, `package-lock.json` | Dependencies and npm scripts |
| `.nvmrc` | Node version for local and hosted builds |

## Planned

These appear as the roadmap in the README is completed.

| Path | What it will be |
| :--- | :--- |
| `public/` | Static files served as they are |
| `.github/workflows/` | CI |

## Local-only folders

These stay out of git and are described in [`AGENTS.md`](../AGENTS.md).

| Path | What it holds |
| :--- | :--- |
| `plans/` | Plans, local to one machine |
| `dev-only/` | Scratch space for prototypes and experiments |
