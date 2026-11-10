import type { Drawing } from './drawing';
import type { Box } from './measure';
import { bottom, right } from './measure';

/** Corner brackets around a block, like the corners of a framed area on a drawing. */
export function brackets(drawing: Drawing, box: Box, size = 14) {
  const { x, y } = box;
  const r = right(box);
  const b = bottom(box);
  drawing.line(
    `M${x} ${y + size}V${y}H${x + size}` +
      `M${r - size} ${y}H${r}V${y + size}` +
      `M${r} ${b - size}V${b}H${r - size}` +
      `M${x + size} ${b}H${x}V${b - size}`,
  );
  drawing.advance(0.03);
}

const TAG_HEIGHT = 16;
const TAG_CHARACTER_WIDTH = 6.5;

/** A filled label in the top left corner of a block, with the name of the file behind it. */
export function tag(drawing: Drawing, box: Box, label: string) {
  const width = label.length * TAG_CHARACTER_WIDTH + 14;
  drawing.block(box.x, box.y, width, TAG_HEIGHT, 'bp-tag');
  drawing.text(box.x + 7, box.y + 11.5, label, 'tag');
}

/** The size of a block in pixels, in its bottom right corner. */
export function sizeLabel(drawing: Drawing, box: Box) {
  drawing.text(
    right(box) - 8,
    bottom(box) - 8,
    `${Math.round(box.w)} × ${Math.round(box.h)}`,
    'size',
    { anchor: 'end' },
  );
}
