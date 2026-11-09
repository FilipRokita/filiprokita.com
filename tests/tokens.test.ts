import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../src/lib/contrast';

type Pair = { light: string; dark: string };

/** Reads every `--name: light-dark(#light, #dark)` color token from tokens.css. */
const readTokens = (): Record<string, Pair> => {
  const css = readFileSync(
    new URL('../src/styles/tokens.css', import.meta.url),
    'utf8',
  );
  const tokens: Record<string, Pair> = {};
  for (const [, name, light, dark] of css.matchAll(
    /--([\w-]+):\s*light-dark\(\s*(#[0-9a-f]{3,6})\s*,\s*(#[0-9a-f]{3,6})\s*\)/gi,
  )) {
    tokens[name] = { light, dark };
  }
  return tokens;
};

const tokens = readTokens();

// WCAG 2.2 AA: 4.5 for text. Each pair is a text color on the surface it is used on.
const textPairs: [string, string][] = [
  ['fg', 'bg'],
  ['fg', 'panel'],
  ['muted', 'bg'],
  ['muted', 'panel'],
  ['accent', 'bg'],
  ['on-accent', 'accent'],
];

describe('design tokens', () => {
  it('defines every color the pairs use', () => {
    for (const name of new Set(textPairs.flat())) {
      expect(tokens[name], `--${name}`).toBeDefined();
    }
  });

  describe.each(['light', 'dark'] as const)('%s theme', (theme) => {
    it.each(textPairs)('%s on %s has AA contrast', (foreground, background) => {
      const ratio = contrastRatio(
        tokens[foreground][theme],
        tokens[background][theme],
      );
      expect(ratio, `${foreground} on ${background}`).toBeGreaterThanOrEqual(
        4.5,
      );
    });
  });
});
