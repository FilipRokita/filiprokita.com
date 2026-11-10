import { create, round } from './svg';

/** How a line looks. Solid lines draw themselves in, dashed ones fade in. */
export type LineKind = 'line' | 'faint' | 'dash' | 'dashdot' | 'redline';
export type TextKind = 'tag' | 'size' | 'dimension' | 'note' | 'hand';

const DASHED: LineKind[] = ['dash', 'dashdot'];

/**
 * One drawing: an SVG as big as the page, and a clock. Each mark appears a little after the
 * one before, so the sheet seems to be drawn while you watch.
 */
export class Drawing {
  readonly svg: SVGSVGElement;
  private clock = 0;

  constructor(width: number, height: number) {
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

  private stamp(element: SVGElement, animation: 'draw' | 'fade') {
    element.classList.add(`bp-${animation}`);
    element.style.setProperty('--d', `${round(this.clock)}s`);
  }

  /** A path. The clock does not move: call `advance` between marks that should follow each other. */
  line(d: string, kind: LineKind = 'line') {
    const dashed = DASHED.includes(kind);
    const path = create('path', {
      d,
      class: `bp-line bp-line--${kind}`,
      ...(dashed ? {} : { pathLength: 1 }),
    });
    this.stamp(path, dashed ? 'fade' : 'draw');
    this.svg.append(path);
    return path;
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
    this.stamp(text, 'fade');
    this.svg.append(text);
    return text;
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
    this.stamp(rect, 'fade');
    this.svg.append(rect);
    return rect;
  }
}
