interface ProjectLike {
  id: string;
  data: { order: number; hidden: boolean };
}

/** The projects that are shown on the site, in display order. */
export function visibleProjects<T extends ProjectLike>(
  projects: readonly T[],
): T[] {
  return projects
    .filter((project) => !project.data.hidden)
    .sort((a, b) => a.data.order - b.data.order);
}

/**
 * The project after `id` in display order, wrapping around to the first. There is none
 * when `id` is not shown or is the only project.
 */
export function nextProject<T extends ProjectLike>(
  projects: readonly T[],
  id: string,
): T | undefined {
  const shown = visibleProjects(projects);
  const index = shown.findIndex((project) => project.id === id);
  if (index === -1 || shown.length < 2) return undefined;
  return shown[(index + 1) % shown.length];
}
