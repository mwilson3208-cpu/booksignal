import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/app/page-header';
import { BillingPanel } from '@/components/app/billing-panel';
import { getAccountState } from '@/lib/account/usage';
import { isStripeConfigured } from '@/lib/env';
import { PLANS } from '@/lib/billing/plans';
import { cn, formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Account & billing' };

const STATUS_LABEL: Record<string, string> = {
  none: 'No subscription',
  trialing: 'Trialing',
  active: 'Active',
  past_due: 'Payment past due',
  canceled: 'Canceled',
  incomplete: 'Incomplete',
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { checkout?: string };
}) {
  const account = await getAccountState();
  if (!account) redirect('/login');

  const { profile, plan, usage } = account;

  return (
    <>
      <PageHeader
        title="Account & billing"
        description="Your plan, your usage for this cycle, and where to change either."
      />

      {searchParams.checkout === 'success' && (
        <div className="mb-6 rounded-lg border border-verdict-go/30 bg-verdict-go-soft p-4 text-sm text-verdict-go">
          Payment received. Your new plan applies as soon as Stripe confirms the subscription —
          usually within a few seconds. Refresh if the plan below still looks stale.
        </div>
      )}
      {searchParams.checkout === 'cancelled' && (
        <div className="mb-6 rounded-lg border p-4 text-sm text-muted-foreground">
          Checkout was cancelled. Nothing has been charged.
        </div>
      )}

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Email" value={account.email} />
            <Row label="Name" value={profile.full_name ?? 'Not set'} />
            <Row
              label="Author level"
              value={profile.author_level ? profile.author_level : 'Not set'}
            />
            <Row label="Member since" value={formatDate(profile.created_at)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This billing cycle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="tnum flex items-baseline justify-between">
                <span className="text-3xl font-semibold">{usage.used}</span>
                <span className="text-sm text-muted-foreground">of {usage.limit} validations</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full',
                    usage.remaining === 0
                      ? 'bg-verdict-skip'
                      : usage.percentUsed >= 80
                        ? 'bg-verdict-maybe'
                        : 'bg-primary',
                  )}
                  style={{ width: `${usage.percentUsed}%` }}
                />
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <Row label="Plan" value={plan.name} />
              <Row
                label="Status"
                value={STATUS_LABEL[profile.subscription_status] ?? profile.subscription_status}
              />
              <Row
                label="Billed"
                value={profile.billing_interval === 'year' ? 'Yearly' : profile.billing_interval === 'month' ? 'Monthly' : '—'}
              />
              <Row label="Cycle resets" value={formatDate(usage.periodEnd)} />
            </div>

            {plan.id === 'free' && (
              <p className="rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
                The Free plan includes {PLANS.free.validationsPerCycle} validations a month and
                every tool except PDF export and the Publishing Coach.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <BillingPanel
        currentPlan={plan.id}
        currentInterval={profile.billing_interval}
        hasSubscription={Boolean(profile.stripe_subscription_id)}
        stripeConfigured={isStripeConfigured}
        cancelAtPeriodEnd={profile.cancel_at_period_end}
        periodEnd={usage.periodEnd}
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium capitalize">{value}</span>
    </div>
  );
}
