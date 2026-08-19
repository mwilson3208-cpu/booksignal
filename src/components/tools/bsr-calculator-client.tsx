'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { estimateDailySalesFromBsr, royaltyPerSale, type Marketplace } from '@/lib/scoring/bsr';

const BENCHMARKS = [
  { bsr: 100, label: 'Top 100 overall' },
  { bsr: 2_000, label: 'Strong category bestseller' },
  { bsr: 20_000, label: 'Healthy mid-list title' },
  { bsr: 100_000, label: 'A sale most days' },
  { bsr: 500_000, label: 'A few sales a month' },
];

export function BsrCalculatorClient() {
  const [bsr, setBsr] = useState('18400');
  const [price, setPrice] = useState('6.99');
  const [marketplace, setMarketplace] = useState<Marketplace>('kindle');

  const result = useMemo(() => {
    const rank = Number.parseInt(bsr.replace(/[^0-9]/g, ''), 10);
    const listPrice = Number.parseFloat(price) || 0;
    if (!Number.isFinite(rank) || rank < 1) return null;

    const daily = estimateDailySalesFromBsr(rank, marketplace);
    const monthly = daily * 30.4;
    const format = marketplace === 'kindle' ? 'ebook' : 'paperback';
    const perSale = royaltyPerSale(listPrice, format);

    return {
      rank,
      daily,
      monthly,
      yearly: daily * 365,
      grossMonthly: monthly * listPrice,
      royaltyMonthly: monthly * perSale,
      royaltyYearly: daily * 365 * perSale,
      perSale,
      format,
    };
  }, [bsr, price, marketplace]);

  return (
    <div className="grid gap-6 lg:grid-cols-[380px,1fr] lg:items-start">
      <Card>
        <CardHeader>
          <CardTitle>Inputs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="bsr">Best Sellers Rank</Label>
            <Input
              id="bsr"
              inputMode="numeric"
              value={bsr}
              onChange={(e) => setBsr(e.target.value)}
              className="tnum h-12 text-lg"
              placeholder="18400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">List price (USD)</Label>
            <Input
              id="price"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="tnum h-12 text-lg"
              placeholder="6.99"
            />
          </div>

          <div className="space-y-2">
            <Label>Store</Label>
            <div className="inline-flex w-full rounded-md border p-0.5">
              {(
                [
                  ['kindle', 'Kindle'],
                  ['print', 'Print'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMarketplace(value)}
                  className={cn(
                    'flex-1 rounded px-3 py-2 text-sm font-medium transition-colors',
                    marketplace === value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
            Rank-to-sales uses a piecewise power-law curve fitted to publicly reported anchor
            points. Amazon does not publish per-title sales, so every tool that offers this figure
            is modelling it. Treat the output as an order of magnitude.
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {result && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>
                  Estimated sales at{' '}
                  <span className="tnum">#{formatNumber(result.rank)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <Metric label="Per day" value={result.daily.toFixed(1)} unit="units" primary />
                <Metric label="Per month" value={formatNumber(result.monthly)} unit="units" />
                <Metric label="Per year" value={formatNumber(result.yearly)} unit="units" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue at ${Number(price || 0).toFixed(2)}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <Metric
                  label="Gross per month"
                  value={formatCurrency(result.grossMonthly)}
                  unit="list price × units"
                />
                <Metric
                  label="Your royalty / month"
                  value={formatCurrency(result.royaltyMonthly)}
                  unit={`$${result.perSale.toFixed(2)} per sale`}
                  primary
                />
                <Metric
                  label="Your royalty / year"
                  value={formatCurrency(result.royaltyYearly)}
                  unit={result.format}
                />
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle>What the ranks mean</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {BENCHMARKS.map((benchmark) => {
              const daily = estimateDailySalesFromBsr(benchmark.bsr, marketplace);
              return (
                <button
                  key={benchmark.bsr}
                  type="button"
                  onClick={() => setBsr(String(benchmark.bsr))}
                  className="flex w-full items-center justify-between gap-4 rounded-md px-2.5 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                >
                  <span className="tnum shrink-0 font-medium">
                    #{formatNumber(benchmark.bsr)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">
                    {benchmark.label}
                  </span>
                  <span className="tnum shrink-0">{daily.toFixed(1)}/day</span>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  unit,
  primary,
}: {
  label: string;
  value: string;
  unit: string;
  primary?: boolean;
}) {
  return (
    <div className={cn('rounded-lg border p-4', primary && 'border-2 border-primary/30 bg-primary/5')}>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="tnum mt-1.5 text-2xl font-semibold">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{unit}</div>
    </div>
  );
}
