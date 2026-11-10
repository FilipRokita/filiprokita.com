import type { Box } from '../measure';
import { boxOf } from '../measure';

export const find = <T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document,
) => root.querySelector<T>(selector);

export const findAll = <T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document,
) => [...root.querySelectorAll<T>(selector)];

/** The box of the first element that matches, or null when the page has no such element. */
export const boxFor = (
  selector: string,
  root: ParentNode = document,
): Box | null => {
  const element = find(selector, root);
  return element ? boxOf(element) : null;
};

/** The element is on the page and takes up room. */
export const isShown = (element: Element) =>
  element.getBoundingClientRect().width > 0;
