import { detailBubble } from '../bubble';
import type { PageContext } from '../context';
import { crosshair, dimensionName, ruler, sectionMark } from '../dimensions';
import { note } from '../hand';
import { bottom, boxOf, labelBox, right } from '../measure';
import { paintSectionHeights } from './common';
import { paintBom, paintPalette } from './facts';
import { find, findAll, isShown } from './query';
import type { Remark } from './remarks';
import { paintRemarks } from './remarks';

const NOTES = [
  'GENERAL NOTES',
  '1. ALL DIMENSIONS IN PX.',
  '2. EVERY COLOR IS A TOKEN.',
  '3. NO FRAMEWORK RUNTIME.',
  '4. AXE: 0 VIOLATIONS IN CI.',
  '5. NO SHADERS WERE HARMED.',
];

const heroName = () => find('.hero h1 .line') ?? find('.hero h1');
const overview = () =>
  findAll('.hero p.mono').find((p) => /overview/i.test(p.textContent ?? ''));

/** Every remark on the home page. Each one is about something that is really there. */
const REMARKS: Remark[] = [
  {
    about: heroName,
    lines: () => {
      const style = getComputedStyle(find('.hero h1') ?? document.body);
      const size = parseFloat(style.fontSize);
      return [
        `Geist, ${Math.round(size)}px, weight ${style.fontWeight},`,
        `${(parseFloat(style.letterSpacing) / size).toFixed(3)}em. yes, on purpose.`,
      ];
    },
    at: (box) => ({ x: box.x + box.w * 0.62, y: box.y - 62 }),
    to: (box) => ({ x: box.x + box.w * 0.7, y: box.y + 8 }),
    options: { bend: -26, rotate: -3 },
    caption: true,
  },
  {
    about: () => find('.hero a.link[href*="linkedin"]'),
    lines: ['REV D: the arrow got', 'a sharp tip. very important.'],
    cloud: 7,
    at: (box) => ({ x: box.x - 150, y: bottom(box) + 44 }),
    to: (_box, ring) => ({ x: ring.x + ring.w / 2, y: bottom(ring) + 2 }),
    options: { bend: 16, rotate: 2, small: true },
    caption: true,
  },
  {
    about: () => find('[data-clock]'),
    lines: ['REV E: ticks on the minute now,', 'it used to be late. awkward.'],
    cloud: 6,
    at: (box) => ({ x: right(box) + 30, y: bottom(box) + 34 }),
    to: (_box, ring) => ({ x: ring.x + ring.w * 0.6, y: bottom(ring) + 2 }),
    options: { bend: -14, rotate: -2, small: true },
  },
  {
    about: () => find('.hero [data-theme-toggle]'),
    lines: ['light/dark = a circle reveal.', 'totally necessary. worth it.'],
    at: (box) => ({ x: box.x - 170, y: box.y + 52 }),
    to: (box) => ({ x: box.x + box.w / 2, y: bottom(box) + 4 }),
    options: { bend: 18, rotate: 2, small: true },
  },
  {
    about: () => find('#about'),
    box: labelBox,
    lines: ['this label follows you down', 'the page. sticky. a bit clingy.'],
    at: (box) => ({ x: box.x, y: box.y + 70 }),
    to: (box) => ({ x: box.x + 50, y: bottom(box) + 3 }),
    options: { bend: -14, small: true },
  },
  {
    about: () => find('#what li'),
    lines: [
      '3 columns -> 2 on tablet -> 1 on phone.',
      'shrinks gracefully, unlike my first CSS',
    ],
    at: (box) => ({ x: box.x + 40, y: box.y - 44 }),
    to: (box) => ({ x: box.x + 60, y: box.y + 4 }),
    options: { bend: 20, small: true },
  },
  {
    about: () => find('.project-row'),
    lines: ['the whole row is ONE link.', 'click anywhere, all is forgiven'],
    at: (box) => ({ x: box.x + box.w * 0.12, y: bottom(box) - 70 }),
    to: (box) => ({ x: box.x + box.w * 0.2, y: box.y + 52 }),
    options: { bend: -20, rotate: 2, small: true },
  },
  {
    about: () => find('.project-row figure'),
    lines: [
      'crop 16 : 8.4. the screenshot',
      'is not hiding anything. promise.',
    ],
    at: (box) => ({ x: right(box) - 250, y: box.y - 26 }),
    to: (box) => ({ x: right(box) - 150, y: box.y + 6 }),
    options: { bend: 18, small: true },
  },
  {
    about: () => find('#contact a[href^="mailto:"]'),
    lines: [
      'no form, no database:',
      'nothing to store, nothing to leak,',
      'nothing to break at 3 am',
    ],
    at: (box) => ({ x: box.x + box.w * 0.62, y: bottom(box) + 62 }),
    to: (box) => ({ x: box.x + box.w * 0.7, y: bottom(box) + 2 }),
    options: { bend: -16 },
  },
  {
    about: () => find('footer a[href*="/commit/"]'),
    lines: [
      '<- this link = the exact commit',
      'that built this page. receipts.',
    ],
    at: (box) => ({ x: right(box) + 40, y: box.y + 30 }),
    options: { small: true },
  },
];

/** Dimensions, registration marks, a section line and the general notes of the hero. */
function paintHero({ drawing, width, wide, gutter }: PageContext) {
  const hero = find('.hero');
  const line = heroName();
  if (!hero || !line || !wide) return;
  const heroBox = boxOf(hero);
  const name = boxOf(line);

  dimensionName(drawing, name);
  crosshair(drawing, right(heroBox) - 3, heroBox.y + 3);
  crosshair(drawing, heroBox.x + 3, bottom(heroBox) - 3);
  crosshair(drawing, right(heroBox) - 3, bottom(heroBox) - 3);

  // A section line through the hero, cut at both ends by a lettered mark.
  const cut = bottom(name) + 30;
  drawing.line(`M14 ${cut}H${width - 14}`, 'dashdot');
  sectionMark(drawing, 40, cut, 'A');
  sectionMark(drawing, width - 40, cut, 'A');

  const content = find('.hero > .relative');
  if (content) ruler(drawing, boxOf(content).x + 4, bottom(heroBox) - 36);

  const label = overview();
  if (!label) return;
  const at = boxOf(label);
  NOTES.forEach((text, index) => {
    drawing.text(
      at.x,
      at.y + 56 + index * 17,
      text,
      index === 0 ? 'notes-title' : 'notes',
    );
  });

  // The gutter between two column lines, measured.
  const columns = findAll('.hero .guide:not(.lit)').filter(isShown);
  if (columns.length < 2) return;
  const first = boxOf(columns[0]);
  const second = boxOf(columns[1]);
  const y = at.y - 34;
  drawing.advance(0.04);
  drawing.line(`M${right(first)} ${y}H${second.x}`);
  drawing.text(
    (right(first) + second.x) / 2,
    y - 6,
    String(gutter),
    'dimension',
    { anchor: 'middle' },
  );
  note(
    drawing,
    { x: second.x + 14, y: y - 4 },
    ['12 columns, gutter', `${gutter}px (fluid). i counted.`],
    null,
    { small: true },
  );
}

/** The detail view of the arrow, in the free space at the bottom of the hero. */
function paintDetail({ drawing, width, wide }: PageContext) {
  const hero = find('.hero');
  const icon = find<SVGSVGElement>('.hero a.link[href*="linkedin"] svg');
  if (!wide || !hero || !icon) return;
  detailBubble(drawing, {
    icon,
    center: { x: Math.round(width * 0.69), y: bottom(boxOf(hero)) - 130 },
    radius: 50,
    label: 'DETAIL B · SCALE 5 : 1',
    remark: ['square tip -> sharp tip.', 'you can stop squinting now.'],
  });
}

export function paintHome(context: PageContext) {
  paintHero(context);
  paintSectionHeights(context);
  paintRemarks(context, REMARKS);
  paintDetail(context);
  paintBom(context, find('#how'));
  paintPalette(context, find('#contact'));
}
