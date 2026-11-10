import tokensCss from '../styles/tokens.css?raw';

export interface SiteColors {
  bg: string;
  fg: string;
  muted: string;
  accent: string;
}

/** Reads `--name: light-dark(#light, #dark)` from tokens.css, once. */
const PAIRS = new Map(
  [
    ...tokensCss.matchAll(
      /--([\w-]+):\s*light-dark\(\s*(#[0-9a-f]{3,6})\s*,\s*(#[0-9a-f]{3,6})\s*\)/gi,
    ),
  ].map(([, name, light, dark]) => [name, { light, dark }] as const),
);

const currentTheme = (): 'light' | 'dark' => {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === 'light' || chosen === 'dark') return chosen;
  return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

/** The colors the site really uses in the theme the visitor has, for the palette on the drawing. */
export function siteColors(): SiteColors {
  const theme = currentTheme();
  const pick = (name: string) => PAIRS.get(name)?.[theme] ?? '#000000';
  return {
    bg: pick('bg'),
    fg: pick('fg'),
    muted: pick('muted'),
    accent: pick('accent'),
  };
}

/** The width of the column gutter in pixels, which is fluid, so it is measured. */
export function gutterWidth(): number {
  const probe = document.createElement('i');
  probe.style.display = 'block';
  probe.style.width = 'var(--spacing-gutter)';
  document.body.append(probe);
  const width = Math.round(probe.getBoundingClientRect().width);
  probe.remove();
  return width;
}
