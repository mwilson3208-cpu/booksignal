import { describe, expect, it } from 'vitest';
import { currentPeriod } from './period';
import type { Profile } from '@/lib/supabase/types';

function profile(start: string, end: string): Profile {
  return {
    id: 'u', email: 'a@b.co', full_name: null, author_level: null, onboarded_at: null,
    plan: 'standard', subscription_status: 'active', stripe_customer_id: null,
    stripe_subscription_id: null, billing_interval: 'month',
    current_period_start: start, current_period_end: end, cancel_at_period_end: false,
    created_at: start, updated_at: start,
  };
}

describe('billing period', () => {
  it('uses the stored window while it is still open', () => {
    const now = new Date();
    const start = new Date(now.getTime() - 86_400_000).toISOString();
    const end = new Date(now.getTime() + 86_400_000).toISOString();
    const period = currentPeriod(profile(start, end));
    expect(period.start.toISOString()).toBe(start);
    expect(period.end.toISOString()).toBe(end);
  });

  it('falls back to the calendar month once the stored window has lapsed', () => {
    const period = currentPeriod(profile('2020-01-01T00:00:00.000Z', '2020-02-01T00:00:00.000Z'));
    const now = new Date();
    expect(period.start.getUTCMonth()).toBe(now.getUTCMonth());
    expect(period.start.getUTCDate()).toBe(1);
    expect(period.end.getTime()).toBeGreaterThan(now.getTime());
  });

  it('falls back when the stored window starts in the future', () => {
    const future = new Date(Date.now() + 30 * 86_400_000).toISOString();
    const later = new Date(Date.now() + 60 * 86_400_000).toISOString();
    const period = currentPeriod(profile(future, later));
    expect(period.start.getTime()).toBeLessThanOrEqual(Date.now());
  });
});
