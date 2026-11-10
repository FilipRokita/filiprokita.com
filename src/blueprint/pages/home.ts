import { detailBubble } from '../bubble';
import type { PageContext } from '../context';
import {
  crosshair,
  dimensionAcross,
  dimensionDown,
  ruler,
  sectionMark,
} from '../dimensions';
import { cloud, note } from '../hand';
import { bottom, boxOf, labelBox, right } from '../measure';
import { table } from '../table';
import { find, findAll, isShown } from './query';

const NOTES = [
  'GENERAL NOTES',
  '1. ALL DIMENSIONS IN PX.',
  '2. EVERY COLOR IS A TOKEN.',
  '3. NO FRAMEWORK RUNTIME.',
  '4. AXE: 0 VIOLATIONS IN CI.',
  '5. NO SHADERS WERE HARMED.',
];

const kilobytes = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

/** Dimensions, registration marks and the general notes of the hero. */
function paintHero({ drawing, width }: PageContext) {
  const hero = find('.hero');
  const line = find('.hero h1 .line') ?? find('.hero h1');
  if (!hero || !line) return;
  const heroBox = boxOf(hero);
  const name = boxOf(line);

  dimensionAcross(drawing, {
    x1: name.x,
    x2: right(name),
    y: name.y - 26,
    label: `${Math.round(name.w)} px`,
    extendTo: name.y + 6,
  });
  dimensionDown(drawing, {
    x: name.x - 22,
    y1: name.y,
    y2: bottom(name),
    label: `${Math.round(name.h)}`,
    extendTo: name.x + 4,
  });

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

  const overview = findAll('.hero p.mono').find((p) =>
    /overview/i.test(p.textContent ?? ''),
  );
  if (overview) {
    const at = boxOf(overview);
    NOTES.forEach((text, index) => {
      drawing.text(
        at.x,
        at.y + 56 + index * 17,
        text,
        index === 0 ? 'notes-title' : 'notes',
      );
    });
  }
}

/** The height of every section, down the left edge. */
function paintSections({ drawing }: PageContext) {
  for (const section of findAll('main section[id]')) {
    const box = boxOf(section);
    dimensionDown(drawing, {
      x: 22,
      y1: box.y + 14,
      y2: bottom(box) - 14,
      label: `${Math.round(box.h)}`,
      extendTo: 40,
    });
  }
}

/** Handwritten remarks in the hero, each about something that is really there. */
function remarkOnHero({ drawing, wide, gutter, width }: PageContext) {
  const hero = find('.hero');
  const h1 = find('.hero h1');
  const line = find('.hero h1 .line') ?? h1;
  if (!hero || !h1 || !line || !wide) return;
  const name = boxOf(line);
  const style = getComputedStyle(h1);
  const size = parseFloat(style.fontSize);
  const tracking = parseFloat(style.letterSpacing) / size;

  note(
    drawing,
    { x: name.x + name.w * 0.62, y: name.y - 62 },
    [
      `Geist, ${Math.round(size)}px, weight ${style.fontWeight},`,
      `${tracking.toFixed(3)}em. yes, on purpose.`,
    ],
    { x: name.x + name.w * 0.7, y: name.y + 8 },
    { bend: -26, rotate: -3 },
  );

  const link = find('.hero a.link[href*="linkedin"]');
  if (link) {
    const box = boxOf(link);
    const ring = cloud(drawing, box, 7);
    note(
      drawing,
      { x: box.x - 96, y: bottom(box) + 44 },
      ['REV D: the arrow got', 'a sharp tip. very important.'],
      { x: ring.x + ring.w / 2, y: bottom(ring) + 2 },
      { bend: 16, rotate: 2, small: true },
    );
    const icon = link.querySelector<SVGSVGElement>('svg');
    if (icon) {
      detailBubble(drawing, {
        icon,
        center: { x: Math.round(width * 0.69), y: bottom(boxOf(hero)) - 130 },
        radius: 50,
        label: 'DETAIL B · SCALE 5 : 1',
        remark: ['square tip -> sharp tip.', 'you can stop squinting now.'],
      });
    }
  }

  const clock = find('[data-clock]');
  if (clock) {
    const box = boxOf(clock);
    const ring = cloud(drawing, box, 6);
    note(
      drawing,
      { x: right(box) + 30, y: bottom(box) + 34 },
      ['REV E: ticks on the minute now,', 'it used to be late. awkward.'],
      { x: ring.x + ring.w * 0.6, y: bottom(ring) + 2 },
      { bend: -14, rotate: -2, small: true },
    );
  }

  const toggle = find('.hero [data-theme-toggle]');
  if (toggle && isShown(toggle)) {
    const box = boxOf(toggle);
    note(
      drawing,
      { x: box.x - 170, y: box.y + 52 },
      ['light/dark = a circle reveal.', 'totally necessary. worth it.'],
      { x: box.x + box.w / 2, y: bottom(box) + 4 },
      { bend: 18, rotate: 2, small: true },
    );
  }

  const columns = findAll('.hero .guide:not(.lit)').filter(isShown);
  const overview = findAll('.hero p.mono').find((p) =>
    /overview/i.test(p.textContent ?? ''),
  );
  if (columns.length > 2 && overview) {
    const first = boxOf(columns[0]);
    const second = boxOf(columns[1]);
    const y = boxOf(overview).y - 34;
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
}

/** One remark each for the sections below the hero. */
function remarkOnSections({ drawing, wide }: PageContext) {
  if (!wide) return;
  const about = find('#about');
  if (about) {
    const label = labelBox(about);
    note(
      drawing,
      { x: label.x, y: label.y + 70 },
      ['this label follows you down', 'the page. sticky. a bit clingy.'],
      { x: label.x + 50, y: bottom(label) + 3 },
      { bend: -14, small: true },
    );
  }
  const first = find('#what li');
  if (first) {
    const box = boxOf(first);
    note(
      drawing,
      { x: box.x + 40, y: box.y - 44 },
      [
        '3 columns -> 2 on tablet -> 1 on phone.',
        'shrinks gracefully, unlike my first CSS',
      ],
      { x: box.x + 60, y: box.y + 4 },
      { bend: 20, small: true },
    );
  }
  const row = find('.project-row');
  if (row) {
    const box = boxOf(row);
    note(
      drawing,
      { x: box.x + box.w * 0.12, y: bottom(box) - 70 },
      ['the whole row is ONE link.', 'click anywhere, all is forgiven'],
      { x: box.x + box.w * 0.2, y: box.y + 52 },
      { bend: -20, rotate: 2, small: true },
    );
    const figure = find('figure', row);
    if (figure) {
      const shot = boxOf(figure);
      note(
        drawing,
        { x: right(shot) - 250, y: shot.y - 26 },
        ['crop 16 : 8.4. the screenshot', 'is not hiding anything. promise.'],
        { x: right(shot) - 150, y: shot.y + 6 },
        { bend: 18, small: true },
      );
    }
  }
  const mail = find('#contact a[href^="mailto:"]');
  if (mail) {
    const box = boxOf(mail);
    note(
      drawing,
      { x: box.x + box.w * 0.62, y: bottom(box) + 62 },
      [
        'no form, no database:',
        'nothing to store, nothing to leak,',
        'nothing to break at 3 am',
      ],
      { x: box.x + box.w * 0.7, y: bottom(box) + 2 },
      { bend: -16 },
    );
  }
  const commit = find('footer a[href*="/commit/"]');
  if (commit) {
    const box = boxOf(commit);
    note(
      drawing,
      { x: right(box) + 40, y: box.y + 30 },
      ['<- this link = the exact commit', 'that built this page. receipts.'],
      null,
      { small: true },
    );
  }
}

/** The bill of materials and the palette, in the empty column beside their sections. */
function paintFacts({ drawing, wide, colors, bom }: PageContext) {
  if (!wide) return;
  const how = find('#how');
  if (how && bom) {
    const label = labelBox(how);
    const rows: [string, string, string][] = [
      ['ITEM', 'QTY', 'SIZE'],
      ['HTML', String(bom.html.n), kilobytes(bom.html.bytes)],
      ['CSS', String(bom.css.n), kilobytes(bom.css.bytes)],
      ['JS FILES', String(bom.js.n), kilobytes(bom.js.bytes)],
      ['FONT FILES', String(bom.fonts.n), kilobytes(bom.fonts.bytes)],
      ['IMAGES', String(bom.images.n), kilobytes(bom.images.bytes)],
      [
        'TOTAL',
        '',
        kilobytes(
          Object.values(bom).reduce((sum, group) => sum + group.bytes, 0),
        ),
      ],
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
  const contact = find('#contact');
  if (contact) {
    const label = labelBox(contact);
    drawing.text(
      label.x,
      bottom(label) + 36,
      'PALETTE (TOKENS)',
      'notes-title',
    );
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
}

export function paintHome(context: PageContext) {
  paintHero(context);
  if (context.wide) paintSections(context);
  remarkOnHero(context);
  remarkOnSections(context);
  paintFacts(context);
}
