// Applies a saved theme before the first paint, so there is no flash of the wrong one.
// Runs inline in the head. Its hash is allowed by the Content Security Policy
// (see astro.config.mjs), so change it only together with a rebuild.

// The browser bar color follows the chosen theme, not only the system one. Each
// theme-color meta keeps its own color in data-color, and a chosen theme copies that
// color to both metas.
window.applyThemeColor = (theme) => {
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  for (const meta of metas) meta.dataset.color ??= meta.content;
  const chosen = [...metas].find((meta) => meta.dataset.scheme === theme);
  for (const meta of metas)
    meta.content = chosen ? chosen.dataset.color : meta.dataset.color;
};

try {
  const theme = localStorage.getItem('theme');
  if (theme === 'light' || theme === 'dark') {
    document.documentElement.dataset.theme = theme;
    window.applyThemeColor(theme);
  }
} catch {
  // Storage can be blocked. The system theme applies.
}
