import { loadHandwriting } from './handwriting';
import { memory } from './memory';

const FIRST_TEASE = 2500;
const TEASE_EVERY = 25_000;
const TEASE_FOR = 2000;
const HINT_AFTER = 5500;
const HINT_FOR = 7000;
const HINTS_AT_MOST = 2;

/**
 * Makes the chip catch the eye, gently: its corners draw themselves now and then, and once or twice
 * a handwritten hint points at it. Both stop for good after the first use, and neither runs for
 * someone who asked for less motion.
 */
export function createTeaser(chip: HTMLElement) {
  const timers: ReturnType<typeof setTimeout>[] = [];
  let every: ReturnType<typeof setInterval> | undefined;

  const quiet = () =>
    document.hidden ||
    chip.getAttribute('aria-pressed') === 'true' ||
    chip.matches(':hover');

  const tease = () => {
    if (quiet()) return;
    chip.setAttribute('data-tease', '');
    timers.push(
      setTimeout(() => chip.removeAttribute('data-tease'), TEASE_FOR),
    );
  };

  const hideHint = () => chip.removeAttribute('data-hint');

  const showHint = async () => {
    const shown = Number(memory.read('hints') ?? 0);
    if (quiet() || shown >= HINTS_AT_MOST) return;
    // The handwriting is fetched now, so the hint never appears in the wrong font first.
    if (!(await loadHandwriting())) return;
    if (quiet()) return;
    memory.write('hints', String(shown + 1));
    chip.setAttribute('data-hint', '');
    timers.push(setTimeout(hideHint, HINT_FOR));
  };

  const start = () => {
    if (
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      memory.read('used')
    )
      return;
    timers.push(
      setTimeout(tease, FIRST_TEASE),
      setTimeout(() => void showHint(), HINT_AFTER),
    );
    every = setInterval(tease, TEASE_EVERY);
    for (const type of ['pointerdown', 'keydown', 'wheel'] as const) {
      addEventListener(type, hideHint, { passive: true });
    }
  };

  /** Used for the first time: the teaser has done its job. */
  const stop = () => {
    memory.write('used', '1');
    timers.forEach(clearTimeout);
    clearInterval(every);
    chip.removeAttribute('data-tease');
    hideHint();
  };

  return { start, stop };
}
