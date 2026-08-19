import { createRng, normalizeTopic } from '@/lib/market/seed';
import { generateMarketSnapshot } from '@/lib/market/mock-provider';

/**
 * Series Builder — preview tool.
 *
 * Expands one validated topic into a staged series. The arc is fixed — foundation,
 * practice, depth, application, mastery — because that progression is what makes a reader
 * who finished book one buy book two. Deterministic per topic and length.
 */

export interface SeriesBook {
  position: number;
  workingTitle: string;
  hook: string;
  targetReader: string;
  estimatedSearchVolume: number;
}

const ARC = [
  {
    stage: 'The foundation',
    titleSuffix: 'The Starting Point',
    reader: 'Has decided to begin and wants to know that the first step is the right one.',
    hook: 'Removes the decisions a beginner should not have to make, and gets them moving in week one.',
  },
  {
    stage: 'The practice',
    titleSuffix: 'The Daily Practice',
    reader: 'Started, saw early results, and now needs the habit to survive a bad month.',
    hook: 'Turns the initial burst into a routine that holds when motivation runs out.',
  },
  {
    stage: 'The depth',
    titleSuffix: 'Going Deeper',
    reader: 'Competent at the basics and frustrated by a plateau they cannot name.',
    hook: 'Names the plateau, explains why it happens, and gives the intermediate techniques that break it.',
  },
  {
    stage: 'The application',
    titleSuffix: 'In the Real World',
    reader: 'Wants to apply the skill under real constraints — a job, a family, a budget.',
    hook: 'Case-driven. Every chapter is a situation the reader will recognise, worked through end to end.',
  },
  {
    stage: 'The mastery',
    titleSuffix: 'The Complete Handbook',
    reader: 'Owns the earlier books and wants the single reference to keep on the shelf.',
    hook: 'The reference volume. Consolidates the series and gives the reader something to return to.',
  },
];

function titleCase(input: string) {
  return input
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function buildSeries(topic: string, length = 4): SeriesBook[] {
  const normalized = normalizeTopic(topic);
  const display = titleCase(normalized);
  const rng = createRng(`series:${normalized}:${length}`);
  const clamped = Math.min(5, Math.max(3, length));

  // Always keep the foundation and the final volume; drop from the middle when shorter.
  const stages =
    clamped === 5
      ? ARC
      : clamped === 4
        ? [ARC[0], ARC[1], ARC[3], ARC[4]]
        : [ARC[0], ARC[2], ARC[4]];

  return stages.map((stage, i) => {
    const bookTopic = normalizeTopic(`${normalized} ${stage.stage}`);
    const snapshot = generateMarketSnapshot(bookTopic);
    return {
      position: i + 1,
      workingTitle: `${display}: ${stage.titleSuffix}`,
      hook: stage.hook,
      targetReader: stage.reader,
      // Later volumes address a narrower, more committed slice of the same audience.
      estimatedSearchVolume: Math.round(
        snapshot.monthlySearchVolume * (1 - i * 0.14) * rng.float(0.9, 1.1),
      ),
    };
  });
}
