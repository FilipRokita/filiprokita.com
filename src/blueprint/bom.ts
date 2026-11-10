export interface Group {
  n: number;
  bytes: number;
}

/** What one page references, as measured after the build by scripts/blueprint-bom.mjs. */
export interface Bom {
  html: Group;
  css: Group;
  js: Group;
  fonts: Group;
  images: Group;
}

let all: Promise<Record<string, Bom>> | undefined;

/** The bill of materials of the current page, or null in development, where nothing is built. */
export async function loadBom(): Promise<Bom | null> {
  try {
    all ??= fetch('/blueprint/bom.json').then((response) => {
      if (!response.ok) throw new Error(String(response.status));
      return response.json() as Promise<Record<string, Bom>>;
    });
    const route = location.pathname.endsWith('/')
      ? location.pathname
      : `${location.pathname}/`;
    return (await all)[route] ?? null;
  } catch {
    all = undefined;
    return null;
  }
}
