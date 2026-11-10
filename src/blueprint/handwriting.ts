let loading: Promise<boolean> | undefined;

/**
 * Fetches the handwriting font, which is declared on every page but only downloaded when asked for,
 * and says whether it is there. Only the first family of the list is asked for: the rest are
 * fallbacks that a browser may not have, and asking for one of those fails the whole request.
 */
export function loadHandwriting(): Promise<boolean> {
  loading ??= (async () => {
    const list = getComputedStyle(document.documentElement).getPropertyValue(
      '--font-hand',
    );
    const family = list.split(',')[0]?.trim();
    if (!family) return false;
    try {
      const faces = await document.fonts.load(`700 23px ${family}`, 'Aa');
      return faces.length > 0;
    } catch {
      return false;
    }
  })();
  return loading;
}
