import { Drawing } from './drawing';
import { pageSize } from './measure';
import { paintPage, WIDE } from './page';

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

  const build = () => {
    if (signal.aborted) return;
    const { width, height } = pageSize();
    layer.style.height = `${height}px`;
    const drawing = new Drawing(width, height);
    paintPage(drawing, width >= WIDE);
    layer.replaceChildren(drawing.svg);
  };

  let timer: ReturnType<typeof setTimeout> | undefined;
  const rebuild = () => {
    clearTimeout(timer);
    timer = setTimeout(build, REBUILD_DELAY);
  };

  build();
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
