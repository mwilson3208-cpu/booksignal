import { createRng, normalizeTopic } from '@/lib/market/seed';
import { generateMarketSnapshot } from '@/lib/market/mock-provider';

/**
 * Niche Finder — preview tool.
 *
 * Turns questionnaire answers into ranked niche suggestions. The phrasing is assembled
 * from the user's own answers, and every suggestion's volume comes from the same market
 * generator Topic Explorer uses, so a suggestion validated later returns consistent
 * numbers. Deterministic: the same answers always produce the same shortlist.
 */

export interface NicheAnswers {
  experience: string;
  expertise: string;
  audience: string;
  format: string;
  motivation: string;
}

export interface NicheSuggestion {
  topic: string;
  monthlySearchVolume: number;
  competingTitles: number;
  fit: number;
  rationale: string;
}

export const NICHE_QUESTIONS = [
  {
    id: 'experience' as const,
    question: 'Where are you starting from?',
    help: 'This sets how narrow the suggestions should be.',
    options: [
      { value: 'first-book', label: 'This would be my first book' },
      { value: 'one-or-two', label: 'I have published one or two' },
      { value: 'catalogue', label: 'I have a catalogue and want the next one' },
    ],
  },
  {
    id: 'expertise' as const,
    question: 'What do people already come to you for?',
    help: 'Credibility is the cheapest marketing there is. Start where you have it.',
    options: [
      { value: 'health', label: 'Health, fitness or nutrition' },
      { value: 'money', label: 'Money, business or career' },
      { value: 'craft', label: 'A craft, hobby or practical skill' },
      { value: 'mind', label: 'Mindset, faith or personal growth' },
      { value: 'home', label: 'Home, family or relationships' },
      { value: 'tech', label: 'Technology or software' },
    ],
  },
  {
    id: 'audience' as const,
    question: 'Who is the book for?',
    help: 'A named reader beats a broad one every time.',
    options: [
      { value: 'beginners', label: 'Complete beginners' },
      { value: 'busy-professionals', label: 'Busy working professionals' },
      { value: 'parents', label: 'Parents' },
      { value: 'over-50', label: 'Readers over 50' },
      { value: 'small-business', label: 'Small business owners' },
      { value: 'students', label: 'Students and career changers' },
    ],
  },
  {
    id: 'format' as const,
    question: 'What shape does it want to be?',
    help: 'Format changes which keywords a book can realistically win.',
    options: [
      { value: 'guide', label: 'A how-to guide' },
      { value: 'workbook', label: 'A workbook or planner' },
      { value: 'plan', label: 'A time-boxed plan (30 days, 12 weeks)' },
      { value: 'reference', label: 'A reference or handbook' },
    ],
  },
  {
    id: 'motivation' as const,
    question: 'What are you optimising for?',
    help: 'This weights the ranking between reach and reachability.',
    options: [
      { value: 'income', label: 'Steady income from the title' },
      { value: 'authority', label: 'Authority in a field I work in' },
      { value: 'audience', label: 'Building an email list' },
    ],
  },
];

const EXPERTISE_SEEDS: Record<string, string[]> = {
  health: ['strength training', 'meal planning', 'sleep quality', 'gut health', 'walking fitness'],
  money: ['budgeting', 'side income', 'freelance pricing', 'debt payoff', 'retirement planning'],
  craft: ['woodworking', 'crochet', 'watercolour', 'bread baking', 'container gardening'],
  mind: ['habit building', 'anxiety management', 'journaling', 'grief recovery', 'daily discipline'],
  home: ['decluttering', 'meal prep', 'family routines', 'home organisation', 'couple communication'],
  tech: ['spreadsheet automation', 'ai tools', 'no-code apps', 'data literacy', 'home networking'],
};

const AUDIENCE_MODIFIERS: Record<string, string> = {
  beginners: 'for absolute beginners',
  'busy-professionals': 'for busy professionals',
  parents: 'for busy parents',
  'over-50': 'after 50',
  'small-business': 'for small business owners',
  students: 'for career changers',
};

const FORMAT_MODIFIERS: Record<string, string> = {
  guide: '',
  workbook: 'workbook',
  plan: 'in 30 days',
  reference: 'handbook',
};

export function findNiches(answers: NicheAnswers): NicheSuggestion[] {
  const seeds = EXPERTISE_SEEDS[answers.expertise] ?? EXPERTISE_SEEDS.mind;
  const audience = AUDIENCE_MODIFIERS[answers.audience] ?? '';
  const format = FORMAT_MODIFIERS[answers.format] ?? '';
  const rng = createRng(`niche:${Object.values(answers).join('|')}`);

  // A first-time author is pushed toward narrower phrases; an established one can carry
  // a broader topic on an existing readership.
  const narrowness = answers.experience === 'first-book' ? 2 : answers.experience === 'one-or-two' ? 1 : 0;
  // Income optimises for volume; authority optimises for an open shelf.
  const volumeWeight = answers.motivation === 'income' ? 0.62 : 0.38;

  const candidates: string[] = [];
  for (const seed of seeds) {
    candidates.push(normalizeTopic(`${seed} ${narrowness > 0 ? audience : ''} ${format}`));
    candidates.push(normalizeTopic(`${seed} ${narrowness > 1 ? format : audience}`));
  }

  const seen = new Set<string>();
  return candidates
    .filter((topic) => topic.length > 3 && !seen.has(topic) && seen.add(topic) !== undefined)
    .map((topic) => {
      const snapshot = generateMarketSnapshot(topic);
      const volume = snapshot.monthlySearchVolume;
      const supply = snapshot.totalCompetingTitles;
      // Fit blends reach against reachability, weighted by what the author said they want.
      const reach = Math.min(100, (Math.log10(Math.max(volume, 1)) / Math.log10(40_000)) * 100);
      const openness = Math.max(
        0,
        100 - (Math.log10(Math.max(supply, 1)) / Math.log10(9_000)) * 100,
      );
      const fit = Math.round(reach * volumeWeight + openness * (1 - volumeWeight));
      return {
        topic,
        monthlySearchVolume: volume,
        competingTitles: supply,
        fit,
        rationale:
          fit >= 65
            ? `${volume.toLocaleString('en-US')} searches a month against ${supply.toLocaleString('en-US')} titles. Strong reach for how open the shelf is.`
            : fit >= 45
              ? `Workable: ${volume.toLocaleString('en-US')} searches a month, but ${supply.toLocaleString('en-US')} titles already compete for them.`
              : `Thin on one side — ${volume.toLocaleString('en-US')} searches against ${supply.toLocaleString('en-US')} titles. Validate before committing.`,
      };
    })
    .sort((a, b) => b.fit - a.fit || rng.next() - 0.5)
    .slice(0, 8);
}
