import type { PageContext } from './context';
import { BLOCKS } from './labels';
import { boxOf } from './measure';
import { brackets, sizeLabel, tag } from './marks';
import { paintHome } from './pages/home';
import { find } from './pages/query';

/** Below this width the drawing is the short version: no sizes, no long dimension lines. */
export const WIDE = 900;

type PageKind = 'home' | 'project' | 'not-found';

/** Which page this is, told by what is on it: only the home page has a hero. */
function kindOfPage(): PageKind {
  if (find('.hero')) return 'home';
  if (find('.facts')) return 'project';
  return 'not-found';
}

/** Draws everything that belongs on the sheet of the current page. */
export function paintPage(context: PageContext) {
  const { drawing, wide } = context;
  for (const element of document.querySelectorAll('[data-bp]')) {
    const name = element.getAttribute('data-bp') ?? '';
    // The header belongs to the fixed sheet (see sheet.ts), not to the page.
    if (!BLOCKS.has(name) || name === 'Header.astro') continue;
    const box = boxOf(element);
    brackets(drawing, box);
    tag(drawing, box, name);
    if (wide) sizeLabel(drawing, box);
  }
  if (kindOfPage() === 'home') paintHome(context);
}
