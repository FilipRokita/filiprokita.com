/**
 * The project image morphs between the home page and a project page, in both
 * directions. The browser matches two elements with the same `view-transition-name`,
 * so the name is set only on the image that takes part, just before the snapshots.
 */

const PROJECT_PATH = /^\/projects\/([^/]+)\/?$/;

const projectIdOf = (url: URL) => PROJECT_PATH.exec(url.pathname)?.[1];

const image = (id: string) =>
  document.querySelector<HTMLElement>(`[data-project-image="${id}"]`);

const markImage = (id: string) => {
  const target = image(id);
  if (target) target.style.viewTransitionName = 'project-image';
  return target;
};

// Leaving a page: name the image on the page that is going away.
addEventListener('pageswap', (event) => {
  if (!event.viewTransition || !event.activation?.entry) return;
  const from = new URL(event.activation.from?.url ?? location.href);
  const to = new URL(event.activation.entry.url ?? location.href);
  const id = projectIdOf(to) ?? projectIdOf(from);
  if (id) markImage(id);
});

// Arriving: name the image on the new page, and skip the intro animations.
addEventListener('pagereveal', (event) => {
  if (!event.viewTransition) return;
  document.documentElement.dataset.transition = '';
  const fromUrl = navigation.activation?.from?.url;
  const to = new URL(location.href);
  const id =
    projectIdOf(to) ?? (fromUrl ? projectIdOf(new URL(fromUrl)) : undefined);
  if (!id) return;
  // Back on the home page, land on the row the visitor came from, so the image has a place to settle.
  if (!projectIdOf(to)) {
    image(id)
      ?.closest('article')
      ?.scrollIntoView({ block: 'center', behavior: 'instant' });
  }
  markImage(id);
  // The name is removed afterwards, so later transitions start clean.
  event.viewTransition.finished.finally(() => {
    const target = image(id);
    if (target) target.style.viewTransitionName = '';
  });
});
