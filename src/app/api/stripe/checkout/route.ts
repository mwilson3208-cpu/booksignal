import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe, priceIdFor } from '@/lib/billing/stripe';
import { getAccountState } from '@/lib/account/usage';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  plan: z.enum(['standard', 'pro']),
  interval: z.enum(['month', 'year']),
});

export async function POST(request: Request) {
  const account = await getAccountState();
  if (!account) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured on this deployment. Set STRIPE_SECRET_KEY.' },
      { status: 503 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });

  const price = priceIdFor(parsed.data.plan, parsed.data.interval);
  if (!price) {
    return NextResponse.json(
      {
        error: `No Stripe price is configured for the ${parsed.data.plan} plan billed ${parsed.data.interval}ly.`,
      },
      { status: 503 },
    );
  }

  // Reuse the customer if we already have one, so a user upgrading does not end up with
  // two Stripe customers and two subscriptions.
  let customerId = account.profile.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: account.email,
      name: account.profile.full_name ?? undefined,
      metadata: { supabase_user_id: account.userId },
    });
    customerId = customer.id;
    const supabase = createClient();
    await supabase?.from('profiles').update({ stripe_customer_id: customerId }).eq('id', account.userId);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${env.siteUrl}/account?checkout=success`,
    cancel_url: `${env.siteUrl}/account?checkout=cancelled`,
    // Carried through to the webhook, which is the only place entitlements are written.
    subscription_data: {
      metadata: { supabase_user_id: account.userId, plan: parsed.data.plan },
    },
    metadata: { supabase_user_id: account.userId, plan: parsed.data.plan },
  });

  return NextResponse.json({ url: session.url });
}
