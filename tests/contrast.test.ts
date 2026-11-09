import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../src/lib/contrast';

describe('contrastRatio', () => {
  it('is 21 for black on white and 1 for the same color', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5);
  });

  it('does not depend on the order of the colors', () => {
    expect(contrastRatio('#a78bfa', '#0b0b0c')).toBeCloseTo(
      contrastRatio('#0b0b0c', '#a78bfa'),
      10,
    );
  });

  it('accepts short hex colors', () => {
    expect(contrastRatio('#fff', '#000')).toBeCloseTo(21, 5);
  });

  it('rejects a value that is not a hex color', () => {
    expect(() => contrastRatio('red', '#000')).toThrow('Not a hex color');
  });
});
