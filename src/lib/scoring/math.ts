/** Small numeric helpers shared by the scoring engine. All pure. */

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Maps `value` onto 0-100 along a logarithmic curve between `atZero` and `atHundred`.
 * Used wherever the underlying quantity spans orders of magnitude (searches, reviews, BSR).
 * `atZero` may be larger than `atHundred`, which inverts the scale.
 */
export function logScale(value: number, atZero: number, atHundred: number): number {
  const v = Math.log10(Math.max(value, 1));
  const lo = Math.log10(Math.max(atZero, 1));
  const hi = Math.log10(Math.max(atHundred, 1));
  if (lo === hi) return 0;
  return clamp(((v - lo) / (hi - lo)) * 100);
}

/** Maps `value` onto 0-100 linearly between `atZero` and `atHundred`. */
export function linearScale(value: number, atZero: number, atHundred: number): number {
  if (atZero === atHundred) return 0;
  return clamp(((value - atZero) / (atHundred - atZero)) * 100);
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Rounds to the nearest .99 or .49 price point, which is how books are actually priced. */
export function roundToPricePoint(value: number): number {
  const whole = Math.floor(value);
  const fraction = value - whole;
  if (fraction < 0.25) return Math.max(0.99, whole - 1 + 0.99);
  if (fraction < 0.75) return whole + 0.49;
  return whole + 0.99;
}
