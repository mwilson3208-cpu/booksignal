'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  PLANS,
  effectiveMonthly,
  yearlySavings,
  type BillingInterval,
  type Plan,
} from '@/lib/billing/plans';

const TIERS: Plan[] = [PLANS.standard, PLANS.pro];

export function PricingTable({
  ctaHref = '/signup',
  ctaLabel = 'Start on',
}: {
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const [interval, setInterval] = useState<BillingInterval>('month');
  const yearly = interval === 'year';

  return (
    <div>
      <div className="flex items-center justify-center gap-3">
        <span className={cn('text-sm font-medium', !yearly && 'text-foreground', yearly && 'text-muted-foreground')}>
          Monthly
        </span>
        <Switch
          checked={yearly}
          onCheckedChange={(checked) => setInterval(checked ? 'year' : 'month')}
          aria-label="Bill yearly"
        />
        <span className={cn('text-sm font-medium', yearly ? 'text-foreground' : 'text-muted-foreground')}>
          Yearly
        </span>
        <Badge className="ml-1">2 months free</Badge>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-6 lg:grid-cols-2">
        {TIERS.map((plan) => {
          const price = effectiveMonthly(plan, interval);
          return (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col rounded-xl border bg-card p-7',
                plan.featured && 'border-2 border-primary shadow-lg',
              )}
            >
              {plan.featured && (
                <Badge className="absolute -top-3 left-7 bg-primary text-primary-foreground">
                  Most popular
                </Badge>
              )}

              <h3 className="text-xl font-semibold tracking-tight">{plan.name}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{plan.tagline}</p>

              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="tnum text-4xl font-semibold tracking-tight">
                  ${yearly ? price.toFixed(2).replace(/\.00$/, '') : price}
                </span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <p className="tnum mt-1.5 h-5 text-xs text-muted-foreground">
                {yearly
                  ? `$${plan.yearlyPrice} billed yearly · save $${yearlySavings(plan)}`
                  : 'Billed monthly · cancel any time'}
              </p>

              <Button asChild size="lg" className="mt-6" variant={plan.featured ? 'default' : 'outline'}>
                <Link href={`${ctaHref}?plan=${plan.id}&interval=${interval}`}>
                  {ctaLabel} {plan.name}
                </Link>
              </Button>

              <ul className="mt-7 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.limits.map((limit) => (
                  <li key={limit} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Minus className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{limit}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Every account starts with {PLANS.free.validationsPerCycle} free validations. No card
        required.
      </p>
    </div>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="section scroll-mt-16 border-b">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Pricing</span>
          <h2 className="h2 mt-3 text-balance">Cheaper than one book that does not sell</h2>
          <p className="lede mt-4">
            Both plans include all seven tools. The only difference is how many topics you can put
            through a month.
          </p>
        </div>
        <div className="mt-12">
          <PricingTable />
        </div>
      </div>
    </section>
  );
}
