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
