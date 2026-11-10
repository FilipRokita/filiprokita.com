import type { Drawing } from './drawing';
import type { Box } from './measure';
import { right } from './measure';
import { round } from './svg';

export interface Point {
  x: number;
  y: number;
}

const ARROWHEAD = 13;
const ARROWHEAD_ANGLE = 0.5;

/** A wobbly arrow from one point to another, as the path of a pen: a curve and an open head. */
export function squiggle(
  from: Point,
  to: Point,
  bend: number,
  random: () => number,
): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const wobble = () => (random() - 0.5) * 7;
  const c1 = {
    x: from.x + dx * 0.3 + nx * bend + wobble(),
    y: from.y + dy * 0.3 + ny * bend + wobble(),
  };
  const c2 = {
    x: from.x + dx * 0.7 + nx * bend * 0.8 + wobble(),
    y: from.y + dy * 0.7 + ny * bend * 0.8 + wobble(),
  };
  const tx = to.x - c2.x;
  const ty = to.y - c2.y;
  const tangent = Math.hypot(tx, ty) || 1;
  const ux = tx / tangent;
  const uy = ty / tangent;
  const head = (side: number): Point => ({
    x:
      to.x -
      ARROWHEAD *
        (ux * Math.cos(side * ARROWHEAD_ANGLE) -
          uy * Math.sin(side * ARROWHEAD_ANGLE)),
    y:
      to.y -
      ARROWHEAD *
        (uy * Math.cos(side * ARROWHEAD_ANGLE) +
          ux * Math.sin(side * ARROWHEAD_ANGLE)),
  });
  const a = head(1);
  const b = head(-1);
  const p = (point: Point) => `${round(point.x)} ${round(point.y)}`;
  return `M${p(from)}C${p(c1)} ${p(c2)} ${p(to)}M${p(a)}L${p(to)}L${p(b)}`;
}

/** The scalloped outline of a revision cloud around a box. */
export function cloudPath(box: Box): string {
  const edge = (length: number) => {
    const count = Math.max(2, Math.round(length / 14));
    return { count, step: length / count };
  };
  const arc = (step: number, dx: number, dy: number) =>
    `a${round(step / 2)} ${round(step / 2)} 0 0 1 ${round(dx)} ${round(dy)}`;
  let d = `M${round(box.x)} ${round(box.y)}`;
  const across = edge(box.w);
  const down = edge(box.h);
  for (let i = 0; i < across.count; i++) d += arc(across.step, across.step, 0);
  for (let i = 0; i < down.count; i++) d += arc(down.step, 0, down.step);
  for (let i = 0; i < across.count; i++) d += arc(across.step, -across.step, 0);
  for (let i = 0; i < down.count; i++) d += arc(down.step, 0, -down.step);
  return `${d}Z`;
}

/** A revision cloud drawn around an element's box. Returns the box it takes up. */
export function cloud(drawing: Drawing, box: Box, padding = 8): Box {
  const outer = {
    x: box.x - padding,
    y: box.y - padding,
    w: box.w + padding * 2,
    h: box.h + padding * 2,
  };
  drawing.advance(0.1);
  drawing.line(cloudPath(outer), 'redline');
  return outer;
}

export interface NoteOptions {
  /** How much the arrow bows, and to which side. */
  bend?: number;
  /** Tilt of the handwriting in degrees. */
  rotate?: number;
  small?: boolean;
}

const LINE_HEIGHT = { big: 23, small: 19 };
/** The least room between a note and the edge of the sheet. */
const EDGE = 20;

/**
 * A handwritten note: some lines of text, and an arrow to a point. The text is measured for real,
 * and slides down until it does not sit on another note.
 */
export function note(
  drawing: Drawing,
  at: Point,
  lines: string[],
  target: Point | null,
  { bend = 22, rotate = -2, small = false }: NoteOptions = {},
) {
  const lineHeight = small ? LINE_HEIGHT.small : LINE_HEIGHT.big;
  drawing.advance(0.12);
  const texts = lines.map((line) =>
    drawing.text(at.x, at.y, line, small ? 'hand-small' : 'hand'),
  );
  const width = Math.max(...texts.map((text) => text.getComputedTextLength()));
  const height = lines.length * lineHeight;

  // The note stays on the sheet, and is never written over another note: it is moved left until
  // it fits, and down until the place is free.
  const x = Math.max(EDGE, Math.min(at.x, drawing.width - EDGE - width));
  const free = drawing.reserved.claim({
    x,
    y: at.y - lineHeight,
    w: width,
    h: height,
  });
  texts.forEach((text, index) => {
    const y = free.y + lineHeight * (index + 1);
    text.setAttribute('x', String(round(x)));
    text.setAttribute('y', String(round(y)));
    if (rotate) {
      text.setAttribute(
        'transform',
        `rotate(${rotate} ${round(x)} ${round(y)})`,
      );
    }
  });
  if (!target) return;

  const top = free.y + lineHeight * 0.2;
  const base = free.y + free.h - lineHeight * 0.4;
  const middle = free.x + free.w / 2;
  let from: Point;
  if (target.y > base + 14) from = { x: middle, y: base + 4 };
  else if (target.y < top - 8) from = { x: middle, y: top - 2 };
  else if (target.x < free.x)
    from = { x: free.x - 6, y: free.y + lineHeight * 0.5 };
  else from = { x: right(free) + 6, y: free.y + lineHeight * 0.5 };
  const dx = target.x - from.x;
  const dy = target.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const gap = 6;
  const end = {
    x: target.x - (dx / length) * gap,
    y: target.y - (dy / length) * gap,
  };
  drawing.line(squiggle(from, end, bend, drawing.random), 'redline');
}
