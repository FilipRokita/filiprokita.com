import type { Drawing } from './drawing';
import { BLOCKS } from './labels';
import { boxOf } from './measure';
import { brackets, sizeLabel, tag } from './marks';

/** Below this width the drawing is the short version: no sizes, no long dimension lines. */
export const WIDE = 900;

/** Draws everything that belongs on the sheet of the current page. */
export function paintPage(drawing: Drawing, wide: boolean) {
  for (const element of document.querySelectorAll('[data-bp]')) {
    const name = element.getAttribute('data-bp') ?? '';
    // The header belongs to the fixed sheet (see sheet.ts), not to the page.
    if (!BLOCKS.has(name) || name === 'Header.astro') continue;
    const box = boxOf(element);
    brackets(drawing, box);
    tag(drawing, box, name);
    if (wide) sizeLabel(drawing, box);
  }
}
