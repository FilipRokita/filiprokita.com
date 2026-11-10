/**
 * Blueprint mode: the page turns into a technical drawing of itself.
 *
 * This module is loaded on first use (hover, focus, touch or click on the chip), never with the
 * page. It owns the on and off switch. Everything the mode adds to the page is mounted in
 * `start` and removed again in `stop`, so that off really means off.
 */
import blueprintCss from '../styles/blueprint.css?inline';

const ATTRIBUTE = 'data-blueprint';
const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

/** A point on the screen, in CSS pixels. */
export interface Origin {
  x: number;
  y: number;
}

/**
 * The mode's styles go in through the CSSOM. They stay out of the page's HTML and stylesheets, and
 * the content security policy allows this. Every rule is under `html[data-blueprint]`, so they do
 * nothing until the mode is on.
 */
const loadStyles = () => {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(blueprintCss);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
};
let stylesLoaded = false;

/** Aborted when the mode turns off. Everything mounted for the mode listens to its signal. */
let session: AbortController | null = null;

export const isBlueprint = () => root.hasAttribute(ATTRIBUTE);

const start = () => {
  if (!stylesLoaded) {
    loadStyles();
    stylesLoaded = true;
  }
  session = new AbortController();
  root.setAttribute(ATTRIBUTE, '');
};

const stop = () => {
  session?.abort();
  session = null;
  root.removeAttribute(ATTRIBUTE);
};

/**
 * Turns the mode on or off and resolves to the new state. With an `origin` the change grows
 * as a circle from that point, the same way a theme change does.
 */
export async function toggleBlueprint(origin?: Origin): Promise<boolean> {
  const next = !isBlueprint();
  const apply = next ? start : stop;
  if (!origin || !document.startViewTransition || reducedMotion.matches) {
    apply();
    return next;
  }
  root.style.setProperty('--tx', `${origin.x}px`);
  root.style.setProperty('--ty', `${origin.y}px`);
  root.classList.add('theme-vt');
  try {
    await document.startViewTransition(apply).finished;
  } finally {
    root.classList.remove('theme-vt');
  }
  return next;
}
