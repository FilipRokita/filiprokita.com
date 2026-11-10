/** What is known about a clicked element, to find the line of source it comes from. */
export interface Probe {
  /** The text the element holds itself. */
  text: string;
  id: string;
  tag: string;
  classes: string[];
}

const MIN_TEXT = 3;
const MAX_TEXT = 40;
const COMMENT = /^\s*(\/\/|\/\*|\*)/;

/**
 * The index of the line that most likely produced the element, or -1. It tries the text first,
 * then the id, then the opening tag, then the longest class names, and it skips comments.
 */
export function findLine(lines: string[], probe: Probe): number {
  const attempts: ((line: string) => boolean)[] = [];
  const text = probe.text.trim().split('\n')[0]?.trim() ?? '';
  if (text.length >= MIN_TEXT && text.length <= MAX_TEXT) {
    attempts.push((line) => line.includes(text));
  }
  if (probe.id) attempts.push((line) => line.includes(`id="${probe.id}"`));
  const tag = new RegExp(`<${probe.tag}(?![\\w-])`);
  attempts.push((line) => tag.test(line));
  for (const name of [...probe.classes].sort((a, b) => b.length - a.length)) {
    if (name.length > 3) {
      attempts.push((line) => line.includes(name) && !COMMENT.test(line));
    }
  }
  for (const matches of attempts) {
    const index = lines.findIndex(matches);
    if (index >= 0) return index;
  }
  return -1;
}
