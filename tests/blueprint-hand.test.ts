import { describe, expect, it } from 'vitest';
import { cloudPath, squiggle } from '../src/blueprint/hand';
import { seeded } from '../src/blueprint/random';

describe('seeded', () => {
  it('gives the same numbers for the same seed', () => {
    const a = seeded(7);
    const b = seeded(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('stays between 0 and 1 and differs between seeds', () => {
    const random = seeded(1);
    for (let i = 0; i < 100; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
    expect(seeded(1)()).not.toBe(seeded(2)());
  });
});

describe('squiggle', () => {
  it('draws a curve that ends where it was told, with an arrowhead', () => {
    const path = squiggle({ x: 0, y: 0 }, { x: 100, y: 50 }, 20, seeded(7));
    expect(path.startsWith('M0 0C')).toBe(true);
    expect(path).toContain('100 50');
    // One curve, then the two strokes of the head meeting at the end.
    expect(path.match(/L/g)).toHaveLength(2);
  });

  it('is the same every time for the same seed', () => {
    const draw = () =>
      squiggle({ x: 5, y: 5 }, { x: 80, y: 90 }, -12, seeded(7));
    expect(draw()).toBe(draw());
  });
});

describe('cloudPath', () => {
  it('goes all the way around and closes', () => {
    const path = cloudPath({ x: 10, y: 20, w: 100, h: 40 });
    expect(path.startsWith('M10 20')).toBe(true);
    expect(path.endsWith('Z')).toBe(true);
    expect(path.match(/a/g)?.length ?? 0).toBeGreaterThanOrEqual(8);
  });
});
