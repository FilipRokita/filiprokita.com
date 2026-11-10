/**
 * Every component marks its root element with `data-bp="File.astro"`. These helpers read it.
 * The drawing labels the big blocks, and the inspector and the code drawer use the same names.
 */
export const BLOCKS = new Set([
  'Header.astro',
  'Hero.astro',
  'Section.astro',
  'ProjectRow.astro',
  'Figure.astro',
  'Footer.astro',
]);

/** What renders a part of the page that no component claims. */
export const FALLBACK = 'BaseLayout.astro';

/** The name of the file whose component renders this element. */
export function componentOf(element: Element): string {
  return element.closest('[data-bp]')?.getAttribute('data-bp') ?? FALLBACK;
}
