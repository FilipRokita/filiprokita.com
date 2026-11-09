import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import { projectSchema } from '../src/schemas/project';

// Astro passes a real image() helper. A plain string stands in for it here.
const schema = projectSchema(() => z.string());

const valid = {
  title: 'Tapisode',
  summary: 'A fast tracker.',
  order: 1,
  cover: 'cover.webp',
  coverAlt: 'A screenshot',
  coverCaption: 'Desktop and phone',
  links: {
    live: 'https://example.com',
    github: 'https://github.com/example/repo',
  },
  stack: ['TypeScript'],
};

const decision = (n: number) => ({ title: `Choice ${n}`, text: `Reason ${n}` });

describe('projectSchema', () => {
  it('accepts a complete project and defaults hidden to false', () => {
    const parsed = schema.parse(valid);
    expect(parsed.hidden).toBe(false);
  });

  it('accepts a project without a live link', () => {
    const { live, ...links } = valid.links;
    expect(live).toBeDefined();
    expect(schema.safeParse({ ...valid, links }).success).toBe(true);
  });

  it.each([
    ['a missing title', { ...valid, title: '' }],
    ['an empty summary', { ...valid, summary: '' }],
    ['an order of zero', { ...valid, order: 0 }],
    ['a fractional order', { ...valid, order: 1.5 }],
    ['a missing cover description', { ...valid, coverAlt: '' }],
    [
      'a live link that is not a URL',
      { ...valid, links: { ...valid.links, live: 'tapisode' } },
    ],
    ['a missing GitHub link', { ...valid, links: { live: valid.links.live } }],
    ['an empty stack', { ...valid, stack: [] }],
  ])('rejects %s', (_name, project) => {
    expect(schema.safeParse(project).success).toBe(false);
  });

  it('accepts three to five decisions and rejects fewer or more', () => {
    const withDecisions = (count: number) =>
      schema.safeParse({
        ...valid,
        decisions: Array.from({ length: count }, (_, i) => decision(i)),
      }).success;
    expect([2, 3, 5, 6].map(withDecisions)).toEqual([false, true, true, false]);
  });
});
