/**
 * Environment access with a single rule: the app must boot and render without any
 * third-party credentials configured. Missing keys degrade a feature, they never crash
 * the process — which is what makes a fresh clone runnable before Supabase or Stripe
 * are wired up.
 */

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  siteUrl:
    optional('NEXT_PUBLIC_SITE_URL') ??
    (optional('VERCEL_URL') ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),

  supabaseUrl: optional('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: optional('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: optional('SUPABASE_SERVICE_ROLE_KEY'),

  stripeSecretKey: optional('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: optional('STRIPE_WEBHOOK_SECRET'),
  stripePrices: {
    standardMonthly: optional('STRIPE_PRICE_STANDARD_MONTHLY'),
    standardYearly: optional('STRIPE_PRICE_STANDARD_YEARLY'),
    proMonthly: optional('STRIPE_PRICE_PRO_MONTHLY'),
    proYearly: optional('STRIPE_PRICE_PRO_YEARLY'),
  },

  anthropicApiKey: optional('ANTHROPIC_API_KEY'),
  anthropicModel: optional('ANTHROPIC_MODEL') ?? 'claude-sonnet-4-5',
} as const;

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const isStripeConfigured = Boolean(env.stripeSecretKey);
export const isCoachConfigured = Boolean(env.anthropicApiKey);
