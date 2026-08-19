import 'server-only';
import Stripe from 'stripe';
import { env } from '@/lib/env';
import type { BillingInterval, PlanId } from './plans';

let cached: Stripe | null = null;

/** Returns the Stripe client, or null when no secret key is configured. */
export function getStripe(): Stripe | null {
  if (!env.stripeSecretKey) return null;
  if (!cached) {
    cached = new Stripe(env.stripeSecretKey, { apiVersion: '2026-07-29.dahlia' });
  }
  return cached;
}

/** Maps a plan and interval to the configured Stripe price id. */
export function priceIdFor(plan: PlanId, interval: BillingInterval): string | undefined {
  if (plan === 'standard') {
    return interval === 'year' ? env.stripePrices.standardYearly : env.stripePrices.standardMonthly;
  }
  if (plan === 'pro') {
    return interval === 'year' ? env.stripePrices.proYearly : env.stripePrices.proMonthly;
  }
  return undefined;
}

/** The reverse lookup, used by the webhook to work out which plan was bought. */
export function planForPriceId(priceId: string | null | undefined): {
  plan: PlanId;
  interval: BillingInterval;
} | null {
  if (!priceId) return null;
  const map: Array<[string | undefined, PlanId, BillingInterval]> = [
    [env.stripePrices.standardMonthly, 'standard', 'month'],
    [env.stripePrices.standardYearly, 'standard', 'year'],
    [env.stripePrices.proMonthly, 'pro', 'month'],
    [env.stripePrices.proYearly, 'pro', 'year'],
  ];
  const hit = map.find(([id]) => id && id === priceId);
  return hit ? { plan: hit[1], interval: hit[2] } : null;
}

const STATUS_MAP: Record<string, string> = {
  active: 'active',
  trialing: 'trialing',
  past_due: 'past_due',
  canceled: 'canceled',
  unpaid: 'past_due',
  incomplete: 'incomplete',
  incomplete_expired: 'canceled',
  paused: 'canceled',
};

export function mapSubscriptionStatus(status: string): string {
  return STATUS_MAP[status] ?? 'none';
}

/** Only these statuses keep a paid plan's entitlements switched on. */
export function isEntitled(status: string): boolean {
  return status === 'active' || status === 'trialing';
}
