import { html } from './dom';
import { highlight } from './highlight';
import { componentOf, shortName } from './labels';
import { findLine } from './locate';
import { loadSource } from './sources';
import type { Source } from './sources';

/** Clicks on these keep working in blueprint mode: the mode's own controls and the dialogs. */
const KEEP = '[data-blueprint-ui], [data-blueprint-chip], dialog';

interface Drawer {
  dialog: HTMLDialogElement;
  title: HTMLElement;
  meta: HTMLElement;
  why: HTMLElement;
  code: HTMLElement;
  copy: HTMLButtonElement;
  link: HTMLAnchorElement;
}

function buildDrawer(): Drawer {
  const dialog = html('dialog', 'bp-drawer');
  dialog.setAttribute('data-blueprint-ui', '');
  dialog.setAttribute('aria-labelledby', 'bp-drawer-title');

  const title = html('h2', 'bp-drawer-title');
  title.id = 'bp-drawer-title';
  const meta = html('span', 'bp-drawer-meta');
  const copy = html('button', 'bp-button', 'Copy');
  copy.type = 'button';
  const link = html('a', 'bp-button', 'View on GitHub');
  link.target = '_blank';
  link.rel = 'noopener';
  link.append(html('span', 'bp-sr', ' (opens in a new tab)'));
  const close = html('button', 'bp-button', 'Close');
  close.type = 'button';
  close.setAttribute('aria-keyshortcuts', 'Escape');
  close.addEventListener('click', () => dialog.close());

  const bar = html('div', 'bp-drawer-bar');
  const heading = html('div', 'bp-drawer-heading');
  heading.append(title, meta);
  const actions = html('div', 'bp-drawer-actions');
  actions.append(copy, link, close);
  bar.append(heading, actions);

  const why = html('p', 'bp-drawer-why');
  const code = html('div', 'bp-drawer-code');
  code.tabIndex = 0;
  code.setAttribute('role', 'region');
  code.setAttribute('aria-label', 'Source code');

  dialog.append(bar, why, code);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  return { dialog, title, meta, why, code, copy, link };
}

/** Fills the code region with numbered, colored lines and returns the row to scroll to. */
function showCode(container: HTMLElement, source: Source, hit: number) {
  const lines = highlight(source.code);
  const rows = lines.map((tokens, index) => {
    const row = html(
      'div',
      index === hit ? 'bp-row-code is-hit' : 'bp-row-code',
    );
    const number = html('span', 'bp-row-no', String(index + 1));
    number.setAttribute('aria-hidden', 'true');
    const content = html('span', 'bp-row-text');
    for (const { kind, text } of tokens) {
      content.append(
        kind ? html('i', `bp-token bp-token--${kind}`, text) : text,
      );
    }
    if (!tokens.length) content.append(' ');
    row.append(number, content);
    return row;
  });
  const code = html('code', 'bp-code');
  code.replaceChildren(...rows);
  const pre = html('pre', 'bp-pre');
  pre.append(code);
  container.replaceChildren(pre);
  return rows[hit];
}

/**
 * In blueprint mode a click never goes where it normally would. It opens the real source of the
 * component that rendered the thing, with the likely line marked. The page's own scripts can
 * still click things (the command palette does), because only a real click is caught.
 */
export function mountDrawer(signal: AbortSignal) {
  let drawer: Drawer | null = null;

  const open = async (element: Element) => {
    const name = componentOf(element);
    const source = await loadSource(name);
    if (!source || signal.aborted) return;

    drawer ??= buildDrawer();
    const { dialog, title, meta, why, code, copy, link } = drawer;
    const lines = source.code.split('\n');
    const hit = findLine(lines, {
      text: [...element.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent ?? '')
        .join(' '),
      id: element.id,
      tag: element.tagName.toLowerCase(),
      classes: [...element.classList],
    });

    title.textContent = source.path;
    meta.textContent = ` · ${lines.length} lines`;
    why.replaceChildren(
      'You pointed at ',
      html('b', '', shortName(element)),
      `. It is rendered by `,
      html('b', '', name),
      hit >= 0 ? `, line ${hit + 1}.` : '.',
    );
    link.hidden = !source.url;
    if (source.url) link.href = source.url;
    copy.textContent = 'Copy';
    copy.onclick = async () => {
      try {
        await navigator.clipboard.writeText(source.code);
        copy.textContent = 'Copied';
      } catch {
        copy.textContent = 'Copy failed';
      }
    };

    const row = showCode(code, source, hit);
    if (!dialog.isConnected) document.body.append(dialog);
    if (!dialog.open) dialog.showModal();
    row?.scrollIntoView({ block: 'center' });
  };

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      if (!event.isTrusted || !(target instanceof Element)) return;
      if (target.closest(KEEP)) return;
      event.preventDefault();
      event.stopPropagation();
      void open(target);
    },
    { capture: true, signal },
  );

  signal.addEventListener(
    'abort',
    () => {
      drawer?.dialog.close();
      drawer?.dialog.remove();
    },
    { once: true },
  );
}
