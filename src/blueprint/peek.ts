import { WIDE } from './context';
import { dimensionName } from './dimensions';
import { Drawing } from './drawing';
import { bottom, boxOf, pageSize } from './measure';

const ATTRIBUTE = 'data-blueprint-peek';

/**
 * A glimpse of the mode, for the moment someone hovers the chip: the column lines light up and the
 * name gets its dimensions. It adds one small layer and one attribute, and the returned function
 * takes both away again.
 */
export function showPeek(): () => void {
  const root = document.documentElement;
  root.setAttribute(ATTRIBUTE, '');
  const layer = document.createElement('div');
  layer.className = 'bp-layer';
  layer.setAttribute('data-blueprint-ui', '');

  const line = document.querySelector('.hero h1 .line');
  const { width, height } = pageSize();
  if (line && width >= WIDE) {
    const name = boxOf(line);
    // Only worth drawing when the name is on the screen.
    if (bottom(name) > scrollY && name.y < scrollY + innerHeight) {
      const drawing = new Drawing(width, height);
      dimensionName(drawing, name);
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
