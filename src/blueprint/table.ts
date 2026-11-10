import type { Drawing } from './drawing';

export interface TableOptions {
  x: number;
  y: number;
  /** The width of each of the three columns. */
  columns: [number, number, number];
  rows: [string, string, string][];
  /** Rows to set in the heavier style: a header, a total. */
  strong?: number[];
  rowHeight?: number;
}

/** A ruled table with a name on the left, a count in the middle and a value on the right. */
export function table(
  drawing: Drawing,
  { x, y, columns, rows, strong = [], rowHeight = 21 }: TableOptions,
) {
  const width = columns[0] + columns[1] + columns[2];
  const height = rowHeight * rows.length;
  let d = `M${x} ${y}h${width}v${height}h${-width}z`;
  d += `M${x + columns[0]} ${y}v${height}M${x + columns[0] + columns[1]} ${y}v${height}`;
  for (let row = 1; row < rows.length; row++)
    d += `M${x} ${y + rowHeight * row}h${width}`;
  drawing.advance(0.08);
  drawing.line(d);
  rows.forEach(([name, count, value], row) => {
    const kind = strong.includes(row) ? 'notes-title' : 'notes';
    const baseline = y + rowHeight * row + 14;
    drawing.text(x + 8, baseline, name, kind);
    drawing.text(x + columns[0] + columns[1] / 2, baseline, count, kind, {
      anchor: 'middle',
    });
    drawing.text(x + width - 8, baseline, value, kind, { anchor: 'end' });
  });
  return { x, y, w: width, h: height };
}
