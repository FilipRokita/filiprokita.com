import { describe, expect, it } from 'vitest';
import { findLine } from '../src/blueprint/locate';

const lines = [
  '---',
  '/** A link that opens in a new tab. */',
  'const external = true;',
  '---',
  '<a',
  '  class:list={["link"]}',
  '  href={href}',
  '>',
  '  Read more here',
  '</a>',
];

const probe = { text: '', id: '', tag: 'a', classes: [] };

describe('findLine', () => {
  it('finds the line with the text first', () => {
    expect(findLine(lines, { ...probe, text: 'Read more here' })).toBe(8);
  });

  it('finds the opening tag when there is no text', () => {
    expect(findLine(lines, probe)).toBe(4);
  });

  it('finds an id', () => {
    const withId = [...lines.slice(0, 4), '<section id="about">'];
    expect(findLine(withId, { ...probe, tag: 'div', id: 'about' })).toBe(4);
  });

  it('skips comments when it falls back to a class name', () => {
    expect(
      findLine(lines, { ...probe, tag: 'nav', classes: ['link', 'opens'] }),
    ).toBe(5);
  });

  it('ignores text that is too short or too long to mean anything', () => {
    expect(findLine(lines, { ...probe, tag: 'nav', text: 'ab' })).toBe(-1);
    expect(
      findLine(lines, { ...probe, tag: 'nav', text: 'x'.repeat(60) }),
    ).toBe(-1);
  });

  it('returns -1 when nothing matches', () => {
    expect(findLine(lines, { ...probe, tag: 'dialog' })).toBe(-1);
  });
});
