/** What this browser remembers about blueprint mode. Storage can be blocked, so every call is safe. */
export const memory = {
  read(key: string): string | null {
    try {
      return localStorage.getItem(`blueprint-${key}`);
    } catch {
      return null;
    }
  },
  write(key: string, value: string) {
    try {
      localStorage.setItem(`blueprint-${key}`, value);
    } catch {
      // The teaser then simply starts over next time. Nothing depends on this.
    }
  },
};
