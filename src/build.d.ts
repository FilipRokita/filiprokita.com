/**
 * Defined at build time in astro.config.mjs. `commit` is empty without git history.
 * `onMain` is true only for a build of the main branch.
 */
declare const __BUILD__: { date: string; commit: string; onMain: boolean };

interface Window {
  /** Set by the inline theme script: makes the browser bar color follow the theme. */
  applyThemeColor?: (theme: 'light' | 'dark') => void;
}
