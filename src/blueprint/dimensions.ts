import type { Drawing } from './drawing';
import type { Box } from './measure';
import { bottom, right } from './measure';
import { round } from './svg';

const TICK = 6;
const ARROW = 9;
const ARROW_HALF_WIDTH = 3.5;

/** A small filled arrowhead at (x, y), pointing along (dx, dy). */
function arrowhead(
  drawing: Drawing,
  x: number,
  y: number,
  dx: number,
  dy: number,
) {
  const px = -dy;
  const py = dx;
  const back = { x: x - dx * ARROW, y: y - dy * ARROW };
  drawing.fill(
    `M${round(x)} ${round(y)}L${round(back.x + px * ARROW_HALF_WIDTH)} ${round(back.y + py * ARROW_HALF_WIDTH)}` +
      `L${round(back.x - px * ARROW_HALF_WIDTH)} ${round(back.y - py * ARROW_HALF_WIDTH)}Z`,
  );
}

/** A horizontal dimension line from x1 to x2 at height y, with its value in the middle. */
export function dimensionAcross(
  drawing: Drawing,
  {
    x1,
    x2,
    y,
    label,
    extendTo,
  }: { x1: number; x2: number; y: number; label: string; extendTo: number },
) {
  drawing.advance(0.04);
  drawing.line(`M${x1} ${y}H${x2}`);
  drawing.line(
    `M${x1} ${y - TICK}V${extendTo}M${x2} ${y - TICK}V${extendTo}`,
    'faint',
  );
  arrowhead(drawing, x1, y, -1, 0);
  arrowhead(drawing, x2, y, 1, 0);
  drawing.text((x1 + x2) / 2, y + 4, label, 'dimension', { anchor: 'middle' });
}

/** A vertical dimension line from y1 to y2 at distance x, with its value turned to read upwards. */
export function dimensionDown(
  drawing: Drawing,
  {
    x,
    y1,
    y2,
    label,
    extendTo,
  }: { x: number; y1: number; y2: number; label: string; extendTo: number },
) {
  drawing.advance(0.04);
  drawing.line(`M${x} ${y1}V${y2}`);
  drawing.line(
    `M${x - TICK} ${y1}H${extendTo}M${x - TICK} ${y2}H${extendTo}`,
    'faint',
  );
  arrowhead(drawing, x, y1, 0, -1);
  arrowhead(drawing, x, y2, 0, 1);
  const middle = (y1 + y2) / 2;
  const text = drawing.text(x, middle + 4, label, 'dimension', {
    anchor: 'middle',
  });
  text.setAttribute('transform', `rotate(-90 ${round(x)} ${round(middle)})`);
}

/** A registration mark: a cross in a circle. */
export function crosshair(drawing: Drawing, x: number, y: number) {
  drawing.advance(0.02);
  drawing.line(`M${x - 11} ${y}H${x + 11}M${x} ${y - 11}V${y + 11}`);
  drawing.line(`M${x + 5} ${y}A5 5 0 1 1 ${x + 4.99} ${y}`, 'faint');
}

/** The lettered circle at the end of a section line, with an arrow showing where to look. */
export function sectionMark(
  drawing: Drawing,
  x: number,
  y: number,
  letter: string,
) {
  drawing.line(`M${x - 10} ${y}a10 10 0 1 0 20 0a10 10 0 1 0 -20 0`);
  drawing.text(x, y + 3.5, letter, 'mark', { anchor: 'middle' });
  drawing.line(
    `M${x} ${y + 10}V${y + 26}M${x - 5} ${y + 20}L${x} ${y + 26}L${x + 5} ${y + 20}`,
  );
}

/** A scale bar in pixels, with ticks every 20 and numbers every 100. */
export function ruler(drawing: Drawing, x: number, y: number, length = 200) {
  drawing.advance(0.05);
  let d = `M${x} ${y}H${x + length}`;
  for (let at = 0; at <= length; at += 20)
    d += `M${x + at} ${y}V${y - (at % 100 === 0 ? 10 : 5)}`;
  drawing.line(d);
  for (let at = 0; at <= length; at += 100) {
    drawing.text(x + at, y + 14, String(at), 'size', { anchor: 'middle' });
  }
  drawing.text(x + length + 14, y + 4, 'PX', 'size');
}

/** The dimensions of a big title: its width across the top and its height down the left. */
export function dimensionName(drawing: Drawing, name: Box) {
  dimensionAcross(drawing, {
    x1: name.x,
    x2: right(name),
    y: name.y - 26,
    label: `${Math.round(name.w)} px`,
    extendTo: name.y + 6,
  });
  dimensionDown(drawing, {
    x: name.x - 22,
    y1: name.y,
    y2: bottom(name),
    label: `${Math.round(name.h)}`,
    extendTo: name.x + 4,
  });
}
