import type { Metadata } from 'next';
import { TeamSection } from '@/components/marketing/team-section';
import { FinalCta } from '@/components/marketing/final-cta';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'About',
  description: `Why ${BRAND.name} exists and how the scoring engine works.`,
};

export default function AboutPage() {
  return (
    <>
      <section className="section border-b">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <span className="eyebrow">About</span>
            <h1 className="h1 mt-4">The expensive part is not the writing</h1>
            <div className="mt-8 space-y-6 text-lg leading-relaxed text-muted-foreground">
              <p>
                A non-fiction book takes somewhere between three and nine months. Almost none of
                that cost is recoverable if the topic turns out to be one nobody searches for, or
                one where the first page is held by titles with four thousand reviews each.
              </p>
              <p>
                The information needed to see that coming is public. Search volume, competing
                titles, prices, ranks and review counts are all observable before a word is
                written. What has been missing is a way to put them together into a single decision
                that an author can act on and, crucially, argue with.
              </p>
              <p className="text-foreground">
                So the score is a formula, not a model. Three weighted factors — demand,
                competition, profit potential — built from ten individual signals, every one of
                them shown in the report with its raw value, its weight and the points it
                contributed. Run the same topic twice and you get the same number. Disagree with
                the number and you can see exactly which signal to argue with.
              </p>
              <p>
                That is the whole design principle: a tool you can check is worth more than a tool
                you have to believe.
              </p>
            </div>
          </div>
        </div>
      </section>
      <TeamSection />
      <FinalCta />
    </>
  );
}
