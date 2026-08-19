import { scoreTopic, VERDICT_THRESHOLDS } from '@/lib/scoring/engine';
import { generateMarketSnapshot } from '@/lib/market/mock-provider';
import { PLANS } from '@/lib/billing/plans';

// Counted from the engine itself so the claim cannot go stale when the formula changes.
const SIGNAL_COUNT = scoreTopic(generateMarketSnapshot('reference')).factors.reduce(
  (sum, factor) => sum + factor.components.length,
  0,
);

/**
 * Stats here are facts about the product itself, not usage claims. A pre-launch tool has
 * no customer numbers worth quoting, and inventing them would undercut the entire pitch.
 */
const STATS = [
  { value: '3', label: 'sub-scores behind every verdict' },
  { value: `${SIGNAL_COUNT}`, label: 'individual signals in the formula' },
  { value: '< 90s', label: 'from topic to finished report' },
  { value: `${PLANS.pro.validationsPerCycle}`, label: 'validations a month on Pro' },
  { value: `${VERDICT_THRESHOLDS.go}+`, label: 'is the score that earns a GO' },
];

export function TrustBar() {
  return (
    <section className="border-b bg-muted/30">
      <div className="container py-8">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <div className="tnum text-2xl font-semibold tracking-tight sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs leading-snug text-muted-foreground">{stat.label}</div>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
