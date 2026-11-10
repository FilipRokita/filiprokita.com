import type { PageContext } from '../context';
import type { NoteOptions, Point } from '../hand';
import { cloud, note } from '../hand';
import type { Box } from '../measure';
import { bottom, boxOf } from '../measure';
import { isShown } from './query';

/** On a narrow page a remark is a short caption under the thing, with no arrow. */
const CAPTION_GAP = 22;
const SIDE = 20;

/** A handwritten remark about one thing on the page. Pages are lists of these. */
export interface Remark {
  /** The element the remark is about. Nothing is drawn when the page has no such element. */
  about: () => Element | null;
  lines: string[] | ((element: Element) => string[]);
  /** The box to measure from, when it is not the box of the element (the text of a title, a sticky label). */
  box?: (element: Element) => Box;
  /** Where the text starts. `ring` is the revision cloud around the thing, or its box when there is none. */
  at: (box: Box, ring: Box, element: Element) => Point;
  /** What the arrow points at. No arrow when absent. */
  to?: (box: Box, ring: Box, element: Element) => Point;
  /** Draws a revision cloud with this much room around the thing, for a change that was made on purpose. */
  cloud?: number;
  options?: NoteOptions;
  /** Kept on a narrow page, as a caption. */
  caption?: boolean;
}

export function paintRemarks(
  { drawing, wide }: PageContext,
  remarks: Remark[],
) {
  for (const remark of remarks) {
    if (!wide && !remark.caption) continue;
    const element = remark.about();
    if (!element || !isShown(element)) continue;
    const box = remark.box?.(element) ?? boxOf(element);
    const lines =
      typeof remark.lines === 'function' ? remark.lines(element) : remark.lines;

    if (!wide) {
      note(
        drawing,
        { x: Math.max(SIDE, box.x), y: bottom(box) + CAPTION_GAP },
        lines,
        null,
        { small: true, rotate: -1 },
      );
      continue;
    }
    const ring = remark.cloud ? cloud(drawing, box, remark.cloud) : box;
    note(
      drawing,
      remark.at(box, ring, element),
      lines,
      remark.to?.(box, ring, element) ?? null,
      remark.options,
    );
  }
}
