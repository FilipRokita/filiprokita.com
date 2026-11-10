import { html } from './dom';
import { componentOf, shortName } from './labels';

const OFFSET = 20;
const MARGIN = 30;
const TOKENS = ['--fg', '--muted', '--accent', '--bg'] as const;

/** Maps a computed color back to the token that produced it, so the readout can name it. */
function tokenNames(): Map<string, string> {
  const probe = html('i', '');
  document.body.append(probe);
  const names = new Map<string, string>();
  for (const token of TOKENS) {
    probe.style.color = `var(${token})`;
    names.set(getComputedStyle(probe).color, token);
  }
  probe.remove();
  return names;
}

/**
 * A crosshair that follows the mouse, with a readout of the real element under it: its owner,
 * size, font and color token. Mouse only: a finger has no hover, and a tap opens the code instead.
 */
export function mountInspector(signal: AbortSignal) {
  const root = html('div', 'bp-inspector');
  root.setAttribute('data-blueprint-ui', '');
  root.setAttribute('aria-hidden', 'true');
  const across = html('i', 'bp-inspector-line bp-inspector-line--across');
  const down = html('i', 'bp-inspector-line bp-inspector-line--down');
  const dot = html('i', 'bp-inspector-dot');
  const outline = html('i', 'bp-inspector-outline');
  const readout = html('div', 'bp-inspector-readout');
  root.append(across, down, dot, outline, readout);
  document.body.append(root);

  let names: Map<string, string> | undefined;
  let pointer: { x: number; y: number } | null = null;
  let frame = 0;

  const hide = () => root.removeAttribute('data-on');

  const update = () => {
    frame = 0;
    if (!pointer || document.querySelector('.bp-drawer[open]')) return hide();
    const { x, y } = pointer;
    const element = document.elementFromPoint(x, y);
    if (!element || element === document.documentElement) return hide();
    names ??= tokenNames();

    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const hasText = [...element.childNodes].some(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
    );
    const lines = [
      html('b', '', `X ${Math.round(x)}  Y ${Math.round(y + scrollY)}`),
      `${componentOf(element)} › ${shortName(element)}`,
      `${Math.round(box.width)} × ${Math.round(box.height)} px`,
    ];
    if (hasText) {
      const family = style.fontFamily
        .split(',')[0]
        .replace(/["']/g, '')
        .replace(/-[0-9a-f]{8,}$/i, '');
      lines.push(
        `${family} ${Math.round(parseFloat(style.fontSize))}px / ${style.fontWeight}`,
        `color ${names.get(style.color) ?? style.color}`,
      );
    }
    readout.replaceChildren(
      ...lines.flatMap((line, index) =>
        index ? [document.createElement('br'), line] : [line],
      ),
    );

    across.style.transform = `translateY(${y}px)`;
    down.style.transform = `translateX(${x}px)`;
    dot.style.transform = `translate(${x - 5}px, ${y - 5}px)`;
    Object.assign(outline.style, {
      left: `${box.left}px`,
      top: `${box.top}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
    });
    const width = readout.offsetWidth;
    const height = readout.offsetHeight;
    readout.style.left = `${x + OFFSET + width > innerWidth - MARGIN ? x - OFFSET - width : x + OFFSET}px`;
    readout.style.top = `${y + OFFSET + height > innerHeight - MARGIN ? y - OFFSET - height : y + OFFSET}px`;
    root.setAttribute('data-on', '');
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return;
      pointer = { x: event.clientX, y: event.clientY };
      schedule();
    },
    { passive: true, signal },
  );
  addEventListener('scroll', () => pointer && schedule(), {
    passive: true,
    signal,
  });
  document.documentElement.addEventListener('mouseleave', hide, { signal });

  signal.addEventListener(
    'abort',
    () => {
      cancelAnimationFrame(frame);
      root.remove();
    },
    { once: true },
  );
}
