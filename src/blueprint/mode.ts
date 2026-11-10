/**
 * Blueprint mode: the page turns into a technical drawing of itself.
 *
 * This module is loaded on first use (hover, focus, touch or click on the chip), never with the
 * page. It owns the on and off switch. Everything the mode adds to the page is mounted in
 * `start` and removed again in `stop`, so that off really means off.
 */
import blueprintCss from '../styles/blueprint.css?inline';
import { tintBrowserBar } from './browser-bar';
import { lockDark } from './dark';
import { mountDrawer } from './drawer';
import { mountInspector } from './inspector';
import { mountLayer } from './layer';
import { showPeek } from './peek';
import { mountSheet } from './sheet';

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
let stylesLoaded = false;
const loadStyles = () => {
  if (stylesLoaded) return;
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(blueprintCss);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  stylesLoaded = true;
};

/** Aborted when the mode turns off. Everything mounted for the mode listens to its signal. */
let session: AbortController | null = null;

export const isBlueprint = () => root.hasAttribute(ATTRIBUTE);

/** Takes away the glimpse of the mode, if one is showing. */
let endPeek: (() => void) | null = null;

/** Shows or hides a glimpse of the mode, for when the chip is hovered or focused. */
export function peek(on: boolean) {
  endPeek?.();
  endPeek = null;
  if (!on || isBlueprint()) return;
  loadStyles();
  endPeek = showPeek();
}

const start = () => {
  peek(false);
  loadStyles();
  session = new AbortController();
  root.setAttribute(ATTRIBUTE, '');
  // First, so on the way out the theme is back before the browser bar looks at it.
  lockDark(session.signal);
  tintBrowserBar(session.signal);
  mountSheet(session.signal);
  mountLayer(session.signal);
  mountInspector(session.signal);
  mountDrawer(session.signal);
};

const stop = () => {
  session?.abort();
  session = null;
  root.removeAttribute(ATTRIBUTE);
};

/** Turns the mode on or off. The change grows as a circle from `origin` when there is one. */
async function change(origin?: Origin): Promise<boolean> {
  // The state is read here, when it is this change's turn, and not when it was asked for.
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

let queue: Promise<unknown> = Promise.resolve();

/**
 * Turns the mode on or off and resolves to the new state. Changes happen one after the other, so a
 * double click, or a click and a palette entry together, can never mount the mode twice.
 */
export function toggleBlueprint(origin?: Origin): Promise<boolean> {
  const result = queue.then(() => change(origin));
  queue = result.catch(() => undefined);
  return result;
}
