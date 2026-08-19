import { createRng, titleCaseTopic, normalizeTopic } from '@/lib/market/seed';
import { generateMarketSnapshot } from '@/lib/market/mock-provider';
import { estimateMonthlySalesFromBsr } from '@/lib/scoring/bsr';

/**
 * Bestseller Analyzer — preview tool.
 *
 * Takes an Amazon product URL, extracts the ASIN, and returns the keywords the title
 * ranks for and the categories it wins. Deterministic per ASIN. Version 1 generates the
 * ranking data; the URL parsing and the shape of the result are what a live version
 * would return unchanged.
 */

export interface KeywordRanking {
  keyword: string;
  monthlySearchVolume: number;
  position: number;
  competingTitles: number;
}

export interface CategoryRanking {
  path: string;
  position: number;
  categorySize: number;
}

export interface BookAnalysis {
  asin: string;
  sourceUrl: string;
  title: string;
  author: string;
  price: number;
  bsr: number;
  reviews: number;
  rating: number;
  estimatedMonthlySales: number;
  estimatedMonthlyRevenue: number;
  keywords: KeywordRanking[];
  categories: CategoryRanking[];
}

/**
 * Pulls an ASIN out of any of the Amazon URL shapes: /dp/ASIN, /gp/product/ASIN,
 * /ASIN/ref=..., or a bare ASIN pasted on its own.
 */
export function extractAsin(input: string): string | null {
  const trimmed = input.trim();
  const bare = /^[A-Z0-9]{10}$/i;
  if (bare.test(trimmed)) return trimmed.toUpperCase();

  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
    /[?&]asin=([A-Z0-9]{10})/i,
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1].toUpperCase();
  }
  return null;
}

const TITLE_WORDS = [
  'quiet', 'daily', 'complete', 'practical', 'essential', 'simple', 'modern', 'honest',
];
const SUBJECTS = [
  'habit', 'kitchen', 'garden', 'workshop', 'ledger', 'notebook', 'compass', 'toolkit',
];
const FIRST = ['Dana', 'Marcus', 'Priya', 'Theo', 'Nadia', 'Colin', 'Rosa', 'Elliot'];
const LAST = ['Hollis', 'Baptiste', 'Warrick', 'Okafor', 'Marsh', 'Delgado', 'Bowen', 'Rhys'];

export function analyzeBook(input: string): BookAnalysis | null {
  const asin = extractAsin(input);
  if (!asin) return null;

  const rng = createRng(`analyze:${asin}`);
  const bsr = Math.round(10 ** rng.float(2.6, 5.4));
  const price = Number(rng.pick([3.99, 4.99, 6.99, 8.99, 9.99, 12.99, 14.99]));
  const monthlySales = estimateMonthlySalesFromBsr(bsr);

  const subject = rng.pick(SUBJECTS);
  const seedTopic = normalizeTopic(`${rng.pick(TITLE_WORDS)} ${subject}`);
  const snapshot = generateMarketSnapshot(seedTopic);

  const keywords: KeywordRanking[] = snapshot.relatedKeywords.slice(0, 10).map((k, i) => ({
    keyword: k.keyword,
    monthlySearchVolume: k.monthlySearchVolume,
    // A title's own strength decides how high it ranks; weaker ranks sit further down.
    position: Math.max(1, Math.round((i + 1) * rng.float(1.1, 3.4) * (bsr > 50_000 ? 2.2 : 1))),
    competingTitles: k.competingTitles,
  }));

  const categories: CategoryRanking[] = snapshot.categories.map((c) => ({
    path: c.path,
    position: Math.max(1, Math.round(rng.float(1, 60) * (bsr > 50_000 ? 4 : 1))),
    categorySize: c.competingTitles,
  }));

  return {
    asin,
    sourceUrl: input.trim(),
    title: `The ${titleCaseTopic(seedTopic)}`,
    author: `${rng.pick(FIRST)} ${rng.pick(LAST)}`,
    price,
    bsr,
    // Reviews track how hard the title sells: a top-500 book has years of accumulated
    // social proof, a book at #200,000 has a handful. Roughly 0.5% of buyers review.
    reviews: Math.max(
      3,
      Math.round(estimateMonthlySalesFromBsr(bsr) * rng.float(8, 30) * 0.005),
    ),
    rating: Math.round(rng.float(3.7, 4.9) * 10) / 10,
    estimatedMonthlySales: monthlySales,
    estimatedMonthlyRevenue: Math.round(monthlySales * price),
    keywords: keywords.sort((a, b) => a.position - b.position),
    categories: categories.sort((a, b) => a.position - b.position),
  };
}
