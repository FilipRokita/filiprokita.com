export type TokenKind = 'comment' | 'string' | 'tag' | 'keyword' | 'number';

export interface Token {
  /** `null` for plain text. */
  kind: TokenKind | null;
  text: string;
}

// One pass over the source, first match wins: comments, strings, tags, keywords, numbers.
const PATTERN =
  /(<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/|\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(<\/?[A-Za-z][\w.:-]*)|\b(import|export|const|let|from|interface|type|return|if|else|async|await|new|of|in|for|as|function)\b|(\b\d[\d.]*\b)/g;

const KINDS: TokenKind[] = ['comment', 'string', 'tag', 'keyword', 'number'];

/**
 * Splits Astro or TypeScript source into lines of tokens, for coloring. It is a small tokenizer, not a
 * parser: good enough to read code by, and a token never spans two lines.
 */
export function highlight(source: string): Token[][] {
  const lines: Token[][] = [[]];
  const push = (kind: TokenKind | null, text: string) => {
    const parts = text.split('\n');
    parts.forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ kind, text: part });
    });
  };

  let last = 0;
  for (const match of source.matchAll(PATTERN)) {
    push(null, source.slice(last, match.index));
    const group = match.findIndex(
      (value, index) => index > 0 && value !== undefined,
    );
    push(KINDS[group - 1], match[0]);
    last = match.index + match[0].length;
  }
  push(null, source.slice(last));
  return lines;
}
