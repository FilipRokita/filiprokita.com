import type { PageContext } from '../context';
import { dimensionDown, dimensionName } from '../dimensions';
import { bottom, boxOf, textBox } from '../measure';
import { find, findAll } from './query';

/** The height of every section, down the left edge of the sheet. */
export function paintSectionHeights({ drawing, wide }: PageContext) {
  if (!wide) return;
  for (const section of findAll('main section[id]')) {
    const box = boxOf(section);
    dimensionDown(drawing, {
      x: 22,
      y1: box.y + 14,
      y2: bottom(box) - 14,
      label: `${Math.round(box.h)}`,
      extendTo: 40,
    });
  }
}

/** The width and height of the big title of a page, measured from its text. */
export function paintTitleDimensions({ drawing, wide }: PageContext) {
  const title = find('main h1');
  if (title && wide) dimensionName(drawing, textBox(title));
}
