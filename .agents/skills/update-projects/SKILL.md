---
name: update-projects
description: Keep the portfolio's project entries in step with the public GitHub repositories they describe, and draft an entry for a new repository. Use when asked to refresh, review or add projects.
compatibility: Needs Node 26 and network access to the public GitHub API.
---

# Update projects

The projects on the site are Markdown files in `src/content/projects/`. This skill
checks them against their public repositories and drafts new ones. Read
`docs/content.md` first: it lists the fields and the rules for case study text.

## Rules

- Read public repositories only. The script reports a private or missing repository as
  `available: false`. Do not try to get around that.
- Never write to `src/content/projects/` without the user seeing the change first.
  Show a diff or the full draft and wait for a yes.
- Only state what the repository shows: its description, topics, languages, README
  and homepage. Do not invent features, numbers, dates, employers or tools. If a fact
  is missing, leave the field out and say so.
- Copy follows `docs/content.md`: plain, evergreen, no em dash.
- Change no file outside `src/content/projects/` and the cover image for a new project.

## Check the existing entries

1. Run `node scripts/repo-facts.mjs --entries`.
2. For each entry compare with the facts: the one-line `summary`, the `stack`, the
   `links.live` (homepage) and the case study text against the README start.
3. Report only real differences, for example a stack item the repository no longer
   uses, or a homepage that changed. If nothing differs, say "no changes". Wording
   preferences and a trailing slash in a URL are not differences.
4. For each real difference, propose the smallest edit. Apply it only after approval.

## Draft a new project

1. Run `node scripts/repo-facts.mjs <owner/name>`.
2. Create `src/content/projects/<slug>.md` with all the required fields from
   `docs/content.md`. Use `order` after the last entry and `hidden: true` until the
   user has approved the text and added a cover image.
3. Run `npm run check` and `npm run build`. The schema must pass.
4. Show the draft and what is still missing (cover image, alt text, decisions).

## What it may change

`src/content/projects/*.md`, and for a new project its cover under
`src/assets/projects/<slug>/`. Nothing else.
