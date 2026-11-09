/** The title of a page: the site name alone for the home page, otherwise "Page · Site". */
export function pageTitle(siteName: string, title?: string): string {
  return title ? `${title} · ${siteName}` : siteName;
}

interface PersonInput {
  name: string;
  url: string;
  email: string;
  jobTitle: string;
  sameAs: readonly string[];
}

/** schema.org Person data for the home page, as a plain object for a JSON-LD script. */
export function personJsonLd({
  name,
  url,
  email,
  jobTitle,
  sameAs,
}: PersonInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url,
    email,
    jobTitle,
    sameAs: [...sameAs],
  };
}
