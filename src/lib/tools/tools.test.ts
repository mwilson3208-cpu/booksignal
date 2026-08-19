import { describe, expect, it } from 'vitest';
import { extractAsin, analyzeBook } from './bestseller-analyzer';
import { findNiches } from './niche-finder';
import { generateBookIdeas } from './book-ideas';
import { buildSeries } from './series-builder';

describe('bestseller analyzer', () => {
  it('extracts an ASIN from every common Amazon URL shape', () => {
    const cases: [string, string | null][] = [
      ['https://www.amazon.com/dp/B08XYZ1234', 'B08XYZ1234'],
      ['https://www.amazon.co.uk/gp/product/B01ABCDEFG/ref=x', 'B01ABCDEFG'],
      ['https://amazon.com/Some-Title-Here/dp/B0CDEFGHIJ/ref=sr_1_1?crid=x', 'B0CDEFGHIJ'],
      ['https://www.amazon.com/gp/aw/d/B0ABCDEFGH', 'B0ABCDEFGH'],
      ['B08XYZ1234', 'B08XYZ1234'],
      ['b08xyz1234', 'B08XYZ1234'],
      ['https://example.com/not-a-book', null],
      ['', null],
    ];
    for (const [input, expected] of cases) {
      expect(extractAsin(input), input).toBe(expected);
    }
  });

  it('returns a deterministic analysis for the same ASIN', () => {
    const a = analyzeBook('https://www.amazon.com/dp/B08XYZ1234');
    const b = analyzeBook('B08XYZ1234');
    expect(a).toEqual({ ...b!, sourceUrl: a!.sourceUrl });
    expect(a!.keywords.length).toBeGreaterThan(5);
    expect(a!.categories.length).toBeGreaterThan(0);
  });

  it('returns null for anything that is not a book URL', () => {
    expect(analyzeBook('hello world')).toBeNull();
  });
});

describe('niche finder', () => {
  const answers = {
    experience: 'first-book',
    expertise: 'health',
    audience: 'over-50',
    format: 'plan',
    motivation: 'income',
  };

  it('is deterministic and ranked by fit', () => {
    const a = findNiches(answers);
    const b = findNiches(answers);
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThanOrEqual(5);
    for (let i = 1; i < a.length; i += 1) expect(a[i - 1].fit).toBeGreaterThanOrEqual(a[i].fit);
  });

  it('returns distinct topics', () => {
    const topics = findNiches(answers).map((n) => n.topic);
    expect(new Set(topics).size).toBe(topics.length);
  });

  it('changes the shortlist when the answers change', () => {
    const other = findNiches({ ...answers, expertise: 'tech' });
    expect(other[0].topic).not.toBe(findNiches(answers)[0].topic);
  });
});

describe('book ideas', () => {
  it('gives every idea exactly seven backend keywords and two categories', () => {
    for (const idea of generateBookIdeas('sourdough baking')) {
      expect(idea.backendKeywords).toHaveLength(7);
      expect(idea.categories).toHaveLength(2);
      expect(idea.title).toContain('Sourdough Baking');
    }
  });

  it('is deterministic', () => {
    expect(generateBookIdeas('sourdough baking')).toEqual(generateBookIdeas('Sourdough  Baking!'));
  });
});

describe('series builder', () => {
  it('clamps the series to 3-5 books and always keeps the opener and the reference volume', () => {
    for (const [requested, expected] of [
      [1, 3],
      [3, 3],
      [4, 4],
      [5, 5],
      [9, 5],
    ] as const) {
      const series = buildSeries('sourdough baking', requested);
      expect(series).toHaveLength(expected);
      expect(series[0].workingTitle).toContain('The Starting Point');
      expect(series[series.length - 1].workingTitle).toContain('The Complete Handbook');
      expect(series.map((b) => b.position)).toEqual(
        Array.from({ length: expected }, (_, i) => i + 1),
      );
    }
  });

  it('is deterministic', () => {
    expect(buildSeries('stoicism', 4)).toEqual(buildSeries('stoicism', 4));
  });
});
