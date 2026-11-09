/** Defined at build time in astro.config.mjs. `commit` is empty without git history. */
declare const __BUILD__: { date: string; commit: string };

interface Window {
  /** Set by the inline theme script: makes the browser bar color follow the theme. */
  applyThemeColor?: (theme: 'light' | 'dark') => void;
}
