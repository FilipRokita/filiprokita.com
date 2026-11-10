import { loadHandwriting } from './handwriting';
import { memory } from './memory';

const FIRST_TEASE = 2500;
const TEASE_EVERY = 25_000;
const TEASE_FOR = 2000;
const HINT_AFTER = 5500;
const HINT_FOR = 7000;

/**
 * Makes the chip catch the eye, gently: its corners draw themselves now and then, and once or twice
 * a handwritten hint points at it. Both stop for good after the first use, and neither runs for
 * someone who asked for less motion. The hint stays for its full time, whatever the visitor does
 * on the page, and goes away when they go for the chip itself.
 */
export function createTeaser(chip: HTMLElement) {
  /** Everything the teaser listens to or waits for, so that `stop` can end it all at once. */
  let session: AbortController | undefined;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const later = (callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
  };

  const quiet = () =>
    document.hidden ||
    chip.getAttribute('aria-pressed') === 'true' ||
    chip.matches(':hover');

  const tease = () => {
    if (quiet()) return;
    chip.setAttribute('data-tease', '');
    later(() => chip.removeAttribute('data-tease'), TEASE_FOR);
  };

  const hideHint = () => chip.removeAttribute('data-hint');

  const showHint = async () => {
    if (quiet()) return;
    // The handwriting is fetched now, so the hint never appears in the wrong font first.
    if (!(await loadHandwriting())) return;
    if (quiet() || session?.signal.aborted) return;
    chip.setAttribute('data-hint', '');
    later(hideHint, HINT_FOR);
  };

  const start = () => {
    if (
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      memory.read('used')
    )
      return;
    session = new AbortController();
    const { signal } = session;
    later(tease, FIRST_TEASE);
    later(() => void showHint(), HINT_AFTER);
    const every = setInterval(tease, TEASE_EVERY);
    signal.addEventListener('abort', () => clearInterval(every), {
      once: true,
    });
    chip.addEventListener('pointerenter', hideHint, { signal });
    chip.addEventListener('focus', hideHint, { signal });
  };

  /** Used for the first time: the teaser has done its job, for good. */
  const stop = () => {
    memory.write('used', '1');
    session?.abort();
    timers.forEach(clearTimeout);
    timers.clear();
    chip.removeAttribute('data-tease');
    hideHint();
  };

  return { start, stop };
}
