import { Quote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Placeholder copy, written in-house and marked as such.
 *
 * BookSignal has no customers yet, so there are no real quotes to run. Presenting
 * invented ones as genuine would be a lie on a page whose entire pitch is "trust the
 * number" — so the section ships labelled, ready for real quotes to replace these.
 * Swap the array and delete the badge once you have them.
 */
const TESTIMONIALS = [
  {
    quote:
      'The score is the part that mattered. I could open every factor and see exactly which number was dragging it down, so I knew what to change instead of guessing.',
    name: 'Placeholder',
    role: 'Non-fiction author',
  },
  {
    quote:
      'I had four ideas and three months. Two came back SKIP on the review wall alone, which saved me the writing time I would have spent finding that out the hard way.',
    name: 'Placeholder',
    role: 'Self-publisher',
  },
  {
    quote:
      'Niche-down suggestions are what I actually use. The broad topic was a MAYBE; the narrower one it pointed me at came back a GO.',
    name: 'Placeholder',
    role: 'Series author',
  },
  {
    quote:
      'Pricing per format with the royalty already netted out meant I set my list prices in ten minutes rather than reading forum threads for a week.',
    name: 'Placeholder',
    role: 'Indie publisher',
  },
];

export function Testimonials() {
  return (
    <section className="section border-b bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">What authors say</span>
          <h2 className="h2 mt-3">Written for people who have to choose</h2>
          <Badge variant="muted" className="mt-4">
            Sample copy — real quotes replace these at launch
          </Badge>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <figure key={t.quote} className="flex flex-col rounded-xl border bg-card p-6">
              <Quote className="h-5 w-5 shrink-0 text-primary/40" aria-hidden />
              <blockquote className="mt-4 flex-1 leading-relaxed">{t.quote}</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t pt-4">
                <span
                  aria-hidden
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
                >
                  —
                </span>
                <span className="text-sm">
                  <span className="font-medium">{t.name}</span>
                  <span className="block text-muted-foreground">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
