export type PlanId = 'free' | 'standard' | 'pro';
export type BillingInterval = 'month' | 'year';

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  /** Monthly price in USD when billed monthly. */
  monthlyPrice: number;
  /** Total charged once per year. Two months free against the monthly rate. */
  yearlyPrice: number;
  /** Validations allowed per billing cycle. */
  validationsPerCycle: number;
  featured: boolean;
  features: string[];
  limits: string[];
}

/**
 * Yearly pricing is exactly ten months of the monthly rate, which is what "two months
 * free" means. Derived rather than hard-coded so the two can never drift apart.
 */
function yearly(monthly: number) {
  return monthly * 10;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'Kick the tyres on one idea.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    validationsPerCycle: 3,
    featured: false,
    features: [
      '3 topic validations per month',
      'Full scored report with formula breakdown',
      'BSR Calculator',
      'One project',
    ],
    limits: ['No PDF export', 'No AI Publishing Coach'],
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    tagline: 'For the author working through a shortlist.',
    monthlyPrice: 29,
    yearlyPrice: yearly(29),
    validationsPerCycle: 30,
    featured: false,
    features: [
      '30 topic validations per month',
      'All seven tools',
      'PDF export on every report',
      'Unlimited projects',
      'AI Publishing Coach',
      'Email support',
    ],
    limits: [],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'For publishers running a catalogue.',
    monthlyPrice: 79,
    yearlyPrice: yearly(79),
    validationsPerCycle: 100,
    featured: true,
    features: [
      '100 topic validations per month',
      'Everything in Standard',
      'Series Builder with full multi-book plans',
      'Bulk competitor tracking',
      'Priority support',
      'Early access to new tools',
    ],
    limits: [],
  },
};

export const PAID_PLANS: Plan[] = [PLANS.standard, PLANS.pro];

export function planFor(id: string | null | undefined): Plan {
  if (id === 'standard' || id === 'pro' || id === 'free') return PLANS[id];
  return PLANS.free;
}

/** Effective monthly cost when billed yearly, used for the "$X/mo billed yearly" line. */
export function effectiveMonthly(plan: Plan, interval: BillingInterval): number {
  return interval === 'year' ? Math.round((plan.yearlyPrice / 12) * 100) / 100 : plan.monthlyPrice;
}

export function yearlySavings(plan: Plan): number {
  return plan.monthlyPrice * 12 - plan.yearlyPrice;
}

export function canExportPdf(plan: PlanId): boolean {
  return plan !== 'free';
}

export function canUseCoach(plan: PlanId): boolean {
  return plan !== 'free';
}
