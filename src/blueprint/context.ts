import type { Bom } from './bom';
import type { Drawing } from './drawing';
import type { SiteColors } from './tokens';

/** Below this width the drawing is the short version: no sizes, no long dimension lines. */
export const WIDE = 900;

/** Everything a page needs to paint its part of the drawing. */
export interface PageContext {
  drawing: Drawing;
  /** The width of the page. The notes need room, so a narrow page gets the short version. */
  width: number;
  wide: boolean;
  colors: SiteColors;
  gutter: number;
  bom: Bom | null;
}
