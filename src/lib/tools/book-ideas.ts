import { createRng, normalizeTopic } from '@/lib/market/seed';
import { generateMarketSnapshot } from '@/lib/market/mock-provider';

/**
 * Book Ideas Generator — preview tool.
 *
 * Produces title candidates plus the seven backend keyword slots and two categories KDP
 * asks for, formatted for copy-paste. Deterministic per topic. All titles are assembled
 * from generic patterns and the user's own topic; none reference an existing book.
 */

export interface BookIdea {
  title: string;
  subtitle: string;
  hook: string;
  /** KDP allows exactly seven backend keyword slots. */
  backendKeywords: string[];
  categories: string[];
  estimatedSearchVolume: number;
}

const TITLE_PATTERNS = [
  { t: 'The {T} Blueprint', s: 'A step-by-step system you can start this week' },
  { t: '{T} in 30 Days', s: 'One small change a day, for one month' },
  { t: 'The Quiet Guide to {T}', s: 'For people who would rather not be shouted at' },
  { t: '{T} Without the Overwhelm', s: 'The short version, minus the theory you will never use' },
  { t: 'The {T} Handbook', s: 'Everything in one place, organised the way you will need it' },
  { t: 'From Stuck to {T}', s: 'A practical path for anyone starting from nothing' },
  { t: 'The {T} Reset', s: 'A twelve-week plan to start again properly' },
  { t: 'Small Steps to {T}', s: 'Progress that survives a bad week' },
];

const HOOKS = [
  'Opens with the mistake almost everyone makes in week one, then removes it.',
  'Structured as a plan rather than a lecture, so the reader can start before finishing.',
  'Aimed squarely at the reader who has already tried once and stopped.',
  'Every chapter ends with one action small enough to actually do.',
  'Written for the reader with forty minutes a week, not four hours a day.',
];

function titleCase(input: string) {
  return input
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function generateBookIdeas(topic: string, count = 6): BookIdea[] {
  const normalized = normalizeTopic(topic);
  const display = titleCase(normalized);
  const rng = createRng(`ideas:${normalized}`);
  const snapshot = generateMarketSnapshot(normalized);

  const patterns = [...TITLE_PATTERNS].sort(() => rng.next() - 0.5).slice(0, count);

  return patterns.map((pattern, i) => {
    // Seven slots: the topic itself, then the highest-volume related phrases.
    const keywords = [
      normalized,
      ...snapshot.relatedKeywords.slice(i, i + 6).map((k) => k.keyword),
    ].slice(0, 7);

    return {
      title: pattern.t.replace('{T}', display),
      subtitle: pattern.s,
      hook: rng.pick(HOOKS),
      backendKeywords: keywords,
      categories: snapshot.categories.slice(0, 2).map((c) => c.path),
      estimatedSearchVolume: snapshot.monthlySearchVolume,
    };
  });
}
