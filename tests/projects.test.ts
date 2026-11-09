import { describe, expect, it } from 'vitest';
import { nextProject, visibleProjects } from '../src/lib/projects';

const project = (id: string, order: number, hidden = false) => ({
  id,
  data: { order, hidden },
});

describe('visibleProjects', () => {
  it('sorts by order, whatever the order of the input', () => {
    const shown = visibleProjects([
      project('c', 3),
      project('a', 1),
      project('b', 2),
    ]);
    expect(shown.map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });

  it('leaves out hidden projects', () => {
    const shown = visibleProjects([
      project('a', 1),
      project('b', 2, true),
      project('c', 3),
    ]);
    expect(shown.map((p) => p.id)).toEqual(['a', 'c']);
  });

  it('does not change the list it is given', () => {
    const input = [project('b', 2), project('a', 1)];
    visibleProjects(input);
    expect(input.map((p) => p.id)).toEqual(['b', 'a']);
  });

  it('is empty when every project is hidden', () => {
    expect(visibleProjects([project('a', 1, true)])).toEqual([]);
  });
});

describe('nextProject', () => {
  const all = [project('a', 1), project('b', 2, true), project('c', 3)];

  it('returns the next shown project and skips hidden ones', () => {
    expect(nextProject(all, 'a')?.id).toBe('c');
  });

  it('wraps around to the first project', () => {
    expect(nextProject(all, 'c')?.id).toBe('a');
  });

  it('has none for a hidden or unknown project', () => {
    expect(nextProject(all, 'b')).toBeUndefined();
    expect(nextProject(all, 'missing')).toBeUndefined();
  });

  it('has none when there is only one shown project', () => {
    expect(
      nextProject([project('a', 1), project('b', 2, true)], 'a'),
    ).toBeUndefined();
  });
});
