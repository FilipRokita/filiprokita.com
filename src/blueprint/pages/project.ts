import type { PageContext } from '../context';
import { dimensionAcross } from '../dimensions';
import { bottom, boxOf, right, textBox } from '../measure';
import { paintSectionHeights } from './common';
import { paintBom, paintPalette } from './facts';
import { find } from './query';
import type { Remark } from './remarks';
import { paintRemarks } from './remarks';

const factCount = (facts: Element) => facts.getAttribute('data-count') ?? '';

/** Every remark on a project page. */
const REMARKS: Remark[] = [
  {
    about: () => find('main h1'),
    box: textBox,
    lines: (title) => [
      `Geist, ${Math.round(parseFloat(getComputedStyle(title).fontSize))}px.`,
      'REV F: it used to be much bigger.',
    ],
    at: (box) => ({ x: right(box) + 60, y: box.y + 40 }),
    to: (box) => ({ x: right(box) - 10, y: box.y + box.h * 0.4 }),
    options: { bend: 20, rotate: -3 },
    caption: true,
  },
  {
    about: () => find('[data-back]'),
    lines: ['a real "back": it returns to', 'where you were on the list.'],
    at: (box) => ({ x: right(box) + 60, y: box.y + 4 }),
    to: (box) => ({ x: right(box) + 4, y: box.y + box.h / 2 }),
    options: { bend: 14, small: true },
  },
  {
    about: () => find('.facts'),
    lines: (facts) => [
      `${factCount(facts)} facts here,`,
      `so ${factCount(facts)} columns.`,
    ],
    at: (box) => ({ x: box.x + box.w * 0.55, y: bottom(box) + 46 }),
    to: (box) => ({ x: box.x + box.w * 0.5 + 8, y: bottom(box) - 14 }),
    options: { bend: 14, small: true },
    caption: true,
  },
  {
    about: () => find('#screenshots'),
    box: (section) => {
      const label = find('p.mono', section);
      return label ? textBox(label) : boxOf(section);
    },
    lines: ['REV G: the screenshot got', 'its own section.'],
    cloud: 8,
    at: (_box, ring) => ({ x: ring.x, y: bottom(ring) + 50 }),
    to: (_box, ring) => ({ x: ring.x + ring.w / 2, y: bottom(ring) + 2 }),
    options: { bend: -12, rotate: 2, small: true },
  },
  {
    about: () => find('#decisions ol'),
    lines: (list) => [
      `${list.children.length} decisions. the schema`,
      'allows 3 to 5, checked at build.',
    ],
    at: (box) => ({ x: box.x + box.w * 0.45, y: box.y - 50 }),
    to: (box) => ({ x: box.x + box.w * 0.5, y: box.y + 6 }),
    options: { bend: 16, small: true },
  },
  {
    about: () => find('.next strong'),
    lines: ['REV H: smaller than the title.', 'a hierarchy. who knew.'],
    cloud: 10,
    at: (box) => ({ x: right(box) + 100, y: box.y + 10 }),
    to: (_box, ring) => ({ x: right(ring) + 4, y: ring.y + ring.h / 2 }),
    options: { bend: -14, rotate: 2, small: true },
    caption: true,
  },
];

export function paintProject(context: PageContext) {
  const { drawing, wide } = context;
  const title = find('main h1');
  if (title && wide) {
    const name = textBox(title);
    dimensionAcross(drawing, {
      x1: name.x,
      x2: right(name),
      y: name.y - 20,
      label: `${Math.round(name.w)} px`,
      extendTo: name.y + 6,
    });
  }
  paintSectionHeights(context);
  paintRemarks(context, REMARKS);
  paintBom(context, find('#decisions') ?? find('#what-it-is'));
  paintPalette(context, find('#screenshots'));
}
