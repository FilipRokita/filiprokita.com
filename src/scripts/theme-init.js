// Applies a saved theme before the first paint, so there is no flash of the wrong one.
// Runs inline in the head. Its hash is allowed by the Content Security Policy
// (see astro.config.mjs), so change it only together with a rebuild.
try {
  const theme = localStorage.getItem('theme');
  if (theme === 'light' || theme === 'dark')
    document.documentElement.dataset.theme = theme;
} catch {
  // Storage can be blocked. The system theme applies.
}
