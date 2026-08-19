'use client';

import { useState } from 'react';
import { AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  PLANS,
  effectiveMonthly,
  yearlySavings,
  type BillingInterval,
  type Plan,
  type PlanId,
} from '@/lib/billing/plans';

const TIERS: Plan[] = [PLANS.standard, PLANS.pro];

export function BillingPanel({
  currentPlan,
  currentInterval,
  hasSubscription,
  stripeConfigured,
  cancelAtPeriodEnd,
  periodEnd,
}: {
  currentPlan: PlanId;
  currentInterval: BillingInterval | null;
  hasSubscription: boolean;
  stripeConfigured: boolean;
  cancelAtPeriodEnd: boolean;
  periodEnd: string;
}) {
  const [interval, setInterval] = useState<BillingInterval>(currentInterval ?? 'month');
  const [pendingPlan, setPendingPlan] = useState<PlanId | 'portal' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const yearly = interval === 'year';

  async function post(url: string, body?: unknown) {
    setError(null);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'Something went wrong.');
      window.location.href = payload.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setPendingPlan(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Plans</CardTitle>
        <div className="flex items-center gap-2.5">
          <span className={cn('text-sm', !yearly ? 'font-medium' : 'text-muted-foreground')}>
            Monthly
          </span>
          <Switch
            checked={yearly}
            onCheckedChange={(checked) => setInterval(checked ? 'year' : 'month')}
            aria-label="Bill yearly"
          />
          <span className={cn('text-sm', yearly ? 'font-medium' : 'text-muted-foreground')}>
            Yearly
          </span>
          <Badge>2 months free</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!stripeConfigured && (
          <div className="flex gap-2.5 rounded-lg border border-verdict-maybe/30 bg-verdict-maybe-soft p-3.5 text-sm text-verdict-maybe">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Stripe is not configured on this deployment. Set <code>STRIPE_SECRET_KEY</code> and
              the four price IDs to enable checkout.
            </p>
          </div>
        )}

        {cancelAtPeriodEnd && (
          <div className="rounded-lg border border-verdict-maybe/30 bg-verdict-maybe-soft p-3.5 text-sm text-verdict-maybe">
            Your subscription is set to cancel on{' '}
            {new Date(periodEnd).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
            . You keep full access until then.
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {TIERS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const price = effectiveMonthly(plan, interval);
            return (
              <div
                key={plan.id}
                className={cn(
                  'flex flex-col rounded-xl border p-5',
                  isCurrent && 'border-2 border-primary bg-primary/5',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{plan.name}</h3>
                  {isCurrent && <Badge>Current plan</Badge>}
                </div>

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="tnum text-3xl font-semibold">
                    ${yearly ? price.toFixed(2).replace(/\.00$/, '') : price}
                  </span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <p className="tnum mt-1 text-xs text-muted-foreground">
                  {yearly
                    ? `$${plan.yearlyPrice} billed yearly · save $${yearlySavings(plan)}`
                    : 'Billed monthly'}
                </p>

                <p className="tnum mt-4 text-sm">
                  <span className="font-medium">{plan.validationsPerCycle}</span> validations per
                  billing cycle
                </p>

                <Button
                  className="mt-5"
                  variant={isCurrent ? 'outline' : 'default'}
                  disabled={pendingPlan !== null || (isCurrent && currentInterval === interval)}
                  onClick={() => {
                    if (hasSubscription) {
                      setPendingPlan('portal');
                      void post('/api/stripe/portal');
                    } else {
                      setPendingPlan(plan.id);
                      void post('/api/stripe/checkout', { plan: plan.id, interval });
                    }
                  }}
                >
                  {pendingPlan === plan.id || (pendingPlan === 'portal' && isCurrent) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {isCurrent && currentInterval === interval
                    ? 'Your current plan'
                    : hasSubscription
                      ? `Switch to ${plan.name}`
                      : `Subscribe to ${plan.name}`}
                </Button>
              </div>
            );
          })}
        </div>

        {hasSubscription && (
          <Button
            variant="outline"
            className="w-full"
            disabled={pendingPlan !== null}
            onClick={() => {
              setPendingPlan('portal');
              void post('/api/stripe/portal');
            }}
          >
            {pendingPlan === 'portal' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            Manage billing, invoices and cancellation
          </Button>
        )}

        {error && (
          <div className="flex gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-3.5 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
