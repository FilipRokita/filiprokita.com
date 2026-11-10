import { Reservations } from './measure';
import { seeded } from './random';
import { create, round } from './svg';

/** How a line looks. Solid lines draw themselves in, dashed ones fade in. */
export type LineKind = 'line' | 'faint' | 'dash' | 'dashdot' | 'redline';
export type TextKind =
  | 'tag'
  | 'size'
  | 'dimension'
  | 'mark'
  | 'notes-title'
  | 'notes'
  | 'hand'
  | 'hand-small';

const DASHED: LineKind[] = ['dash', 'dashdot'];

/**
 * One drawing: an SVG as big as the page, and a clock. Each mark appears a little after the
 * one before, so the sheet seems to be drawn while you watch.
 */
export class Drawing {
  readonly svg: SVGSVGElement;
  /** The width of the sheet, so a note can keep inside it. */
  readonly width: number;
  private clock = 0;
  /** The same every time: the hand-drawn lines must not change from one visit to the next. */
  readonly random = seeded(7);
  readonly reserved = new Reservations();

  constructor(width: number, height: number) {
    this.width = width;
    this.svg = create('svg', {
      width,
      height,
      viewBox: `0 0 ${width} ${height}`,
      'aria-hidden': 'true',
      focusable: 'false',
    });
  }

  /** Moves the clock on and returns it in seconds. */
  advance(seconds = 0.05) {
    this.clock += seconds;
    return this.clock;
  }

  /** Puts any element on the sheet, appearing at the current time. Solid lines draw, the rest fades in. */
  add<T extends SVGElement>(
    element: T,
    animation: 'draw' | 'fade' = 'fade',
  ): T {
    element.classList.add(`bp-${animation}`);
    element.style.setProperty('--d', `${round(this.clock)}s`);
    this.svg.append(element);
    return element;
  }

  /** A path. The clock does not move: call `advance` between marks that should follow each other. */
  line(d: string, kind: LineKind = 'line') {
    const dashed = DASHED.includes(kind);
    const path = create('path', {
      d,
      class: `bp-line bp-line--${kind}`,
      ...(dashed ? {} : { pathLength: 1 }),
    });
    return this.add(path, dashed ? 'fade' : 'draw');
  }

  text(
    x: number,
    y: number,
    content: string,
    kind: TextKind,
    {
      anchor = 'start',
      rotate = 0,
    }: { anchor?: 'start' | 'middle' | 'end'; rotate?: number } = {},
  ) {
    const text = create('text', {
      x: round(x),
      y: round(y),
      class: `bp-text bp-text--${kind}`,
      'text-anchor': anchor,
      ...(rotate
        ? { transform: `rotate(${rotate} ${round(x)} ${round(y)})` }
        : {}),
    });
    text.textContent = content;
    return this.add(text);
  }

  /** A filled shape, like an arrowhead. */
  fill(d: string) {
    const path = create('path', { d, class: 'bp-fill' });
    return this.add(path);
  }

  /** A square of color with an outline, for the palette. */
  swatch(x: number, y: number, size: number, color: string) {
    const rect = create('rect', {
      x: round(x),
      y: round(y),
      width: size,
      height: size,
      class: 'bp-swatch',
    });
    // The fill is the color being shown, so it is set through the CSSOM, which the content security policy allows.
    rect.style.fill = color;
    return this.add(rect);
  }

  /** A filled rectangle, for the tags. */
  block(x: number, y: number, w: number, h: number, className: string) {
    const rect = create('rect', {
      x: round(x),
      y: round(y),
      width: round(w),
      height: round(h),
      class: className,
    });
    return this.add(rect);
  }
}
