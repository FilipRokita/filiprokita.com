/**
 * Blueprint mode is always dark, whatever the visitor uses. On iPhone the strip at the top (by the
 * Dynamic Island) takes the page's color, and a dark one stands out less next to the blueprint
 * blue than a light one. Why Safari takes it this way is not documented by Apple. The theme attribute is set to dark for
 * the session only and nothing is saved, so when the mode ends (or the page is reloaded) the
 * visitor's own theme is back: the saved choice, or the system one when there is none.
 */
const root = document.documentElement;

type Theme = 'light' | 'dark';

const saved = (): Theme | null => {
  try {
    const theme = localStorage.getItem('theme');
    return theme === 'light' || theme === 'dark' ? theme : null;
  } catch {
    return null;
  }
};

/** The theme the visitor has, which is not always the one on the page while the mode is on. */
export const visitorTheme = (): Theme =>
  saved() ??
  (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

export function lockDark(signal: AbortSignal) {
  // Kept for when storage is blocked: then the theme on the page is all there is.
  const before = root.dataset.theme;
  root.dataset.theme = 'dark';
  signal.addEventListener(
    'abort',
    () => {
      const theme = saved() ?? before;
      if (theme) root.dataset.theme = theme;
      else delete root.dataset.theme;
    },
    { once: true },
  );
}
