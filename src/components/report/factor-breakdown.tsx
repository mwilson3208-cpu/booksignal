'use client';

import { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScoreFactor } from '@/lib/types';

function barTone(score: number) {
  if (score >= 70) return 'bg-verdict-go';
  if (score >= 45) return 'bg-verdict-maybe';
  return 'bg-verdict-skip';
}

/**
 * The trust surface. Every number that feeds the score is listed with its raw input,
 * its normalized value, its weight and the points it contributes, so a user can add the
 * column up themselves and get the score back.
 */
export function FactorBreakdown({ factor, defaultOpen = false }: { factor: ScoreFactor; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-4 p-5 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="font-medium">{factor.label}</span>
            <span className="tnum text-sm text-muted-foreground">
              weight {Math.round(factor.weight * 100)}% &middot;{' '}
              <span className="font-medium text-foreground">
                {factor.contribution.toFixed(1)} pts
              </span>
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn('h-full rounded-full transition-all', barTone(factor.score))}
                style={{ width: `${factor.score}%` }}
              />
            </div>
            <span className="tnum w-12 shrink-0 text-right text-sm font-semibold">
              {factor.score.toFixed(1)}
            </span>
          </div>
          <p className="mt-2.5 text-sm text-muted-foreground">{factor.summary}</p>
        </div>
        <ChevronDown
          className={cn(
            'mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="border-t px-5 pb-5 pt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 font-medium">Signal</th>
                <th className="pb-2 text-right font-medium">Score</th>
                <th className="pb-2 text-right font-medium">Weight</th>
                <th className="pb-2 text-right font-medium">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {factor.components.map((c) => (
                <tr key={c.key} className="align-top">
                  <td className="py-3 pr-3">
                    <div className="font-medium">{c.label}</div>
                    <div className="tnum text-xs text-muted-foreground">{c.input}</div>
                    <div className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Info className="mt-0.5 h-3 w-3 shrink-0" />
                      <span>{c.explanation}</span>
                    </div>
                  </td>
                  <td className="tnum py-3 text-right">{c.normalized.toFixed(1)}</td>
                  <td className="tnum py-3 text-right text-muted-foreground">
                    &times;{c.weight.toFixed(2)}
                  </td>
                  <td className="tnum py-3 text-right font-medium">{c.contribution.toFixed(1)}</td>
                </tr>
              ))}
              <tr className="border-t-2">
                <td className="py-3 font-medium">{factor.label} score</td>
                <td />
                <td />
                <td className="tnum py-3 text-right font-semibold">{factor.score.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
