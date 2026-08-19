import type {
  MarketSnapshot,
  NicheDownSuggestion,
  PriceRecommendation,
  RevenueEstimate,
  ScoreComponent,
  ScoreFactor,
  ValidationReport,
  Verdict,
} from '@/lib/types';
import { estimateMonthlySalesFromBsr, royaltyPerSale, royaltyRate } from './bsr';
import { clamp, linearScale, logScale, median, round, roundToPricePoint } from './math';

/**
 * Book Demand Lab scoring engine, v1.
 *
 * Fully deterministic: the score is a pure function of the market snapshot. No model
 * call, no randomness, no clock. The same snapshot always produces the same number,
 * and every component below is surfaced in the UI so the number can be audited.
 */
export const SCORING_VERSION = '1.0.0';

export const FACTOR_WEIGHTS = { demand: 0.4, competition: 0.35, profit: 0.25 } as const;

export const VERDICT_THRESHOLDS = { go: 70, maybe: 45 } as const;

/** A market needs at least this much demand to clear a GO regardless of the total. */
const MIN_DEMAND_FOR_GO = 50;
/** A wall this high blocks a GO even when demand and profit look excellent. */
const MIN_COMPETITION_FOR_GO = 35;
/** Below this much demand nothing else can rescue the topic. */
const DEMAND_FLOOR = 22;

function component(
  key: string,
  label: string,
  rawValue: number,
  input: string,
  normalized: number,
  weight: number,
  explanation: string,
): ScoreComponent {
  const n = round(clamp(normalized), 1);
  return {
    key,
    label,
    rawValue,
    input,
    normalized: n,
    weight,
    contribution: round(n * weight, 1),
    explanation,
  };
}

function rollUp(components: ScoreComponent[]): number {
  return round(
    components.reduce((sum, c) => sum + c.normalized * c.weight, 0),
    1,
  );
}

/* -------------------------------------------------------------------------- */
/* Demand                                                                     */
/* -------------------------------------------------------------------------- */

function demandFactor(market: MarketSnapshot): ScoreFactor {
  const volume = market.monthlySearchVolume;
  const trend = market.searchTrendPct;
  const breadth = market.relatedKeywords.reduce((sum, k) => sum + k.monthlySearchVolume, 0);

  const components = [
    component(
      'search_volume',
      'Monthly search volume',
      volume,
      `${volume.toLocaleString('en-US')} searches/mo`,
      // 150 searches/mo scores 0; 40,000 scores 100. Log scale, because demand is
      // distributed across orders of magnitude.
      logScale(volume, 150, 40_000),
      0.6,
      'How many people search Amazon for this topic each month, on a log curve from 150 to 40,000.',
    ),
    component(
      'keyword_breadth',
      'Related keyword pool',
      breadth,
      `${breadth.toLocaleString('en-US')} searches/mo across ${market.relatedKeywords.length} phrases`,
      logScale(breadth, 400, 90_000),
      0.25,
      'Total volume across adjacent phrases. Broad pools give a book more than one way to be found.',
    ),
    component(
      'search_trend',
      'Year-over-year trend',
      trend,
      `${trend > 0 ? '+' : ''}${round(trend, 1)}% YoY`,
      // -25% scores 0, +35% scores 100, flat sits near 42.
      linearScale(trend, -25, 35),
      0.15,
      'Direction of travel. A rising topic is worth more than a flat one of the same size.',
    ),
  ];

  const score = rollUp(components);
  return {
    key: 'demand',
    label: 'Demand',
    score,
    weight: FACTOR_WEIGHTS.demand,
    contribution: round(score * FACTOR_WEIGHTS.demand, 1),
    summary:
      score >= 70
        ? 'Plenty of readers are already looking for this.'
        : score >= 45
          ? 'Real but modest search demand. Enough for a focused book, not a broad one.'
          : 'Very few people search for this. A book here has to create its own audience.',
    components,
  };
}

/* -------------------------------------------------------------------------- */
/* Competition — higher score means an easier market to enter                  */
/* -------------------------------------------------------------------------- */

function competitionFactor(market: MarketSnapshot): ScoreFactor {
  const top = market.competitors.slice(0, 10);
  const medianReviews = median(top.map((c) => c.reviews));
  const medianBsr = median(top.map((c) => c.bsr));
  const tradShare = top.length
    ? top.filter((c) => c.traditionallyPublished).length / top.length
    : 0;
  const supply = market.totalCompetingTitles;

  const components = [
    component(
      'review_wall',
      'Review wall',
      medianReviews,
      `${Math.round(medianReviews).toLocaleString('en-US')} median reviews in the top 10`,
      // 15 reviews scores 100 (open field), 6,000 scores 0 (entrenched).
      logScale(medianReviews, 6_000, 15),
      0.35,
      'Social proof a new title has to out-run. Inverted: fewer reviews scores higher.',
    ),
    component(
      'rank_wall',
      'Rank wall',
      medianBsr,
      `#${Math.round(medianBsr).toLocaleString('en-US')} median BSR in the top 10`,
      // BSR 2,000 scores 0 (page-one titles selling hard), 300,000 scores 100.
      logScale(medianBsr, 2_000, 300_000),
      0.2,
      'How hard the incumbents are actually selling. Inverted: weaker ranks score higher.',
    ),
    component(
      'title_supply',
      'Competing titles',
      supply,
      `${supply.toLocaleString('en-US')} titles match this phrase`,
      // 60 titles scores 100, 9,000 scores 0.
      logScale(supply, 9_000, 60),
      0.3,
      'Shelf crowding. Inverted: a thinner shelf scores higher.',
    ),
    component(
      'publisher_mix',
      'Publisher mix',
      round(tradShare * 100, 0),
      `${Math.round(tradShare * 100)}% of the top 10 are traditionally published`,
      // 0% trad scores 100, 80%+ scores 0. Big houses buy placement indies cannot.
      linearScale(tradShare * 100, 80, 0),
      0.15,
      'Share of page-one titles from major houses. Inverted: an indie-held page scores higher.',
    ),
  ];

  const score = rollUp(components);
  return {
    key: 'competition',
    label: 'Competition',
    score,
    weight: FACTOR_WEIGHTS.competition,
    contribution: round(score * FACTOR_WEIGHTS.competition, 1),
    summary:
      score >= 70
        ? 'The first page is winnable for a well-made indie title.'
        : score >= 45
          ? 'Beatable, but only with a sharper angle than what is already there.'
          : 'Entrenched incumbents. Breaking in costs more than most first books can spend.',
    components,
  };
}

/* -------------------------------------------------------------------------- */
/* Profit                                                                     */
/* -------------------------------------------------------------------------- */

/** Price health peaks in the $6.99-$14.99 band where the 70% ebook royalty still applies. */
function priceHealthScore(price: number): number {
  if (price <= 0) return 0;
  if (price < 2.99) return clamp(linearScale(price, 0, 2.99) * 0.35);
  if (price < 6.99) return clamp(35 + linearScale(price, 2.99, 6.99) * 0.55);
  if (price <= 14.99) return clamp(90 + linearScale(price, 6.99, 14.99) * 0.1);
  if (price <= 24.99) return clamp(100 - linearScale(price, 14.99, 24.99) * 0.25);
  return 70;
}

function profitFactor(market: MarketSnapshot): ScoreFactor {
  const top = market.competitors.slice(0, 10);
  const medianPrice = median(top.map((c) => c.price));
  const medianUnits = median(top.map((c) => c.estimatedMonthlySales));
  const medianRevenue = median(top.map((c) => c.estimatedMonthlyRevenue));

  const components = [
    component(
      'price_health',
      'Price ceiling',
      medianPrice,
      `$${medianPrice.toFixed(2)} median list price`,
      priceHealthScore(medianPrice),
      0.35,
      'What readers already pay here. Peaks in the $6.99-$14.99 band where the 70% ebook royalty applies.',
    ),
    component(
      'sales_velocity',
      'Sales velocity',
      medianUnits,
      `${Math.round(medianUnits).toLocaleString('en-US')} median units/mo in the top 10`,
      // 15 units/mo scores 0, 1,800 scores 100.
      logScale(medianUnits, 15, 1_800),
      0.4,
      'Units the incumbents move each month, derived from their rank. Volume, not just price.',
    ),
    component(
      'revenue_pool',
      'Revenue pool',
      medianRevenue,
      `$${Math.round(medianRevenue).toLocaleString('en-US')} median gross/mo per title`,
      logScale(medianRevenue, 150, 20_000),
      0.25,
      'Gross monthly revenue of a median page-one title. The size of the pie you are cutting into.',
    ),
  ];

  const score = rollUp(components);
  return {
    key: 'profit',
    label: 'Profit potential',
    score,
    weight: FACTOR_WEIGHTS.profit,
    contribution: round(score * FACTOR_WEIGHTS.profit, 1),
    summary:
      score >= 70
        ? 'Prices and volume both support a real income from one title.'
        : score >= 45
          ? 'Workable economics. Expect a supporting income, not a full one.'
          : 'Thin margins here. Low prices, low volume, or both.',
    components,
  };
}

/* -------------------------------------------------------------------------- */
/* Verdict                                                                    */
/* -------------------------------------------------------------------------- */

export function verdictFor(
  score: number,
  demand: number,
  competition: number,
): { verdict: Verdict; reason: string } {
  if (demand < DEMAND_FLOOR) {
    return {
      verdict: 'SKIP',
      reason: `Demand scores ${round(demand, 1)}, below the ${DEMAND_FLOOR}-point floor. Too few readers are searching for this to support a title, whatever the rest of the numbers say.`,
    };
  }
  if (score >= VERDICT_THRESHOLDS.go) {
    if (demand < MIN_DEMAND_FOR_GO) {
      return {
        verdict: 'MAYBE',
        reason: `The total of ${score} clears the GO line, but demand only scores ${round(demand, 1)} against a ${MIN_DEMAND_FOR_GO}-point minimum. An open market nobody is searching is still a gamble.`,
      };
    }
    if (competition < MIN_COMPETITION_FOR_GO) {
      return {
        verdict: 'MAYBE',
        reason: `The total of ${score} clears the GO line, but competition only scores ${round(competition, 1)} against a ${MIN_COMPETITION_FOR_GO}-point minimum. Niche down before you commit.`,
      };
    }
    return {
      verdict: 'GO',
      reason: `A total of ${score} clears the ${VERDICT_THRESHOLDS.go}-point GO line with demand at ${round(demand, 1)} and competition at ${round(competition, 1)}. Write it.`,
    };
  }
  if (score >= VERDICT_THRESHOLDS.maybe) {
    return {
      verdict: 'MAYBE',
      reason: `A total of ${score} sits between the ${VERDICT_THRESHOLDS.maybe}-point and ${VERDICT_THRESHOLDS.go}-point lines. Viable with a sharper angle. Check the niche-down suggestions below.`,
    };
  }
  return {
    verdict: 'SKIP',
    reason: `A total of ${score} falls below the ${VERDICT_THRESHOLDS.maybe}-point line. The demand, competition and profit numbers do not add up to a book worth the months it would take.`,
  };
}

/* -------------------------------------------------------------------------- */
/* Pricing and revenue                                                        */
/* -------------------------------------------------------------------------- */

export function recommendPricing(market: MarketSnapshot): PriceRecommendation[] {
  const top = market.competitors.slice(0, 10);
  const medianPrice = median(top.map((c) => c.price)) || 6.99;

  // Anchor the ebook just under the market median so the title reads as the value pick,
  // while staying inside the 70% royalty band wherever possible.
  const ebookTarget = clamp(medianPrice * 0.92, 2.99, 9.99);
  const ebook = roundToPricePoint(ebookTarget);
  const paperback = roundToPricePoint(clamp(ebook * 2.1 + 3, 9.99, 34.99));
  const audiobook = roundToPricePoint(clamp(ebook * 2.6 + 4, 9.99, 39.99));

  const build = (
    format: 'ebook' | 'paperback' | 'audiobook',
    recommended: number,
    lowMult: number,
    highMult: number,
    rationale: string,
  ): PriceRecommendation => ({
    format,
    low: roundToPricePoint(recommended * lowMult),
    recommended,
    high: roundToPricePoint(recommended * highMult),
    royaltyRate: royaltyRate(recommended, format),
    royaltyPerSale: royaltyPerSale(recommended, format),
    rationale,
  });

  return [
    build(
      'ebook',
      ebook,
      0.72,
      1.28,
      `Median list price in this market is $${medianPrice.toFixed(2)}. Pricing just under it reads as the value pick while staying in the 70% royalty band.`,
    ),
    build(
      'paperback',
      paperback,
      0.85,
      1.2,
      'Print sits at roughly 2x the ebook plus a print-cost buffer, which is where paperback conversion holds up in non-fiction.',
    ),
    build(
      'audiobook',
      audiobook,
      0.85,
      1.25,
      'Audio buyers are the least price-sensitive segment. Anchor above print and let retailer promotions discount from there.',
    ),
  ];
}

export function estimateRevenue(
  market: MarketSnapshot,
  score: number,
  pricing: PriceRecommendation[],
): RevenueEstimate {
  const ebook = pricing.find((p) => p.format === 'ebook')!;
  const top = market.competitors.slice(0, 10);
  const medianUnits = median(top.map((c) => c.estimatedMonthlySales)) || 30;

  // A new title is modelled as reaching a share of a median page-one title's volume,
  // scaled by the overall score. A 40-point topic lands near 12% of median; a 90-point
  // topic near 45%. Deliberately conservative — these are month 6-12 figures.
  const captureMid = clamp(0.06 + (score / 100) * 0.42, 0.05, 0.5);
  const units = {
    low: Math.max(3, Math.round(medianUnits * captureMid * 0.4)),
    mid: Math.max(8, Math.round(medianUnits * captureMid)),
    high: Math.max(15, Math.round(medianUnits * captureMid * 2.1)),
  };

  const perUnit = ebook.royaltyPerSale;
  return {
    low: Math.round(units.low * perUnit),
    mid: Math.round(units.mid * perUnit),
    high: Math.round(units.high * perUnit),
    assumedMonthlyUnits: units,
    assumptions: [
      `Ebook priced at $${ebook.recommended.toFixed(2)}, returning $${perUnit.toFixed(2)} per sale after the ${Math.round(ebook.royaltyRate * 100)}% royalty and delivery fee.`,
      `A median page-one title in this market moves about ${Math.round(medianUnits).toLocaleString('en-US')} units per month.`,
      `A new title is modelled at ${Math.round(captureMid * 100)}% of that volume, scaled by the ${score}-point score.`,
      'Ebook royalties only. Print and audio are upside on top of this range.',
      'Steady state at month 6-12, assuming a complete listing and a working keyword set.',
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* Niche-down                                                                 */
/* -------------------------------------------------------------------------- */

export function nicheDownSuggestions(
  market: MarketSnapshot,
  competitionScore: number,
): NicheDownSuggestion[] {
  // Only worth surfacing when the shelf is genuinely crowded.
  if (competitionScore >= 65) return [];
  return market.relatedKeywords
    .filter((k) => k.opportunity > 45 && k.monthlySearchVolume >= 250)
    .sort((a, b) => b.opportunity - a.opportunity)
    .slice(0, 5)
    .map((k) => ({
      topic: k.keyword,
      monthlySearchVolume: k.monthlySearchVolume,
      competingTitles: k.competingTitles,
      reason: `${k.monthlySearchVolume.toLocaleString('en-US')} searches/mo against only ${k.competingTitles.toLocaleString('en-US')} titles — a thinner shelf than the parent topic.`,
    }));
}

/* -------------------------------------------------------------------------- */
/* Entry point                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Scores a market snapshot. Pure: no I/O, no randomness, no clock reads beyond the
 * `generatedAt` stamp the caller may override for reproducible tests.
 */
export function scoreTopic(market: MarketSnapshot, generatedAt?: string): ValidationReport {
  const demand = demandFactor(market);
  const competition = competitionFactor(market);
  const profit = profitFactor(market);
  const factors = [demand, competition, profit];

  const score = Math.round(factors.reduce((sum, f) => sum + f.score * f.weight, 0));
  const { verdict, reason } = verdictFor(score, demand.score, competition.score);
  const pricing = recommendPricing(market);

  return {
    version: SCORING_VERSION,
    topic: market.topic,
    normalizedTopic: market.normalizedTopic,
    score,
    verdict,
    verdictReason: reason,
    factors,
    weights: { ...FACTOR_WEIGHTS },
    thresholds: { ...VERDICT_THRESHOLDS },
    market,
    pricing,
    revenue: estimateRevenue(market, score, pricing),
    nicheDown: nicheDownSuggestions(market, competition.score),
    generatedAt: generatedAt ?? market.retrievedAt,
  };
}

export { estimateMonthlySalesFromBsr };
