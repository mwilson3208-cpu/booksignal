export type Verdict = 'GO' | 'MAYBE' | 'SKIP';

export type BookFormat = 'ebook' | 'paperback' | 'audiobook';

/** A single competing title in the marketplace snapshot. */
export interface Competitor {
  rank: number;
  title: string;
  subtitle?: string;
  author: string;
  /** Amazon Best Sellers Rank in the Kindle store. */
  bsr: number;
  price: number;
  format: BookFormat;
  reviews: number;
  rating: number;
  publishedYear: number;
  /** True when the title is published by a major house rather than an indie. */
  traditionallyPublished: boolean;
  estimatedMonthlySales: number;
  estimatedMonthlyRevenue: number;
  asin: string;
}

/** Everything the scoring engine needs. Kept free of any presentation concern. */
export interface MarketSnapshot {
  topic: string;
  normalizedTopic: string;
  /** Estimated monthly Amazon searches for the topic and close variants. */
  monthlySearchVolume: number;
  /** Year-over-year change in search volume, as a percentage (e.g. 12 = +12%). */
  searchTrendPct: number;
  relatedKeywords: RelatedKeyword[];
  competitors: Competitor[];
  /** Count of titles Amazon returns for the topic phrase. */
  totalCompetingTitles: number;
  categories: CategorySuggestion[];
  source: MarketDataSource;
  retrievedAt: string;
}

export interface RelatedKeyword {
  keyword: string;
  monthlySearchVolume: number;
  competingTitles: number;
  /** 0-100, higher means easier to rank for. */
  opportunity: number;
}

export interface CategorySuggestion {
  path: string;
  /** BSR needed to reach the #1 slot in this category. */
  bsrToTop: number;
  competingTitles: number;
}

export type MarketDataSource = 'mock' | 'amazon-pa-api' | 'keyword-api';

/** One line of the visible score formula. */
export interface ScoreComponent {
  key: string;
  label: string;
  /** Human-readable raw input, e.g. "8,400 searches/mo". */
  input: string;
  /** Raw numeric input, kept for tooling and tests. */
  rawValue: number;
  /** Normalized 0-100. */
  normalized: number;
  /** Weight within its factor, 0-1. */
  weight: number;
  /** normalized * weight, rounded to 1dp. */
  contribution: number;
  explanation: string;
}

export interface ScoreFactor {
  key: 'demand' | 'competition' | 'profit';
  label: string;
  score: number;
  weight: number;
  contribution: number;
  summary: string;
  components: ScoreComponent[];
}

export interface PriceRecommendation {
  format: BookFormat;
  low: number;
  recommended: number;
  high: number;
  royaltyRate: number;
  royaltyPerSale: number;
  rationale: string;
}

export interface RevenueEstimate {
  low: number;
  mid: number;
  high: number;
  assumedMonthlyUnits: { low: number; mid: number; high: number };
  assumptions: string[];
}

export interface NicheDownSuggestion {
  topic: string;
  monthlySearchVolume: number;
  competingTitles: number;
  reason: string;
}

export interface ValidationReport {
  version: string;
  topic: string;
  normalizedTopic: string;
  score: number;
  verdict: Verdict;
  verdictReason: string;
  factors: ScoreFactor[];
  weights: { demand: number; competition: number; profit: number };
  thresholds: { go: number; maybe: number };
  market: MarketSnapshot;
  pricing: PriceRecommendation[];
  revenue: RevenueEstimate;
  nicheDown: NicheDownSuggestion[];
  generatedAt: string;
}
