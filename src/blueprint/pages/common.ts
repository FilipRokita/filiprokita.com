import type { PageContext } from '../context';
import { dimensionDown } from '../dimensions';
import { bottom, boxOf } from '../measure';
import { findAll } from './query';

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
