import { Badge } from '@/components/ui/badge';

/**
 * Placeholder bios. Replace the array with the real team before launch — the badge comes
 * off at the same time.
 */
const TEAM = [
  {
    name: 'Founder',
    role: 'Product',
    bio: 'Published four non-fiction titles the hard way, two of which nobody was searching for. Built the first version of this scoring formula in a spreadsheet to stop making that mistake.',
    initials: 'F',
  },
  {
    name: 'Engineer',
    role: 'Data & platform',
    bio: 'Owns the market data pipeline and the scoring engine. Answers to the rule that every number in the product has to be explainable in one sentence.',
    initials: 'E',
  },
  {
    name: 'Advisor',
    role: 'Publishing',
    bio: 'Two decades in trade and independent publishing. Keeps the pricing and royalty models honest against how the stores actually pay out.',
    initials: 'A',
  },
];

export function TeamSection() {
  return (
    <section id="about" className="section scroll-mt-16 border-b">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">About</span>
          <h2 className="h2 mt-3">Built by people who wrote the wrong book first</h2>
          <p className="lede mt-4">
            BookSignal exists because the expensive part of publishing is not the writing. It is
            spending six months on a topic nobody was looking for.
          </p>
          <Badge variant="muted" className="mt-4">
            Placeholder bios — real team details at launch
          </Badge>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TEAM.map((member) => (
            <div key={member.role} className="rounded-xl border bg-card p-6">
              <span
                aria-hidden
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary"
              >
                {member.initials}
              </span>
              <h3 className="mt-4 font-semibold">{member.name}</h3>
              <p className="text-sm text-primary">{member.role}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
