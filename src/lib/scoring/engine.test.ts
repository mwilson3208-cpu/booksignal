import { describe, expect, it } from 'vitest';
import { generateMarketSnapshot } from '@/lib/market/mock-provider';
import { scoreTopic, verdictFor, VERDICT_THRESHOLDS, FACTOR_WEIGHTS } from './engine';
import { estimateBsrFromDailySales, estimateDailySalesFromBsr, royaltyPerSale } from './bsr';
import { logScale, linearScale, median, roundToPricePoint } from './math';

const TOPICS = [
  'sourdough baking',
  'intermittent fasting for women over 40',
  'quantum field theory for cats',
  'beekeeping',
  'ai prompt engineering',
  'watercolour for beginners',
];

describe('determinism', () => {
  it('returns an identical snapshot for the same topic', () => {
    for (const topic of TOPICS) {
      const a = generateMarketSnapshot(topic);
      const b = generateMarketSnapshot(topic);
      expect(a).toEqual(b);
    }
  });

  it('returns an identical report for the same topic across runs', () => {
    for (const topic of TOPICS) {
      const a = scoreTopic(generateMarketSnapshot(topic), '2026-01-01T00:00:00.000Z');
      const b = scoreTopic(generateMarketSnapshot(topic), '2026-01-01T00:00:00.000Z');
      expect(a).toEqual(b);
      expect(a.score).toBe(b.score);
      expect(a.verdict).toBe(b.verdict);
    }
  });

  it('ignores case, punctuation and surrounding whitespace', () => {
    const a = scoreTopic(generateMarketSnapshot('Sourdough Baking'), 'x');
    const b = scoreTopic(generateMarketSnapshot('  sourdough, baking!  '), 'x');
    expect(a.score).toBe(b.score);
    expect(a.factors).toEqual(b.factors);
  });

  it('gives different topics different snapshots', () => {
    const scores = new Set(TOPICS.map((t) => JSON.stringify(generateMarketSnapshot(t))));
    expect(scores.size).toBe(TOPICS.length);
  });
});

describe('score composition', () => {
  it('weights sum to 1', () => {
    const total = FACTOR_WEIGHTS.demand + FACTOR_WEIGHTS.competition + FACTOR_WEIGHTS.profit;
    expect(total).toBeCloseTo(1, 10);
  });

  it('every factor component set has weights summing to 1', () => {
    const report = scoreTopic(generateMarketSnapshot('sourdough baking'));
    for (const factor of report.factors) {
      const sum = factor.components.reduce((acc, c) => acc + c.weight, 0);
      expect(sum).toBeCloseTo(1, 10);
    }
  });

  it('the headline score equals the weighted sum of the factor scores', () => {
    for (const topic of TOPICS) {
      const report = scoreTopic(generateMarketSnapshot(topic));
      const recomputed = Math.round(
        report.factors.reduce((sum, f) => sum + f.score * f.weight, 0),
      );
      expect(report.score).toBe(recomputed);
    }
  });

  it('each factor score equals the weighted sum of its components', () => {
    const report = scoreTopic(generateMarketSnapshot('beekeeping'));
    for (const factor of report.factors) {
      const recomputed = factor.components.reduce((sum, c) => sum + c.normalized * c.weight, 0);
      expect(factor.score).toBeCloseTo(recomputed, 1);
    }
  });

  it('keeps every score inside 0-100', () => {
    for (const topic of TOPICS) {
      const report = scoreTopic(generateMarketSnapshot(topic));
      expect(report.score).toBeGreaterThanOrEqual(0);
      expect(report.score).toBeLessThanOrEqual(100);
      for (const factor of report.factors) {
        expect(factor.score).toBeGreaterThanOrEqual(0);
        expect(factor.score).toBeLessThanOrEqual(100);
        for (const c of factor.components) {
          expect(c.normalized).toBeGreaterThanOrEqual(0);
          expect(c.normalized).toBeLessThanOrEqual(100);
        }
      }
    }
  });
});

describe('verdict rules', () => {
  it('maps the score bands to verdicts', () => {
    expect(verdictFor(85, 80, 70).verdict).toBe('GO');
    expect(verdictFor(VERDICT_THRESHOLDS.go, 80, 70).verdict).toBe('GO');
    expect(verdictFor(60, 60, 60).verdict).toBe('MAYBE');
    expect(verdictFor(VERDICT_THRESHOLDS.maybe, 60, 60).verdict).toBe('MAYBE');
    expect(verdictFor(30, 40, 60).verdict).toBe('SKIP');
  });

  it('blocks a GO when demand is below the minimum', () => {
    const result = verdictFor(80, 40, 90);
    expect(result.verdict).toBe('MAYBE');
    expect(result.reason).toContain('demand');
  });

  it('blocks a GO when the competition wall is too high', () => {
    const result = verdictFor(80, 90, 20);
    expect(result.verdict).toBe('MAYBE');
    expect(result.reason).toContain('competition');
  });

  it('forces a SKIP below the demand floor whatever the total', () => {
    expect(verdictFor(95, 10, 95).verdict).toBe('SKIP');
  });

  it('always explains itself', () => {
    for (const topic of TOPICS) {
      const report = scoreTopic(generateMarketSnapshot(topic));
      expect(report.verdictReason.length).toBeGreaterThan(20);
    }
  });
});

describe('pricing and revenue', () => {
  it('recommends all three formats with a low < recommended < high spread', () => {
    const report = scoreTopic(generateMarketSnapshot('sourdough baking'));
    expect(report.pricing.map((p) => p.format)).toEqual(['ebook', 'paperback', 'audiobook']);
    for (const p of report.pricing) {
      expect(p.low).toBeLessThan(p.recommended);
      expect(p.recommended).toBeLessThan(p.high);
      expect(p.royaltyPerSale).toBeGreaterThan(0);
    }
  });

  it('keeps the recommended ebook price inside the 70% royalty band', () => {
    for (const topic of TOPICS) {
      const report = scoreTopic(generateMarketSnapshot(topic));
      const ebook = report.pricing.find((p) => p.format === 'ebook')!;
      expect(ebook.recommended).toBeGreaterThanOrEqual(2.99);
      expect(ebook.recommended).toBeLessThanOrEqual(9.99);
      expect(ebook.royaltyRate).toBe(0.7);
    }
  });

  it('orders the revenue range low <= mid <= high', () => {
    for (const topic of TOPICS) {
      const { revenue } = scoreTopic(generateMarketSnapshot(topic));
      expect(revenue.low).toBeLessThanOrEqual(revenue.mid);
      expect(revenue.mid).toBeLessThanOrEqual(revenue.high);
      expect(revenue.assumptions.length).toBeGreaterThan(2);
    }
  });

  it('nets printing costs out of the paperback royalty', () => {
    expect(royaltyPerSale(14.99, 'paperback', 220)).toBeCloseTo(14.99 * 0.6 - (1 + 0.012 * 220), 2);
  });
});

describe('BSR curve', () => {
  it('is monotonic: a better rank never sells less', () => {
    let previous = Number.POSITIVE_INFINITY;
    for (const bsr of [1, 10, 50, 100, 500, 1_000, 5_000, 10_000, 50_000, 100_000, 500_000, 2_000_000]) {
      const sales = estimateDailySalesFromBsr(bsr);
      expect(sales).toBeLessThanOrEqual(previous);
      previous = sales;
    }
  });

  it('round-trips through the inverse within one band', () => {
    for (const bsr of [500, 5_000, 40_000, 250_000]) {
      const daily = estimateDailySalesFromBsr(bsr);
      const recovered = estimateBsrFromDailySales(daily);
      expect(Math.abs(Math.log10(recovered) - Math.log10(bsr))).toBeLessThan(0.2);
    }
  });

  it('estimates print lower than kindle at the same rank', () => {
    expect(estimateDailySalesFromBsr(5_000, 'print')).toBeLessThan(
      estimateDailySalesFromBsr(5_000, 'kindle'),
    );
  });
});

describe('scale helpers', () => {
  it('clamps log scale at both ends', () => {
    expect(logScale(10, 250, 60_000)).toBe(0);
    expect(logScale(500_000, 250, 60_000)).toBe(100);
  });

  it('inverts when the endpoints are reversed', () => {
    expect(logScale(15, 6_000, 15)).toBe(100);
    expect(logScale(6_000, 6_000, 15)).toBe(0);
  });

  it('handles linear scale and median', () => {
    expect(linearScale(0, -25, 35)).toBeCloseTo(41.67, 1);
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 2, 3])).toBe(2.5);
    expect(median([])).toBe(0);
  });

  it('snaps prices to book price points', () => {
    expect(roundToPricePoint(6.8)).toBe(6.99);
    expect(roundToPricePoint(6.3)).toBe(6.49);
    expect(roundToPricePoint(6.1)).toBe(5.99);
  });
});

describe('niche-down suggestions', () => {
  it('only appears when the market is crowded, and never repeats the parent topic', () => {
    for (const topic of TOPICS) {
      const report = scoreTopic(generateMarketSnapshot(topic));
      const competition = report.factors.find((f) => f.key === 'competition')!;
      if (competition.score >= 65) {
        expect(report.nicheDown).toHaveLength(0);
      }
      for (const suggestion of report.nicheDown) {
        expect(suggestion.topic).not.toBe(report.normalizedTopic);
        expect(suggestion.reason.length).toBeGreaterThan(10);
      }
    }
  });
});

describe('generated titles', () => {
  it('keeps author-supplied capitalisation and drops punctuation', () => {
    const acronym = generateMarketSnapshot('AI prompt engineering');
    for (const competitor of acronym.competitors) {
      expect(competitor.title).toContain('AI Prompt Engineering');
      expect(competitor.title).not.toContain('Ai Prompt');
    }

    const messy = generateMarketSnapshot('  sourdough, baking!  ');
    const clean = generateMarketSnapshot('Sourdough Baking');
    expect(messy.competitors.map((c) => c.title)).toEqual(clean.competitors.map((c) => c.title));
  });

  it('keeps competing-title counts internally consistent', () => {
    for (const topic of TOPICS) {
      const snapshot = generateMarketSnapshot(topic);
      for (const keyword of snapshot.relatedKeywords) {
        // A narrower phrase must never look more crowded than its own parent topic.
        expect(keyword.competingTitles).toBeLessThanOrEqual(snapshot.totalCompetingTitles);
      }
    }
  });
});
