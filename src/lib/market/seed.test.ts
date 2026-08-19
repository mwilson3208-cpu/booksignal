import { describe, expect, it } from 'vitest';
import { createRng, shuffle, normalizeTopic, displayTopic, titleCaseTopic } from './seed';
import { generateMarketSnapshot } from './mock-provider';

describe('shuffle', () => {
  it('is a permutation that consumes a fixed number of draws', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f'];
    const rng = createRng('seed');
    const out = shuffle(items, rng);
    expect([...out].sort()).toEqual([...items].sort());
    expect(out).toHaveLength(items.length);

    // Exactly one draw per swap, so the stream position after a shuffle is predictable
    // and callers downstream of it stay reproducible.
    const a = createRng('x');
    shuffle(items, a);
    const afterShuffle = a.next();

    const b = createRng('x');
    for (let i = items.length - 1; i > 0; i -= 1) b.int(0, i);
    expect(afterShuffle).toBe(b.next());
  });

  it('gives the same permutation for the same seed', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(shuffle(items, createRng('k'))).toEqual(shuffle(items, createRng('k')));
    expect(shuffle(items, createRng('k'))).not.toEqual(shuffle(items, createRng('j')));
  });

  it('does not mutate its input', () => {
    const items = ['a', 'b', 'c'];
    shuffle(items, createRng('z'));
    expect(items).toEqual(['a', 'b', 'c']);
  });
});

/**
 * Pins the generator's exact output.
 *
 * This is the test that would have caught the engine-dependent `sort(() => rng() - 0.5)`
 * shuffle: it produced one market in Node and a different one in the browser, so the
 * same topic scored differently depending on where it ran. Any change to the seeding,
 * the draw order or the shuffle will fail here, which is the point — a recalibration
 * should be a deliberate act with the expected values updated alongside it.
 */
describe('generator golden values', () => {
  const snapshot = generateMarketSnapshot('sourdough baking');

  it('pins the market for a known topic', () => {
    expect({
      volume: snapshot.monthlySearchVolume,
      trend: snapshot.searchTrendPct,
      titles: snapshot.totalCompetingTitles,
      topCompetitor: snapshot.competitors[0].title,
      topBsr: snapshot.competitors[0].bsr,
      topPrice: snapshot.competitors[0].price,
      firstKeyword: snapshot.relatedKeywords[0].keyword,
      firstCategory: snapshot.categories[0].path,
    }).toMatchInlineSnapshot(`
      {
        "firstCategory": "Kindle Store > Kindle eBooks > Education & Teaching",
        "firstKeyword": "sourdough baking for small business",
        "titles": 5968,
        "topBsr": 9028,
        "topCompetitor": "A Beginner’s Path to Sourdough Baking",
        "topPrice": 13.99,
        "trend": 10.7,
        "volume": 9292,
      }
    `);
  });

  it('is stable across repeated construction', () => {
    expect(generateMarketSnapshot('sourdough baking')).toEqual(snapshot);
  });
});

describe('topic formatting', () => {
  it('normalizes, title-cases and preserves author capitalisation', () => {
    expect(normalizeTopic('  Sourdough,  BAKING! ')).toBe('sourdough baking');
    expect(titleCaseTopic('gut health for absolute beginners')).toBe(
      'Gut Health for Absolute Beginners',
    );
    expect(displayTopic('AI prompt engineering')).toBe('AI Prompt Engineering');
    expect(displayTopic('sourdough baking')).toBe('Sourdough Baking');
  });
});
