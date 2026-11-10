import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../src/lib/contrast';

/** The blueprint palette is a set of token overrides in blueprint.css, not part of tokens.css. */
const css = readFileSync(
  new URL('../src/styles/blueprint.css', import.meta.url),
  'utf8',
);
const block = /html\[data-blueprint\]\s*{([^}]*)}/.exec(css)?.[1] ?? '';
const colors = Object.fromEntries(
  [...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map(
    ([, name, value]) => [name, value],
  ),
);

describe('blueprint palette', () => {
  it('overrides the tokens the page reads', () => {
    for (const name of ['bg', 'fg', 'muted', 'panel', 'accent', 'on-accent']) {
      expect(colors[name], `--${name}`).toBeDefined();
    }
  });

  // WCAG 2.2 AA for text, like the light and dark themes.
  it.each([
    ['fg', 'bg'],
    ['fg', 'panel'],
    ['muted', 'bg'],
    ['muted', 'panel'],
    ['accent', 'bg'],
    ['on-accent', 'accent'],
  ])('%s on %s has AA contrast', (foreground, background) => {
    const ratio = contrastRatio(colors[foreground], colors[background]);
    expect(ratio, `${foreground} on ${background}`).toBeGreaterThanOrEqual(4.5);
  });
});
