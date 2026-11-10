import { site } from '../config/site';
import { Drawing } from './drawing';
import { brackets, tag } from './marks';
import { create, round } from './svg';

/** The sheet border sits this far from the edge of the screen, and the inner line this far. */
const OUTER = 4;
const INNER = 20;
/** About how wide a zone of the sheet is, like the lettered columns on a drawing. */
const ZONE = 150;
/** After this much scrolling the title block shrinks to a chip, so it never covers the content. */
const COMPACT_AFTER = 260;
/** Within this distance of the end of the page the title block steps aside, so it never hides the footer. */
const CLEAR_BEFORE_END = 140;
const DRAWING_NUMBER = 'FR-001';

const cell = (label: string, value: string, signature = false) => {
  const element = document.createElement('div');
  element.className = 'bp-cell';
  const small = document.createElement('small');
  small.textContent = label;
  const strong = document.createElement('b');
  if (signature) strong.className = 'bp-signature';
  strong.textContent = value;
  element.append(small, strong);
  return element;
};

const row = (...cells: HTMLElement[]) => {
  const element = document.createElement('div');
  element.className = 'bp-row';
  element.append(...cells);
  return element;
};

/** The rubber stamp: it says the page passed CI only when this is a build of main, which only passes get into. */
function stamp() {
  const { date, onMain } = __BUILD__;
  const ink = create(
    'filter',
    { id: 'bp-ink', x: '-5%', y: '-5%', width: '110%', height: '110%' },
    create('feTurbulence', {
      type: 'fractalNoise',
      baseFrequency: 0.85,
      numOctaves: 2,
      seed: 4,
      result: 'noise',
    }),
    create('feColorMatrix', {
      in: 'noise',
      type: 'matrix',
      values: '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.75',
      result: 'holes',
    }),
    create('feComposite', {
      in: 'SourceGraphic',
      in2: 'holes',
      operator: 'in',
      result: 'worn',
    }),
    create('feDisplacementMap', { in: 'worn', in2: 'noise', scale: 2.4 }),
  );
  const big = create('text', {
    class: 'bp-stamp-text',
    x: 98,
    y: 43,
    'text-anchor': 'middle',
  });
  big.textContent = onMain ? 'CI PASSED' : 'PREVIEW';
  const small = create('text', {
    class: 'bp-stamp-small',
    x: 98,
    y: 61,
    'text-anchor': 'middle',
  });
  small.textContent = `${onMain ? 'MAIN' : 'NOT MAIN'} · ${date}`;
  const inked = create(
    'g',
    { filter: 'url(#bp-ink)', class: 'bp-stamp-ink' },
    create('rect', {
      x: 3,
      y: 3,
      width: 190,
      height: 74,
      rx: 7,
      class: 'bp-stamp-outer',
    }),
    create('rect', {
      x: 10,
      y: 10,
      width: 176,
      height: 60,
      rx: 3,
      class: 'bp-stamp-inner',
    }),
    big,
    small,
  );
  return create(
    'svg',
    {
      class: 'bp-stamp',
      viewBox: '0 0 196 80',
      width: 196,
      height: 80,
      'aria-hidden': 'true',
      focusable: 'false',
    },
    create('defs', {}, ink),
    inked,
  );
}

/** The title block of the drawing. Every value is a fact about this build. */
function titleBlock() {
  const { date, commit, onMain } = __BUILD__;
  const block = document.createElement('div');
  block.className = 'bp-title';
  block.setAttribute('data-blueprint-ui', '');
  // The title block is part of the picture. The page itself says all of this in text.
  block.setAttribute('aria-hidden', 'true');
  block.append(
    row(cell('PROJECT', `${site.name} · portfolio`)),
    row(
      cell('DRAWING NO.', DRAWING_NUMBER),
      cell('REVISION', commit || 'local'),
    ),
    row(
      cell('DRAWN', site.name.replace(/(\w+) (\w)\w*/, '$1 $2.'), true),
      cell('CHECKED', onMain ? 'CI' : 'DRAFT'),
      cell('SHEET', '1 / 1'),
    ),
    row(cell('SCALE', '1 : 1 (px)'), cell('DATE', date)),
  );
  block.append(stamp());
  return block;
}

/** The sheet border with its lettered and numbered zones. */
function drawFrame(frame: SVGSVGElement) {
  const width = innerWidth;
  const height = innerHeight;
  const columns = Math.max(4, Math.round(width / ZONE));
  const rows = Math.max(3, Math.round(height / ZONE));
  frame.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const parts: SVGElement[] = [
    create('rect', {
      class: 'bp-frame-line bp-frame-line--outer',
      x: OUTER,
      y: OUTER,
      width: width - OUTER * 2,
      height: height - OUTER * 2,
    }),
    create('rect', {
      class: 'bp-frame-line bp-frame-line--inner',
      x: INNER,
      y: INNER,
      width: width - INNER * 2,
      height: height - INNER * 2,
    }),
  ];

  // Zone dividers and letters across the top and bottom, numbers down both sides.
  let dividers = '';
  const zoneLabel = (x: number, y: number, label: string) => {
    const text = create('text', {
      class: 'bp-zone',
      x: round(x),
      y: round(y),
      'text-anchor': 'middle',
    });
    text.textContent = label;
    parts.push(text);
  };
  for (let i = 1; i < columns; i++) {
    const x = round(OUTER + ((width - OUTER * 2) * i) / columns);
    dividers += `M${x} ${OUTER}V${INNER}M${x} ${height - OUTER}V${height - INNER}`;
  }
  for (let i = 1; i < rows; i++) {
    const y = round(OUTER + ((height - OUTER * 2) * i) / rows);
    dividers += `M${OUTER} ${y}H${INNER}M${width - OUTER} ${y}H${width - INNER}`;
  }
  parts.push(create('path', { class: 'bp-frame-line', d: dividers }));
  for (let i = 0; i < columns; i++) {
    const x = OUTER + ((width - OUTER * 2) * (i + 0.5)) / columns;
    const letter = String.fromCharCode(65 + i);
    zoneLabel(x, OUTER + 11.5, letter);
    zoneLabel(x, height - OUTER - 5, letter);
  }
  for (let i = 0; i < rows; i++) {
    const y = OUTER + ((height - OUTER * 2) * (i + 0.5)) / rows + 3;
    zoneLabel(OUTER + 8, y, String(i + 1));
    zoneLabel(width - OUTER - 8, y, String(i + 1));
  }
  parts.push(...headerMarks(width, height));
  frame.replaceChildren(...parts);
}

/** The header stays at the top of the screen, so its bracket and label belong to the fixed sheet. */
function headerMarks(width: number, height: number): SVGElement[] {
  const header = document.querySelector('[data-bp="Header.astro"]');
  if (!header) return [];
  const drawing = new Drawing(width, height);
  const box = {
    x: 0,
    y: 0,
    w: header.getBoundingClientRect().width,
    h: header.getBoundingClientRect().height,
  };
  brackets(drawing, box);
  tag(drawing, box, 'Header.astro');
  return [...drawing.svg.children] as SVGElement[];
}

/** The border of the sheet and its title block, fixed to the screen. */
export function mountSheet(signal: AbortSignal) {
  const frame = create('svg', {
    class: 'bp-frame',
    'data-blueprint-ui': '',
    'aria-hidden': 'true',
    focusable: 'false',
  });
  const title = titleBlock();
  // A fixed strip of the sheet's color at the bottom edge. Safari on iPhone paints its bars from
  // such an element, so the bar stays one color whatever scrolls or opens above it.
  const strip = document.createElement('div');
  strip.className = 'bp-edge';
  strip.setAttribute('data-blueprint-ui', '');
  strip.setAttribute('aria-hidden', 'true');
  document.body.append(strip, frame, title);

  const draw = () => drawFrame(frame);
  const compact = () => {
    title.toggleAttribute('data-compact', scrollY > COMPACT_AFTER);
    const left =
      document.documentElement.scrollHeight - (scrollY + innerHeight);
    title.toggleAttribute('data-away', left < CLEAR_BEFORE_END);
  };
  draw();
  compact();
  addEventListener('resize', draw, { signal });
  addEventListener('scroll', compact, { passive: true, signal });

  signal.addEventListener(
    'abort',
    () => {
      strip.remove();
      frame.remove();
      title.remove();
    },
    { once: true },
  );
}
