'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * The walkthrough. No video file ships with v1, so rather than a dead play button this
 * is a live, looping render of the three states a real validation moves through.
 * Replace with an embedded recording by swapping the panel for an <iframe> or <video>.
 */
const STEPS = [
  {
    label: 'Type the topic',
    caption: 'One field. No setup, no spreadsheet, no keyword list to assemble first.',
  },
  {
    label: 'Pull the market',
    caption: 'Search volume, the competing shelf, prices and ranks — gathered and normalized.',
  },
  {
    label: 'Read the verdict',
    caption: 'A score, three sub-scores, the formula behind them, and a decision.',
  },
];

export function DemoSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % STEPS.length), 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="section border-b">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Watch it run</span>
          <h2 className="h2 mt-3 text-balance">Ninety seconds, start to finish</h2>
          <p className="lede mt-4">
            No exports to reconcile, no rank-tracking spreadsheet to maintain. One field in, one
            decision out.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl">
          <div className="overflow-hidden rounded-xl border bg-card shadow-lg">
            <div className="flex min-h-[300px] w-full items-center justify-center bg-gradient-to-br from-muted/60 to-background p-6 sm:min-h-[380px] sm:p-10">
              <DemoFrame step={active} />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <button
                key={step.label}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  'rounded-lg border p-4 text-left transition-colors',
                  active === i ? 'border-primary bg-primary/5' : 'hover:bg-accent',
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'tnum inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold',
                      active === i
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium">{step.label}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{step.caption}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoFrame({ step }: { step: number }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {step === 0 && (
        <div className="w-full max-w-lg">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Book topic
          </div>
          <div className="mt-2 flex h-14 items-center rounded-lg border-2 border-primary bg-background px-4 text-base sm:text-lg">
            <span>intermittent fasting for women over 40</span>
            <span className="ml-0.5 inline-block h-6 w-0.5 animate-pulse bg-primary" />
          </div>
          <div className="mt-3 flex h-12 items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground">Validate topic</div>
        </div>
      )}

      {step === 1 && (
        <div className="w-full max-w-lg space-y-4">
          {[
            ['Search volume', 100],
            ['Competing titles', 82],
            ['Price points', 64],
            ['Rank & review data', 41],
          ].map(([label, pct]) => (
            <div key={label as string}>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{label}</span>
                <span className="tnum">{pct}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="flex w-full max-w-lg flex-col items-center gap-4 text-center">
          <div className="tnum text-6xl font-semibold text-verdict-go sm:text-7xl">73</div>
          <div className="rounded-full bg-verdict-go-soft px-5 py-2 text-sm font-semibold uppercase tracking-widest text-verdict-go ring-1 ring-inset ring-verdict-go/25">
            GO
          </div>
          <div className="grid w-full grid-cols-3 gap-3 pt-2">
            {[
              ['Demand', 82],
              ['Competition', 69],
              ['Profit', 65],
            ].map(([label, value]) => (
              <div key={label as string}>
                <div className="tnum text-lg font-semibold">{value}</div>
                <div className="text-[11px] text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
