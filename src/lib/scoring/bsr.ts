import { clamp } from './math';

/**
 * BSR -> sales conversion.
 *
 * Amazon does not publish the rank-to-sales curve, so this is a piecewise power-law
 * fit over publicly reported anchor points for the US Kindle store. Sales roughly
 * follow `units/day = a * BSR^-b` within each band, with `b` flattening as rank grows.
 *
 * The curve is a documented estimate, not a measurement, and it is deterministic:
 * the same rank always returns the same number.
 */
interface Band {
  maxBsr: number;
  a: number;
  b: number;
}

const KINDLE_BANDS: Band[] = [
  { maxBsr: 10, a: 8_000, b: 0.42 },
  { maxBsr: 100, a: 12_500, b: 0.62 },
  { maxBsr: 1_000, a: 22_000, b: 0.75 },
  { maxBsr: 10_000, a: 60_000, b: 0.9 },
  { maxBsr: 100_000, a: 220_000, b: 1.04 },
  { maxBsr: 1_000_000, a: 900_000, b: 1.18 },
  { maxBsr: Number.POSITIVE_INFINITY, a: 3_000_000, b: 1.3 },
];

/** Print titles sell at a lower rate for the same rank; the print store is smaller. */
const PRINT_MULTIPLIER = 0.42;

export type Marketplace = 'kindle' | 'print';

export function estimateDailySalesFromBsr(bsr: number, marketplace: Marketplace = 'kindle'): number {
  const rank = Math.max(1, Math.round(bsr));
  const band = KINDLE_BANDS.find((b) => rank <= b.maxBsr) ?? KINDLE_BANDS[KINDLE_BANDS.length - 1];
  const units = band.a * rank ** -band.b;
  const scaled = marketplace === 'print' ? units * PRINT_MULTIPLIER : units;
  return Math.max(0, Math.round(scaled * 100) / 100);
}

export function estimateMonthlySalesFromBsr(bsr: number, marketplace: Marketplace = 'kindle') {
  return Math.round(estimateDailySalesFromBsr(bsr, marketplace) * 30.4);
}

/** The inverse: what rank would a title holding this many units/day sit at? */
export function estimateBsrFromDailySales(unitsPerDay: number, marketplace: Marketplace = 'kindle') {
  const target = marketplace === 'print' ? unitsPerDay / PRINT_MULTIPLIER : unitsPerDay;
  if (target <= 0) return 5_000_000;
  let low = 1;
  let high = 5_000_000;
  for (let i = 0; i < 60; i += 1) {
    const mid = Math.round((low + high) / 2);
    if (estimateDailySalesFromBsr(mid, 'kindle') > target) low = mid;
    else high = mid;
  }
  return high;
}

/** KDP royalty rate for a given list price and format. */
export function royaltyRate(price: number, format: 'ebook' | 'paperback' | 'audiobook'): number {
  if (format === 'ebook') return price >= 2.99 && price <= 9.99 ? 0.7 : 0.35;
  if (format === 'paperback') return 0.6;
  return 0.4;
}

/**
 * Per-sale royalty after Amazon's cut, and for print, after unit printing cost.
 * Printing cost uses KDP's US black-ink formula: $1.00 fixed + $0.012 per page.
 */
export function royaltyPerSale(
  price: number,
  format: 'ebook' | 'paperback' | 'audiobook',
  pageCount = 220,
): number {
  const rate = royaltyRate(price, format);
  if (format === 'paperback') {
    const printCost = 1.0 + 0.012 * pageCount;
    return Math.max(0, Math.round((price * rate - printCost) * 100) / 100);
  }
  if (format === 'ebook') {
    // Kindle deducts a delivery fee on the 70% tier; ~$0.06 for a typical non-fiction file.
    const delivery = rate === 0.7 ? 0.06 : 0;
    return Math.max(0, Math.round((price * rate - delivery) * 100) / 100);
  }
  return Math.round(price * rate * 100) / 100;
}

/** 0-100 measure of how hard a rank is to hold. Used by the competition factor. */
export function bsrDifficulty(bsr: number): number {
  return clamp(100 - Math.log10(Math.max(bsr, 1)) * (100 / Math.log10(1_000_000)));
}
