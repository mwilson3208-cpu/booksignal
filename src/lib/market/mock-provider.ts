import type {
  CategorySuggestion,
  Competitor,
  MarketSnapshot,
  RelatedKeyword,
} from '@/lib/types';
import { estimateMonthlySalesFromBsr } from '@/lib/scoring/bsr';
import { createRng, displayTopic, hashString, normalizeTopic, shuffle, type Rng } from './seed';

/**
 * v1 market data layer: a deterministic mock.
 *
 * Book Demand Lab v1 ships against generated marketplace data rather than a live feed. The
 * generator is seeded from the normalized topic string, so a topic always returns the
 * same snapshot — which is what lets the scoring engine be reproducible and testable.
 * Every surface that renders a mock snapshot is labelled as sample data in the UI.
 *
 * Swapping in a live source means implementing `MarketProvider` against the Amazon
 * Product Advertising API for listings plus a keyword API for search volume, and
 * changing `getMarketProvider()` in `./index.ts`. Nothing downstream changes: the
 * scoring engine consumes `MarketSnapshot` and knows nothing about where it came from.
 *
 * All titles, authors and ASINs below are synthetic. None refer to a real book or person.
 */

const TITLE_PATTERNS = [
  '{Topic}: A Practical Guide',
  'The {Topic} Blueprint',
  '{Topic} Made Simple',
  'Mastering {Topic}',
  'The Complete {Topic} Handbook',
  '{Topic} for Beginners',
  'The Little Book of {Topic}',
  '{Topic} in 30 Days',
  'Rethinking {Topic}',
  'The {Topic} Method',
  'Everyday {Topic}',
  '{Topic}: What Nobody Tells You',
  'The Quiet Art of {Topic}',
  '{Topic} Without the Overwhelm',
  'From Zero to {Topic}',
  'The {Topic} Field Guide',
  '{Topic} That Actually Works',
  'A Beginner’s Path to {Topic}',
  'The {Topic} Reset',
  'Small Steps to {Topic}',
];

const SUBTITLE_PATTERNS = [
  'A step-by-step system for busy people',
  'Simple habits that compound over a year',
  'The 12-week plan for lasting results',
  'Everything you wish someone had told you first',
  'A no-nonsense guide for absolute beginners',
  'Tools, templates and a plan you can start today',
  'How ordinary people get extraordinary outcomes',
  'The workbook edition, with exercises',
];

const FIRST_NAMES = [
  'Dana', 'Marcus', 'Priya', 'Theo', 'Nadia', 'Colin', 'Rosa', 'Elliot', 'Maya', 'Sung',
  'Harriet', 'Devon', 'Amara', 'Gil', 'Iris', 'Tomas', 'Bea', 'Ronan', 'Lena', 'Kofi',
];

const LAST_NAMES = [
  'Hollis', 'Baptiste', 'Warrick', 'Okafor', 'Lindqvist', 'Marsh', 'Delgado', 'Aoki',
  'Ferreira', 'Nakamura', 'Bowen', 'Castellan', 'Odum', 'Rhys', 'Vaughn', 'Ilori',
  'Pemberton', 'Zhao', 'Novak', 'Sterling',
];

const KEYWORD_MODIFIERS = [
  'for beginners', 'for women', 'for men over 50', 'workbook', 'journal', 'step by step',
  'at home', 'on a budget', 'for busy professionals', 'planner', 'in 30 days', 'made easy',
  'for couples', 'for teens', 'checklist', 'for small business', 'guide 2026', 'daily practice',
];

const CATEGORY_ROOTS = [
  'Books > Self-Help > Personal Transformation',
  'Kindle Store > Kindle eBooks > Health, Fitness & Dieting',
  'Books > Business & Money > Small Business & Entrepreneurship',
  'Kindle Store > Kindle eBooks > Education & Teaching',
  'Books > Crafts, Hobbies & Home > Home Improvement & Design',
  'Kindle Store > Kindle eBooks > Parenting & Relationships',
  'Books > Cookbooks, Food & Wine > Special Diet',
];

function asin(rng: Rng): string {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ0123456789';
  let out = 'B0';
  for (let i = 0; i < 8; i += 1) out += rng.pick(chars.split(''));
  return out;
}

/**
 * Base demand for a topic. Longer, more specific phrases get less volume, which is what
 * makes niching down show up as a real trade-off in the numbers rather than a free win.
 */
function baseSearchVolume(normalized: string, rng: Rng): number {
  const words = normalized.split(' ').filter(Boolean).length;
  const specificityPenalty = 1 / (1 + (words - 1) * 0.3);
  // Log-uniform across the plausible range, so most topics land small and a few land big.
  const magnitude = rng.float(Math.log10(900), Math.log10(120_000));
  return Math.max(60, Math.round(10 ** magnitude * specificityPenalty));
}

/**
 * How many titles compete for a phrase. Supply grows with the square root of demand —
 * a topic with 100x the searches does not carry 100x the books, because the long tail of
 * a niche is written by far fewer authors — and is then scaled by how crowded the shelf
 * is. One formula for the parent topic and every related phrase, so the report's numbers
 * cannot contradict each other.
 */
function competingTitlesFor(volume: number, heat: number, jitter: number): number {
  return Math.max(40, Math.round(volume ** 0.5 * 10 ** (0.2 + heat * 1.95) * jitter));
}

function buildCompetitors(
  display: string,
  rng: Rng,
  marketHeat: number,
  marketVigor: number,
): Competitor[] {
  const patterns = shuffle(TITLE_PATTERNS, rng);
  const count = 20;
  // The strongest title's rank anchors the whole page. Vigor — how much money actually
  // moves in this market — drives it, separately from how crowded the shelf is.
  const topBsr = Math.round(10 ** (3.3 + (1 - marketVigor) * 2.3 + rng.float(-0.3, 0.3)));
  const competitors: Competitor[] = [];

  for (let i = 0; i < count; i += 1) {
    // Ranks degrade down the page, with noise so the ordering is not perfectly smooth.
    const bsr = Math.round(topBsr * (1 + i * rng.float(0.35, 0.95)) * rng.float(0.85, 1.3));
    const format: Competitor['format'] = rng.bool(0.72) ? 'ebook' : 'paperback';
    const price =
      format === 'ebook'
        ? Number(rng.pick([2.99, 3.99, 4.99, 5.99, 6.99, 7.99, 8.99, 9.99, 12.99]))
        : Number(rng.pick([11.99, 13.99, 14.99, 16.99, 18.99, 19.99, 22.99, 24.99]));
    const traditionallyPublished = rng.bool(0.06 + marketHeat * 0.42);
    // Reviews accrue with age and rank strength.
    const publishedYear = rng.int(2015, 2025);
    const age = Math.max(1, 2026 - publishedYear);
    const reviewBase = 10 ** rng.float(0.6 + marketHeat * 1.2, 2.2 + marketHeat * 2.2);
    const reviews = Math.round(reviewBase * Math.min(2.6, 0.55 + age * 0.22));
    const monthlySales = estimateMonthlySalesFromBsr(bsr, format === 'ebook' ? 'kindle' : 'print');

    competitors.push({
      rank: i + 1,
      title: patterns[i % patterns.length].replace('{Topic}', display),
      subtitle: rng.bool(0.55) ? rng.pick(SUBTITLE_PATTERNS) : undefined,
      author: `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`,
      bsr,
      price,
      format,
      reviews,
      rating: Math.round(rng.float(3.6, 4.9) * 10) / 10,
      publishedYear,
      traditionallyPublished,
      estimatedMonthlySales: monthlySales,
      estimatedMonthlyRevenue: Math.round(monthlySales * price),
      asin: asin(rng),
    });
  }

  return competitors.sort((a, b) => a.bsr - b.bsr).map((c, i) => ({ ...c, rank: i + 1 }));
}

function buildKeywords(
  normalized: string,
  rng: Rng,
  parentVolume: number,
  marketHeat: number,
): RelatedKeyword[] {
  const modifiers = shuffle(KEYWORD_MODIFIERS, rng).slice(0, rng.int(8, 12));
  return modifiers
    .map((modifier) => {
      const volume = Math.max(40, Math.round(parentVolume * rng.float(0.04, 0.42)));
      // A longer phrase is narrower than its parent, so it carries proportionally fewer
      // titles. That is what makes niching down show up as a real win in the numbers.
      const competingTitles = competingTitlesFor(
        volume,
        Math.max(0, marketHeat - 0.18),
        rng.float(0.7, 1.3),
      );
      // Opportunity rewards volume per competing title, on a log curve.
      const ratio = volume / competingTitles;
      const opportunity = Math.round(
        Math.min(98, Math.max(4, 50 + Math.log10(Math.max(ratio, 0.01)) * 38)),
      );
      return { keyword: `${normalized} ${modifier}`, monthlySearchVolume: volume, competingTitles, opportunity };
    })
    .sort((a, b) => b.monthlySearchVolume - a.monthlySearchVolume);
}

function buildCategories(rng: Rng, marketHeat: number): CategorySuggestion[] {
  const roots = shuffle(CATEGORY_ROOTS, rng).slice(0, 3);
  return roots.map((path) => ({
    path,
    bsrToTop: Math.round(10 ** rng.float(3.2 - marketHeat, 5.1 - marketHeat * 0.8)),
    competingTitles: rng.int(400, 26_000),
  }));
}

/**
 * Namespace prefixed onto every seed.
 *
 * FROZEN. This string is an input to the hash, so changing it changes every generated
 * market and therefore every score the product has ever shown. It is deliberately not
 * derived from the brand name: renaming the product must not silently re-roll the data.
 * Bump it only as a considered recalibration, alongside the engine version.
 */
const SEED_NAMESPACE = 'booksignal:v1';

/** Builds the full deterministic snapshot for a topic. */
export function generateMarketSnapshot(topic: string, retrievedAt?: string): MarketSnapshot {
  const normalized = normalizeTopic(topic);
  const rng = createRng(`${SEED_NAMESPACE}:${normalized}`);

  // Two independent 0-1 dials shape the market, drawn from separate hashes of the topic.
  //   heat  — how crowded the shelf is: title supply, review walls, publisher mix.
  //   vigor — how much money actually moves: the ranks the top titles hold.
  // Keeping them independent is what lets a quiet-but-lucrative niche exist in the data,
  // which is the exact shape of market the product is built to find.
  const marketHeat = (hashString(`heat:${normalized}`) % 1000) / 1000;
  const marketVigor = (hashString(`vigor:${normalized}`) % 997) / 997;

  const monthlySearchVolume = baseSearchVolume(normalized, rng);
  const competitors = buildCompetitors(displayTopic(topic, normalized), rng, marketHeat, marketVigor);
  const relatedKeywords = buildKeywords(normalized, rng, monthlySearchVolume, marketHeat);

  return {
    topic: topic.trim(),
    normalizedTopic: normalized,
    monthlySearchVolume,
    searchTrendPct: Math.round(rng.float(-22, 38) * 10) / 10,
    relatedKeywords,
    competitors,
    // Result counts grow sub-linearly with demand: a topic with 10x the searches does not
    // carry 10x the titles, because the long tail of a niche is written by far fewer authors.
    totalCompetingTitles: competingTitlesFor(monthlySearchVolume, marketHeat, rng.float(0.75, 1.4)),
    categories: buildCategories(rng, marketHeat),
    source: 'mock',
    // Fixed by default so the whole snapshot — and therefore the whole report — is
    // byte-for-byte reproducible. Callers pass the real time when persisting a report.
    retrievedAt: retrievedAt ?? '2026-01-01T00:00:00.000Z',
  };
}
