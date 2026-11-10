import { describe, expect, it } from 'vitest';
import { overlaps, Reservations } from '../src/blueprint/measure';

const box = (x: number, y: number, w = 100, h = 40) => ({ x, y, w, h });

describe('overlaps', () => {
  it('is true for boxes that share some area', () => {
    expect(overlaps(box(0, 0), box(50, 20))).toBe(true);
  });

  it('is false for boxes that only touch or are apart', () => {
    expect(overlaps(box(0, 0), box(100, 0))).toBe(false);
    expect(overlaps(box(0, 0), box(0, 200))).toBe(false);
  });

  it('counts a margin as part of the box', () => {
    expect(overlaps(box(0, 0), box(105, 0), 10)).toBe(true);
  });
});

describe('Reservations', () => {
  it('leaves a free place where it is', () => {
    expect(new Reservations().claim(box(0, 0))).toEqual(box(0, 0));
  });

  it('moves a box down until it does not sit on one that was claimed before', () => {
    const reservations = new Reservations();
    reservations.claim(box(0, 0));
    const moved = reservations.claim(box(0, 0));
    expect(moved.y).toBeGreaterThan(0);
    expect(overlaps(box(0, 0), moved, 10)).toBe(false);
  });

  it('gives up after a few tries instead of looping', () => {
    const reservations = new Reservations();
    reservations.claim(box(0, 0, 100, 10000));
    expect(() => reservations.claim(box(0, 0))).not.toThrow();
  });
});
