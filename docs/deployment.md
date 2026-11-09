# ☁️ Deployment

Where the site is hosted and how the domains are set up.

## Hosting

Cloudflare, serving the static build. Static asset requests are free and
unlimited, and Cloudflare allows commercial use of the free plan to the extent its
terms describe, which is worth a final check before launch.

Cloudflare points new projects to Workers with static assets. Pages still works
and receives fewer new features. The site is plain static output either way, so
switching later is cheap. The final choice is confirmed against the official
Cloudflare docs when the deploy step is reached.

## Domains

```mermaid
flowchart LR
    A[filiprokita.com] -.->|redirect| B[www.filiprokita.com]
```

| Domain | Role |
| :--- | :--- |
| `www.filiprokita.com` | Canonical address. Set as `site` in the Astro config |
| `filiprokita.com` | Redirects to the canonical address |

## Build settings

| Setting | Value |
| :--- | :--- |
| Node | 26, set by `.nvmrc` |
| Build command | `npm run build` |
| Output directory | `dist` |

## Contact

`contact@filiprokita.com`
