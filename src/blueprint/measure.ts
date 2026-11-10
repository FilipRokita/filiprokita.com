/** A rectangle in page coordinates: the same numbers whatever the scroll position. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const right = (box: Box) => box.x + box.w;
export const bottom = (box: Box) => box.y + box.h;

export function boxOf(element: Element): Box {
  const rect = element.getBoundingClientRect();
  // A sticky header sits at the top of the page in the drawing, wherever it is stuck right now.
  const sticky = getComputedStyle(element).position === 'sticky';
  return {
    x: rect.left + scrollX,
    y: sticky ? 0 : rect.top + scrollY,
    w: rect.width,
    h: rect.height,
  };
}

/** The size of the whole page, which is what the drawing covers. */
export function pageSize() {
  const root = document.documentElement;
  return {
    width: root.clientWidth,
    height: Math.max(root.scrollHeight, innerHeight),
  };
}

/** Whether two boxes overlap, with some room to spare around them. */
export function overlaps(a: Box, b: Box, margin = 0): boolean {
  return (
    a.x < right(b) + margin &&
    right(a) + margin > b.x &&
    a.y < bottom(b) + margin &&
    bottom(a) + margin > b.y
  );
}

/**
 * The places on the sheet that already hold something. A new note claims its place here and is
 * moved down until it does not sit on one of them.
 */
export class Reservations {
  private readonly boxes: Box[] = [];

  claim(wanted: Box, step = 20, margin = 10): Box {
    let box = wanted;
    for (let tries = 0; tries < 12; tries++) {
      if (!this.boxes.some((taken) => overlaps(taken, box, margin))) break;
      box = { ...box, y: box.y + step };
    }
    this.boxes.push(box);
    return box;
  }
}

/**
 * Where a section's label is, worked out from the section itself: the label is sticky, so where
 * it is right now depends on the scroll position, and the drawing must not.
 */
export function labelBox(section: Element): Box {
  const label = section.querySelector('p.mono');
  const labelBox = label ? boxOf(label) : { x: 0, y: 0, w: 0, h: 0 };
  const top =
    boxOf(section).y + parseFloat(getComputedStyle(section).paddingTop);
  return {
    x: labelBox.x,
    y: top,
    w: label ? textBox(label).w : 0,
    h: labelBox.h,
  };
}

/** The box around the text of an element, which is narrower than the element when it is a full-width block. */
export function textBox(element: Element): Box {
  const range = document.createRange();
  range.selectNodeContents(element);
  const rect = range.getBoundingClientRect();
  return {
    x: rect.left + scrollX,
    y: rect.top + scrollY,
    w: rect.width,
    h: rect.height,
  };
}
