import { describe, expect, it } from 'vitest';
import { highlight } from '../src/blueprint/highlight';

const kinds = (source: string) =>
  highlight(source)
    .flat()
    .filter((token) => token.kind)
    .map((token) => [token.kind, token.text]);

describe('highlight', () => {
  it('recognizes comments, strings, tags, keywords and numbers', () => {
    expect(kinds(`const a = 'x'; // note`)).toEqual([
      ['keyword', 'const'],
      ['string', "'x'"],
      ['comment', '// note'],
    ]);
    expect(kinds('<a href="/">')).toEqual([
      ['tag', '<a'],
      ['string', '"/"'],
    ]);
    expect(kinds('width = 12')).toEqual([['number', '12']]);
  });

  it('keeps a comment that spans lines as one token per line', () => {
    const lines = highlight('/* one\ntwo */\nlet b');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toEqual([{ kind: 'comment', text: '/* one' }]);
    expect(lines[1]).toEqual([{ kind: 'comment', text: 'two */' }]);
  });

  it('returns exactly one entry per line and loses no text', () => {
    const source = '---\nimport A from "./A.astro";\n---\n\n<A />\n';
    const lines = highlight(source);
    expect(lines).toHaveLength(source.split('\n').length);
    const text = lines.map((line) => line.map((token) => token.text).join(''));
    expect(text.join('\n')).toBe(source);
  });

  it('does not take a slash pair inside a string for a comment', () => {
    expect(kinds(`const url = 'https://example.com';`)).toEqual([
      ['keyword', 'const'],
      ['string', "'https://example.com'"],
    ]);
  });
});
