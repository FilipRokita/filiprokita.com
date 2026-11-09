/** Facts about the site that more than one place needs. */
export const site = {
  name: 'Filip Rokita',
  jobTitle: 'Software engineer',
  /** The canonical address, which the sitemap and the share tags use. */
  url: 'https://www.filiprokita.com',
  description:
    'Filip Rokita, software engineer. Building apps, data and AI, from idea to production.',
  email: 'contact@filiprokita.com',
  github: 'https://github.com/FilipRokita',
  linkedin: 'https://linkedin.com/in/filiprokita',
  repo: 'https://github.com/FilipRokita/filiprokita.com',
  /** Links to the build commit work only once the repository is public. */
  repoIsPublic: false,
} as const;

/** The sections of the home page, in order. Used by the header navigation. */
export const sections = [
  { id: 'about', label: 'About' },
  { id: 'what', label: 'What I do' },
  { id: 'how', label: 'How I work' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
] as const;
