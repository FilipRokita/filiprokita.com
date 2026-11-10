import type { PageContext } from '../context';
import { note } from '../hand';
import { bottom, labelBox } from '../measure';
import { table } from '../table';

const kilobytes = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

/** The bill of materials: what this page points at, measured after the build. Wide pages only. */
export function paintBom(
  { drawing, wide, bom }: PageContext,
  section: Element | null,
) {
  if (!wide || !bom || !section) return;
  const label = labelBox(section);
  const total = Object.values(bom).reduce((sum, group) => sum + group.bytes, 0);
  const rows: [string, string, string][] = [
    ['ITEM', 'QTY', 'SIZE'],
    ['HTML', String(bom.html.n), kilobytes(bom.html.bytes)],
    ['CSS', String(bom.css.n), kilobytes(bom.css.bytes)],
    ['JS FILES', String(bom.js.n), kilobytes(bom.js.bytes)],
    ['FONT FILES', String(bom.fonts.n), kilobytes(bom.fonts.bytes)],
    ['IMAGES', String(bom.images.n), kilobytes(bom.images.bytes)],
    ['TOTAL', '', kilobytes(total)],
  ];
  const at = { x: label.x, y: bottom(label) + 150 };
  drawing.text(at.x, at.y - 12, 'BILL OF MATERIALS', 'notes-title');
  const box = table(drawing, {
    ...at,
    columns: [150, 64, 116],
    rows,
    strong: [0, rows.length - 1],
  });
  drawing.text(
    at.x,
    bottom(box) + 14,
    'WHAT THIS PAGE POINTS AT. TEXT GZIPPED.',
    'size',
  );
  drawing.text(at.x, bottom(box) + 27, 'FONTS LOAD ONLY WHEN USED.', 'size');

  // The remark is about the real count, whatever it is today.
  const scripts = bom.js.n === 1 ? 'one JS file' : `${bom.js.n} JS files`;
  note(
    drawing,
    { x: at.x + 70, y: bottom(box) + 62 },
    [`${scripts}, ${kilobytes(bom.js.bytes)}.`, 'yes, that is all.'],
    { x: at.x + 200, y: at.y + 21 * 3 + 14 },
    { bend: -26, rotate: 2, small: true },
  );
}

/** The colors of the site, with the names of the tokens that hold them. Wide pages only. */
export function paintPalette(
  { drawing, wide, colors }: PageContext,
  section: Element | null,
) {
  if (!wide || !section) return;
  const label = labelBox(section);
  drawing.text(label.x, bottom(label) + 36, 'PALETTE (TOKENS)', 'notes-title');
  const swatches: [string, string][] = [
    ['--bg', colors.bg],
    ['--fg', colors.fg],
    ['--muted', colors.muted],
    ['--accent', colors.accent],
  ];
  swatches.forEach(([name, color], index) => {
    const x = label.x + (index % 2) * 150;
    const y = bottom(label) + 50 + Math.floor(index / 2) * 44;
    drawing.advance(0.06);
    drawing.swatch(x, y, 28, color);
    drawing.text(x + 38, y + 12, name, 'size');
    drawing.text(x + 38, y + 25, color, 'size');
  });
}
