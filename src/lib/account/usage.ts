import 'server-only';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { planFor, type Plan } from '@/lib/billing/plans';
import type { Profile } from '@/lib/supabase/types';
import { currentPeriod } from './period';

export interface AccountState {
  userId: string;
  email: string;
  profile: Profile;
  plan: Plan;
  usage: UsageState;
}

export interface UsageState {
  used: number;
  limit: number;
  remaining: number;
  periodStart: string;
  periodEnd: string;
  /** Percentage of the allowance consumed, 0-100. */
  percentUsed: number;
}

/** Loads the signed-in user's profile, plan and metered usage for the current cycle. */
export const getAccountState = cache(async (): Promise<AccountState | null> => {
  const supabase = createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle<Profile>();

  if (!profile) return null;

  const plan = planFor(profile.plan);
  const { start, end } = currentPeriod(profile);

  const { count } = await supabase
    .from('usage_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('kind', 'validation')
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString());

  const used = count ?? 0;
  const limit = plan.validationsPerCycle;

  return {
    userId: user.id,
    email: user.email ?? profile.email,
    profile,
    plan,
    usage: {
      used,
      limit,
      remaining: Math.max(0, limit - used),
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
      percentUsed: limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 100,
    },
  };
});

export interface MeterResult {
  allowed: boolean;
  usage: UsageState;
  reason?: string;
}

/**
 * Records one metered validation, refusing when the cycle allowance is spent.
 *
 * The count is read immediately before the insert, so two requests racing at the limit
 * can in principle both pass. That is deliberate for v1: the failure mode is one extra
 * validation, which is far better for the user than a lock on the hot path. Tightening
 * it means moving the check into a Postgres function with a row lock on the profile.
 */
export async function consumeValidationCredit(
  account: AccountState,
  referenceId?: string,
): Promise<MeterResult> {
  if (account.usage.remaining <= 0) {
    return {
      allowed: false,
      usage: account.usage,
      reason: `You have used all ${account.usage.limit} validations on the ${account.plan.name} plan for this billing cycle. Your allowance resets on ${new Date(account.usage.periodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`,
    };
  }

  const supabase = createClient();
  if (!supabase) return { allowed: false, usage: account.usage, reason: 'Supabase is not configured.' };

  const { error } = await supabase.from('usage_events').insert({
    user_id: account.userId,
    kind: 'validation',
    reference_id: referenceId ?? null,
    period_start: account.usage.periodStart,
  });

  if (error) {
    return { allowed: false, usage: account.usage, reason: 'Could not record usage. Try again.' };
  }

  const used = account.usage.used + 1;
  return {
    allowed: true,
    usage: {
      ...account.usage,
      used,
      remaining: Math.max(0, account.usage.limit - used),
      percentUsed: Math.min(100, Math.round((used / account.usage.limit) * 100)),
    },
  };
}
