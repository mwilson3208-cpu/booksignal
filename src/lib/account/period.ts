import type { Profile } from '@/lib/supabase/types';

/**
 * The usage window. Paid plans track the Stripe billing cycle stored on the profile;
 * free accounts roll on the calendar month. Rolling the window forward is what resets
 * the allowance — no cron job, no batch reset, no chance of a missed reset.
 */
export function currentPeriod(
  profile: Pick<Profile, 'current_period_start' | 'current_period_end'>,
  now: Date = new Date(),
): { start: Date; end: Date } {
  const start = new Date(profile.current_period_start);
  const end = new Date(profile.current_period_end);

  if (now < end && now >= start) return { start, end };

  // The stored window has lapsed (free plan, or a webhook we have not received yet).
  // Fall back to the current calendar month so the allowance always resets on time.
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start: monthStart, end: monthEnd };
}
