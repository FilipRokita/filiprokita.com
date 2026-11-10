/**
 * Tints the browser bar (the `theme-color` of the page) with the blueprint blue while the mode is
 * on, and gives it back to the theme when the mode turns off. A change of theme in between sets
 * the bar to the theme's color, so the tint is put back after it.
 */
export function tintBrowserBar(signal: AbortSignal) {
  const root = document.documentElement;
  const theme = () => root.dataset.theme as 'light' | 'dark' | undefined;
  // The page keeps the colors it started with. Make sure they are saved before tinting.
  window.applyThemeColor?.(theme());

  const tint = () => {
    const blue = getComputedStyle(root).getPropertyValue('--bg').trim();
    for (const meta of document.querySelectorAll('meta[name="theme-color"]'))
      meta.setAttribute('content', blue);
  };
  tint();

  const themes = new MutationObserver(tint);
  themes.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  signal.addEventListener(
    'abort',
    () => {
      themes.disconnect();
      window.applyThemeColor?.(theme());
    },
    { once: true },
  );
}
