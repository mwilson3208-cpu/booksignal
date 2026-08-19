'use client';

import Link from 'next/link';
import { ArrowRight, FlaskConical, Sigma } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FactorBreakdown } from './factor-breakdown';
import { ScoreGauge } from './score-gauge';
import { VerdictBadge } from './verdict-badge';
import { CompetitorTable } from './competitor-table';
import { formatCompact, formatCurrency, formatNumber } from '@/lib/utils';
import { BRAND } from '@/lib/brand';
import type { ValidationReport } from '@/lib/types';

export function ReportView({
  report,
  actions,
}: {
  report: ValidationReport;
  actions?: React.ReactNode;
}) {
  const [demand, competition, profit] = report.factors;
  const ebook = report.pricing.find((p) => p.format === 'ebook')!;

  return (
    <div className="space-y-6">
      {/* Verdict header */}
      <Card className="overflow-hidden">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[auto,1fr] lg:items-center">
          <div className="flex justify-center lg:justify-start">
            <ScoreGauge score={report.score} verdict={report.verdict} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <VerdictBadge verdict={report.verdict} size="lg" />
              {report.market.source === 'mock' && (
                <Badge variant="muted" className="gap-1">
                  <FlaskConical className="h-3 w-3" />
                  Sample data
                </Badge>
              )}
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              {report.topic}
            </h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
              {report.verdictReason}
            </p>
            {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-y border-t sm:grid-cols-4 sm:divide-y-0">
          <Stat label="Monthly searches" value={formatNumber(report.market.monthlySearchVolume)} />
          <Stat
            label="Competing titles"
            value={formatCompact(report.market.totalCompetingTitles)}
          />
          <Stat
            label="Est. monthly revenue"
            value={`${formatCurrency(report.revenue.low)}–${formatCurrency(report.revenue.high)}`}
          />
          <Stat label="Recommended ebook price" value={`$${ebook.recommended.toFixed(2)}`} />
        </div>
      </Card>

      {/* Score formula */}
      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <Sigma className="h-4 w-4 text-primary" />
          <CardTitle>How the {report.score} was calculated</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The score is a fixed formula, not a model output. The same market data always
            produces the same number. Expand any factor to see the raw inputs and add the
            column up yourself.
          </p>

          <div className="space-y-3">
            {report.factors.map((factor) => (
              <FactorBreakdown key={factor.key} factor={factor} />
            ))}
          </div>

          <div className="rounded-lg border bg-muted/40 p-4">
            <div className="tnum flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-sm">
              {report.factors.map((f, i) => (
                <span key={f.key} className="whitespace-nowrap">
                  {i > 0 && <span className="mr-2 text-muted-foreground">+</span>}
                  {f.score.toFixed(1)}
                  <span className="text-muted-foreground"> × {f.weight.toFixed(2)}</span>
                </span>
              ))}
              <span className="text-muted-foreground">=</span>
              <span className="font-semibold">{report.score}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              GO at {report.thresholds.go}+ &middot; MAYBE from {report.thresholds.maybe} to{' '}
              {report.thresholds.go - 1} &middot; SKIP below {report.thresholds.maybe}. Engine
              v{report.version}.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Competitors */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 competing books</CardTitle>
          <p className="text-sm text-muted-foreground">
            Ranked by Best Sellers Rank. Sales and revenue are estimates derived from rank, not
            reported figures.
          </p>
        </CardHeader>
        <CardContent>
          <CompetitorTable competitors={report.market.competitors.slice(0, 10)} />
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended pricing</CardTitle>
          <p className="text-sm text-muted-foreground">
            Anchored to what this market already charges, and to the royalty band each format
            sits in.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {report.pricing.map((p) => (
            <div key={p.format} className="rounded-lg border p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {p.format}
              </div>
              <div className="tnum mt-2 text-3xl font-semibold">${p.recommended.toFixed(2)}</div>
              <div className="tnum mt-1 text-sm text-muted-foreground">
                Range ${p.low.toFixed(2)} – ${p.high.toFixed(2)}
              </div>
              <div className="tnum mt-3 rounded-md bg-muted px-2.5 py-1.5 text-xs">
                {Math.round(p.royaltyRate * 100)}% royalty &rarr;{' '}
                <span className="font-medium">${p.royaltyPerSale.toFixed(2)}</span> per sale
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{p.rationale}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>Estimated monthly revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {(
              [
                ['Conservative', report.revenue.low, report.revenue.assumedMonthlyUnits.low],
                ['Expected', report.revenue.mid, report.revenue.assumedMonthlyUnits.mid],
                ['Strong', report.revenue.high, report.revenue.assumedMonthlyUnits.high],
              ] as const
            ).map(([label, value, units], i) => (
              <div
                key={label}
                className={
                  i === 1
                    ? 'rounded-lg border-2 border-primary/30 bg-primary/5 p-4'
                    : 'rounded-lg border p-4'
                }
              >
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {label}
                </div>
                <div className="tnum mt-2 text-3xl font-semibold">{formatCurrency(value)}</div>
                <div className="tnum mt-1 text-sm text-muted-foreground">
                  {formatNumber(units)} units/mo
                </div>
              </div>
            ))}
          </div>
          <ul className="mt-5 space-y-1.5 text-sm text-muted-foreground">
            {report.revenue.assumptions.map((a) => (
              <li key={a} className="flex gap-2">
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Niche down */}
      {report.nicheDown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Niche down</CardTitle>
            <p className="text-sm text-muted-foreground">
              This market is crowded. These adjacent phrases carry real demand against a thinner
              shelf. Validate one before you commit.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.nicheDown.map((n) => (
              <Link
                key={n.topic}
                href={`/tools/topic-explorer?topic=${encodeURIComponent(n.topic)}`}
                className="group flex items-start justify-between gap-4 rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-accent"
              >
                <div className="min-w-0">
                  <div className="font-medium">{n.topic}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{n.reason}</div>
                </div>
                <Button
                  asChild={false}
                  variant="ghost"
                  size="sm"
                  className="shrink-0 pointer-events-none"
                  tabIndex={-1}
                >
                  Validate
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>Related keywords</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 font-medium">Keyword</th>
                  <th className="pb-2 text-right font-medium">Searches/mo</th>
                  <th className="pb-2 text-right font-medium">Titles</th>
                  <th className="pb-2 text-right font-medium">Opportunity</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {report.market.relatedKeywords.map((k) => (
                  <tr key={k.keyword}>
                    <td className="py-2.5 pr-3">{k.keyword}</td>
                    <td className="tnum py-2.5 text-right">{formatNumber(k.monthlySearchVolume)}</td>
                    <td className="tnum py-2.5 text-right text-muted-foreground">
                      {formatNumber(k.competingTitles)}
                    </td>
                    <td className="tnum py-2.5 text-right">
                      <span
                        className={
                          k.opportunity >= 65
                            ? 'font-medium text-verdict-go'
                            : k.opportunity >= 40
                              ? 'font-medium text-verdict-maybe'
                              : 'text-muted-foreground'
                        }
                      >
                        {k.opportunity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs leading-relaxed text-muted-foreground">{BRAND.amazonDisclaimer}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 sm:p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="tnum mt-1.5 text-lg font-semibold sm:text-xl">{value}</div>
    </div>
  );
}
