import type { Drawing } from './drawing';
import type { Point } from './hand';
import { note } from './hand';
import { create, round } from './svg';

const SCALE = 5;
const RING = 12;
const circle = (center: Point, radius: number) =>
  `M${round(center.x - radius)} ${round(center.y)}a${radius} ${radius} 0 1 0 ${radius * 2} 0a${radius} ${radius} 0 1 0 ${-radius * 2} 0`;

/**
 * A detail view, like on a technical drawing: a ring around a small part of the page, and a big
 * circle that shows it magnified. The part is the real icon, copied from the page, not redrawn.
 */
export function detailBubble(
  drawing: Drawing,
  {
    icon,
    center,
    radius,
    label,
    remark,
  }: {
    icon: SVGSVGElement;
    center: Point;
    radius: number;
    label: string;
    remark: string[];
  },
) {
  const path = icon.querySelector('path');
  if (!path) return;
  const box = icon.getBoundingClientRect();
  const part = {
    x: box.left + scrollX + box.width / 2,
    y: box.top + scrollY + box.height / 2,
  };

  drawing.advance(0.06);
  drawing.line(circle(part, RING));
  const dx = center.x - part.x;
  const dy = center.y - part.y;
  const length = Math.hypot(dx, dy) || 1;
  drawing.line(
    `M${round(part.x + (dx / length) * RING)} ${round(part.y + (dy / length) * RING)}` +
      `L${round(center.x - (dx / length) * radius)} ${round(center.y - (dy / length) * radius)}`,
    'dash',
  );
  drawing.advance(0.04);
  drawing.line(circle(center, radius));

  // The icon is drawn in a 16 by 16 box. Magnified, that box is centered on the circle.
  const half = (16 * SCALE) / 2;
  const magnified = create('path', {
    d: path.getAttribute('d') ?? '',
    class: 'bp-magnified',
    transform: `translate(${round(center.x - half)} ${round(center.y - half)}) scale(${SCALE})`,
  });
  drawing.add(magnified);
  drawing.text(center.x + radius, center.y + radius + 18, label, 'size', {
    anchor: 'end',
  });
  note(
    drawing,
    { x: center.x - radius - 250, y: center.y + 4 },
    remark,
    { x: center.x - radius - 4, y: center.y - 2 },
    { bend: -14, small: true },
  );
}
