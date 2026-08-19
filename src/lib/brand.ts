export const BRAND = {
  name: 'BookSignal',
  tagline: 'Validate the topic before you write the book.',
  description:
    'BookSignal scores any book topic on demand, competition and profit potential, then gives you a GO, MAYBE or SKIP verdict backed by a formula you can read.',
  supportEmail: 'support@booksignal.app',
  /** Shown in the footer and on every report. Non-negotiable. */
  amazonDisclaimer:
    'BookSignal is an independent tool and is not affiliated with, endorsed by, or sponsored by Amazon.com, Inc. or any of its subsidiaries. Amazon, Kindle, KDP and Amazon Best Sellers Rank are trademarks of Amazon.com, Inc. Sales and revenue figures are estimates derived from publicly observable ranking data, not reported sales.',
} as const;

export const TOOLS = [
  {
    slug: 'topic-explorer',
    name: 'Topic Explorer',
    short: 'Score any topic',
    description:
      'Type a book topic. Get search volume, the top ten competitors, a 0-100 score broken into three sub-scores, and a GO, MAYBE or SKIP verdict.',
    status: 'live' as const,
    icon: 'Radar',
  },
  {
    slug: 'niche-finder',
    name: 'Niche Finder',
    short: 'Find your lane',
    description:
      'A short questionnaire on your experience, expertise and audience turns into a ranked shortlist of niches, each ready to send straight to Topic Explorer.',
    status: 'preview' as const,
    icon: 'Compass',
  },
  {
    slug: 'book-ideas',
    name: 'Book Ideas Generator',
    short: 'Titles and keywords',
    description:
      'Turn a validated niche into specific title candidates with the seven backend keywords and two categories, formatted to paste straight into KDP.',
    status: 'preview' as const,
    icon: 'Lightbulb',
  },
  {
    slug: 'bestseller-analyzer',
    name: 'Bestseller Analyzer',
    short: 'Reverse-engineer a rival',
    description:
      'Paste an Amazon book URL. See the keywords it ranks for with volume and position, the categories it wins, and save it to a project.',
    status: 'preview' as const,
    icon: 'Search',
  },
  {
    slug: 'series-builder',
    name: 'Series Builder',
    short: 'One topic, five books',
    description:
      'Expand a validated topic into a three-to-five book series, each with a working title, a hook and the reader it is written for.',
    status: 'preview' as const,
    icon: 'Layers',
  },
  {
    slug: 'coach',
    name: 'AI Publishing Coach',
    short: 'Ask about your numbers',
    description:
      'A chat assistant that can read your saved reports, explain any score in plain English and tell you what to do next.',
    status: 'preview' as const,
    icon: 'MessageSquare',
  },
  {
    slug: 'bsr-calculator',
    name: 'BSR Calculator',
    short: 'Rank to revenue',
    description:
      'Enter any Amazon Best Sellers Rank and read off estimated daily and monthly unit sales, plus the revenue at your price point.',
    status: 'live' as const,
    icon: 'Calculator',
  },
] as const;

export type Tool = (typeof TOOLS)[number];

export function toolBySlug(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
