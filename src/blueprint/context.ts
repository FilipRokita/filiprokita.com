import type { Bom } from './bom';
import type { Drawing } from './drawing';
import type { SiteColors } from './tokens';

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
