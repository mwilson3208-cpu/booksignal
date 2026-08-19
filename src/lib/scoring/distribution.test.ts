import { describe, expect, it } from 'vitest';
import { generateMarketSnapshot } from '@/lib/market/mock-provider';
import { scoreTopic } from './engine';

/**
 * Guards the calibration of the engine and the sample-data generator together. If a
 * change collapses every topic into one verdict, or pins a factor to one end of its
 * range, this fails.
 */
const CORPUS = [
  'sourdough baking', 'intermittent fasting', 'beekeeping for beginners', 'ai prompt engineering',
  'crochet amigurumi', 'stoicism', 'budgeting for couples', 'vegan meal prep',
  'watercolor landscapes', 'toddler sleep training', 'anxiety journal', 'home coffee roasting',
  'sales cold calling', 'quantum computing', 'mushroom foraging', 'minimalist wardrobe',
  'python for kids', 'trail running', 'divorce recovery', 'airbnb hosting', 'notion templates',
  'grief after loss', 'keto over 50', 'guitar fingerstyle', 'urban gardening',
];

const reports = CORPUS.map((topic) => scoreTopic(generateMarketSnapshot(topic)));

describe('calibration', () => {
  it('produces all three verdicts across a realistic corpus', () => {
    const verdicts = new Set(reports.map((r) => r.verdict));
    expect(verdicts).toEqual(new Set(['GO', 'MAYBE', 'SKIP']));
  });

  it('spreads the headline score across a wide band', () => {
    const scores = reports.map((r) => r.score);
    expect(Math.min(...scores)).toBeLessThan(45);
    expect(Math.max(...scores)).toBeGreaterThan(70);
  });

  it('leaves no factor pinned to one end of its range', () => {
    for (const key of ['demand', 'competition', 'profit'] as const) {
      const values = reports.map((r) => r.factors.find((f) => f.key === key)!.score);
      expect(Math.min(...values)).toBeLessThan(45);
      expect(Math.max(...values)).toBeGreaterThan(60);
    }
  });

  it('always returns at least ten competitors and a full pricing table', () => {
    for (const report of reports) {
      expect(report.market.competitors.length).toBeGreaterThanOrEqual(10);
      expect(report.pricing).toHaveLength(3);
      expect(report.market.relatedKeywords.length).toBeGreaterThanOrEqual(8);
    }
  });
});
