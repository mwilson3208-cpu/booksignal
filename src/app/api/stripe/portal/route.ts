import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/billing/stripe';
import { getAccountState } from '@/lib/account/usage';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Opens the Stripe customer portal, where a user can change or cancel their plan. */
export async function POST() {
  const account = await getAccountState();
  if (!account) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 });
  }

  if (!account.profile.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No billing account yet. Start a subscription first.' },
      { status: 400 },
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: account.profile.stripe_customer_id,
    return_url: `${env.siteUrl}/account`,
  });

  return NextResponse.json({ url: session.url });
}
