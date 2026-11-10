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
 * content. It is built again whenever the page changes size, because every mark is measured
 * from the real elements.
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
    clearTimeout(timer);
    timer = setTimeout(() => void build(), REBUILD_DELAY);
  };

  void build();
  addEventListener('resize', rebuild, { signal });
  const observer = new ResizeObserver(rebuild);
  observer.observe(document.body);
  void document.fonts.ready.then(rebuild);

  signal.addEventListener(
    'abort',
    () => {
      clearTimeout(timer);
      observer.disconnect();
      layer.remove();
    },
    { once: true },
  );
}
