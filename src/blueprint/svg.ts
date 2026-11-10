/** Small helpers to build SVG with the DOM. Nothing here parses a string into markup. */
const NAMESPACE = 'http://www.w3.org/2000/svg';

export type Attributes = Record<string, string | number>;

export function create<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributes: Attributes = {},
  ...children: Node[]
): SVGElementTagNameMap[K] {
  const element = document.createElementNS(NAMESPACE, tag);
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, String(value));
  }
  element.append(...children);
  return element;
}

/** Rounds to one decimal, which is plenty for a drawing and keeps the paths short. */
export const round = (value: number) => Math.round(value * 10) / 10;
