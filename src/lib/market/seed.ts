/** Deterministic pseudo-randomness. Same seed string always yields the same stream. */

/** FNV-1a, 32-bit. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Mulberry32 PRNG — small, fast, and stable across runtimes. */
export function createRng(seed: string | number) {
  let a = typeof seed === 'string' ? hashString(seed) : seed >>> 0;
  return {
    /** float in [0, 1) */
    next(): number {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    /** integer in [min, max] */
    int(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },
    /** float in [min, max] */
    float(min: number, max: number): number {
      return this.next() * (max - min) + min;
    },
    pick<T>(items: readonly T[]): T {
      return items[Math.floor(this.next() * items.length)];
    },
    bool(probability = 0.5): boolean {
      return this.next() < probability;
    },
  };
}

export type Rng = ReturnType<typeof createRng>;

export function normalizeTopic(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
