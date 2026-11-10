import { loadBom } from './bom';
import { WIDE } from './context';
import { Drawing } from './drawing';
import { loadHandwriting } from './handwriting';
import { pageSize } from './measure';
import { paintPage } from './page';
import { gutterWidth, siteColors } from './tokens';

const REBUILD_DELAY = 150;

/**
 * The drawing of the page: one SVG as big as the page, behind the header and above the
 * content. It is built again whenever the page changes size or colors, because every mark is
 * measured from the real elements.
 */
export function mountLayer(signal: AbortSignal) {
  const layer = document.createElement('div');
  layer.className = 'bp-layer';
  layer.setAttribute('data-blueprint-ui', '');
  document.body.append(layer);

  let latest = 0;
  const build = async () => {
    const run = ++latest;
    const [bom] = await Promise.all([loadBom(), loadHandwriting()]);
    // A newer build, or turning the mode off, makes this one pointless.
    if (run !== latest || signal.aborted) return;

    // The old drawing counts towards the height of the page. Take it away before measuring.
    layer.replaceChildren();
    layer.style.height = '0px';
    const { width, height } = pageSize();
    layer.style.height = `${height}px`;
    const drawing = new Drawing(width, height);
    // The drawing goes into the page first, because the notes are measured with the real font.
    layer.replaceChildren(drawing.svg);
    paintPage({
      drawing,
      width,
      wide: width >= WIDE,
      colors: siteColors(),
      gutter: gutterWidth(),
      bom,
    });
  };

  let timer: ReturnType<typeof setTimeout> | undefined;
  const rebuild = () => {
    if (signal.aborted) return;
    clearTimeout(timer);
    timer = setTimeout(() => void build(), REBUILD_DELAY);
  };

  void build();
  // Watching the page, not the window: on a phone the address bar growing and shrinking resizes
  // the window all the time, and the drawing must not be drawn again each time. Turning the phone
  // changes the width of the page, so that is still seen.
  let first = true;
  const sizes = new ResizeObserver(() => {
    if (first) first = false;
    else rebuild();
  });
  sizes.observe(document.body);
  // The palette shows the colors of the theme, so a change of theme redraws it.
  const themes = new MutationObserver(rebuild);
  themes.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  matchMedia('(prefers-color-scheme: light)').addEventListener(
    'change',
    rebuild,
    { signal },
  );

  signal.addEventListener(
    'abort',
    () => {
      clearTimeout(timer);
      sizes.disconnect();
      themes.disconnect();
      layer.remove();
    },
    { once: true },
  );
}
