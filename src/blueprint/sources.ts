import { site } from '../config/site';

/**
 * The real source of every Astro file, as lazy chunks: a file is fetched only when someone
 * clicks something it renders. Nothing here is copied or generated, so it cannot drift.
 */
const files = import.meta.glob<string>('/src/**/*.astro', {
  query: '?raw',
  import: 'default',
});

const baseName = (path: string) => path.slice(path.lastIndexOf('/') + 1);

const pathsByName = new Map(
  Object.keys(files).map((path) => [baseName(path), path]),
);

export interface Source {
  /** The path in the repository, such as `src/components/Link.astro`. */
  path: string;
  code: string;
  /** The file on GitHub, once the repository is public. */
  url?: string;
}

export async function loadSource(name: string): Promise<Source | null> {
  const absolute = pathsByName.get(name);
  const load = absolute ? files[absolute] : undefined;
  if (!absolute || !load) return null;
  const path = absolute.slice(1);
  return {
    path,
    code: await load(),
    url: site.repoIsPublic ? `${site.repo}/blob/main/${path}` : undefined,
  };
}
