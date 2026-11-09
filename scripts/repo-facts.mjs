// Prints facts about public GitHub repositories as JSON, for the update-projects skill.
// Read only: it calls the public GitHub API without a token and writes nothing.
//
//   node scripts/repo-facts.mjs FilipRokita/tapisode FilipRokita/evencost
//   node scripts/repo-facts.mjs --entries     # every repo linked from src/content/projects
import { readdirSync, readFileSync } from 'node:fs';

const API = 'https://api.github.com';
const entriesDir = new URL('../src/content/projects/', import.meta.url);

/** The "owner/name" of a GitHub repository URL, or undefined. */
export function repoOf(url) {
  return /^https:\/\/github\.com\/([^/]+\/[^/]+?)\/?$/.exec(url)?.[1];
}

/** The repositories that the project entries link to. */
function linkedRepos() {
  return readdirSync(entriesDir)
    .filter((file) => file.endsWith('.md'))
    .map(
      (file) =>
        /^\s+github:\s*(\S+)/m.exec(
          readFileSync(new URL(file, entriesDir), 'utf8'),
        )?.[1],
    )
    .map((url) => (url ? repoOf(url) : undefined))
    .filter(Boolean);
}

async function get(path) {
  const response = await fetch(`${API}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'portfolio-update-projects',
    },
  });
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.json();
}

async function facts(repo) {
  const info = await get(`/repos/${repo}`);
  // A private or missing repository is reported, never read.
  if (!info || info.private) return { repo, available: false };
  const [languages, readme] = await Promise.all([
    get(`/repos/${repo}/languages`),
    fetch(`${API}/repos/${repo}/readme`, {
      headers: {
        Accept: 'application/vnd.github.raw+json',
        'User-Agent': 'portfolio-update-projects',
      },
    }).then((r) => (r.ok ? r.text() : '')),
  ]);
  return {
    repo,
    available: true,
    description: info.description,
    homepage: info.homepage || null,
    topics: info.topics,
    languages: Object.keys(languages ?? {}),
    pushedAt: info.pushed_at,
    archived: info.archived,
    readmeStart: readme.slice(0, 3000),
  };
}

const args = process.argv.slice(2);
const repos = args.includes('--entries') ? linkedRepos() : args;
if (repos.length === 0) {
  console.error(
    'Usage: node scripts/repo-facts.mjs <owner/name>... | --entries',
  );
  process.exit(1);
}
console.log(JSON.stringify(await Promise.all(repos.map(facts)), null, 2));
