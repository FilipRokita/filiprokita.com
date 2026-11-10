import { WIDE } from './context';
import { dimensionName } from './dimensions';
import { Drawing } from './drawing';
import type { Box } from './measure';
import { bottom, boxOf, pageSize, textBox } from './measure';

const ATTRIBUTE = 'data-blueprint-peek';
const HEADER = 80;

/** What gets its dimensions: the big name or title of the page, and the first section title in view. */
function glimpsed(): Box[] {
  const line = document.querySelector('.hero h1 .line');
  const title = document.querySelector('main h1');
  const name = line ? boxOf(line) : title ? textBox(title) : null;
  const headings = [...document.querySelectorAll('main section[id] h2')]
    .map(textBox)
    .filter(clear);
  return name ? [name, ...headings.slice(0, 1)] : headings.slice(0, 1);
}

/** Below the fixed header and above the bottom edge, so the dimensions are not hidden. */
const clear = (box: Box) =>
  box.y > scrollY + HEADER && bottom(box) < scrollY + innerHeight;

const onScreen = (box: Box) =>
  bottom(box) > scrollY && box.y < scrollY + innerHeight;

/**
 * A glimpse of the mode, for the moment someone hovers the chip: the column lines light up and the
 * title of the page and of the first section in view get their dimensions. It adds one small layer
 * and one attribute, and the returned function takes both away again.
 */
export function showPeek(): () => void {
  const root = document.documentElement;
  root.setAttribute(ATTRIBUTE, '');
  const layer = document.createElement('div');
  layer.className = 'bp-layer';
  layer.setAttribute('data-blueprint-ui', '');

  const { width, height } = pageSize();
  if (width >= WIDE) {
    const drawing = new Drawing(width, height);
    const shown = glimpsed().filter(onScreen);
    for (const box of shown) dimensionName(drawing, box);
    if (shown.length) {
      layer.style.height = `${height}px`;
      layer.append(drawing.svg);
      document.body.append(layer);
    }
  }

  return () => {
    root.removeAttribute(ATTRIBUTE);
    layer.remove();
  };
}
