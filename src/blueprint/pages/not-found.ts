import type { PageContext } from '../context';
import { labelBox, right, textBox } from '../measure';
import { paintSectionHeights, paintTitleDimensions } from './common';
import { find } from './query';
import type { Remark } from './remarks';
import { paintRemarks } from './remarks';

/** Every remark on the page that is shown for an address that does not exist. */
const REMARKS: Remark[] = [
  {
    about: () => find('main h1'),
    box: textBox,
    lines: ['status 404, sent by Cloudflare.', 'crawlers get the truth too.'],
    at: (box) => ({ x: right(box) + 80, y: box.y + 60 }),
    to: (box) => ({ x: right(box) - 10, y: box.y + box.h * 0.5 }),
    options: { bend: 20, rotate: -3 },
    caption: true,
  },
  {
    about: () => find('#not-found'),
    box: (section) => {
      const label = labelBox(section);
      return { ...label, w: label.w + 20 };
    },
    lines: ['REV I: noindex. this page is', 'kept out of search results.'],
    cloud: 8,
    at: (_box, ring) => ({ x: right(ring) + 50, y: ring.y + 24 }),
    to: (_box, ring) => ({ x: right(ring) + 4, y: ring.y + ring.h / 2 }),
    options: { bend: 12, rotate: 2, small: true },
    caption: true,
  },
];

export function paintNotFound(context: PageContext) {
  paintTitleDimensions(context);
  paintSectionHeights(context);
  paintRemarks(context, REMARKS);
}
