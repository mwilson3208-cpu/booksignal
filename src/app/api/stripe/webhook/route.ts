import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, isEntitled, mapSubscriptionStatus, planForPriceId } from '@/lib/billing/stripe';
import { createAdminClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The single place plan entitlements are written.
 *
 * Nothing in the checkout flow grants a plan — only a signature-verified Stripe event
 * does. That way a user cannot get a paid plan by calling the success URL directly.
 */
const HANDLED: Stripe.Event['type'][] = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
];

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe || !env.stripeWebhookSecret) {
    return NextResponse.json({ error: 'Stripe webhooks are not configured.' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, env.stripeWebhookSecret);
  } catch {
    return NextResponse.json({ error: 'Signature verification failed.' }, { status: 400 });
  }

  if (!HANDLED.includes(event.type)) {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    // Returning 500 makes Stripe retry, which is what we want if the service key is
    // temporarily missing rather than silently dropping a paid upgrade.
    return NextResponse.json({ error: 'Supabase service role is not configured.' }, { status: 500 });
  }

  const subscription = await resolveSubscription(stripe, event);
  if (!subscription) return NextResponse.json({ received: true });

  const item = subscription.items.data[0];
  const mapping = planForPriceId(item?.price.id);
  const status = mapSubscriptionStatus(subscription.status);
  const entitled = isEntitled(status) && event.type !== 'customer.subscription.deleted';

  const periodStart = item?.current_period_start ?? subscription.start_date;
  const periodEnd = item?.current_period_end;

  const update: Record<string, unknown> = {
    plan: entitled && mapping ? mapping.plan : 'free',
    subscription_status: event.type === 'customer.subscription.deleted' ? 'canceled' : status,
    stripe_subscription_id: subscription.id,
    billing_interval: mapping?.interval ?? null,
    cancel_at_period_end: subscription.cancel_at_period_end ?? false,
  };

  // The billing cycle is what resets the validation allowance, so it has to track Stripe.
  if (periodStart) update.current_period_start = new Date(periodStart * 1000).toISOString();
  if (periodEnd) update.current_period_end = new Date(periodEnd * 1000).toISOString();

  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
  const userId = subscription.metadata?.supabase_user_id;

  // Prefer the user id carried on the subscription; fall back to the customer id for
  // subscriptions created outside this app (a manual upgrade in the Stripe dashboard).
  const query = supabase.from('profiles').update(update);
  const { error } = userId
    ? await query.eq('id', userId)
    : await query.eq('stripe_customer_id', customerId);

  if (error) {
    return NextResponse.json({ error: 'Could not apply the subscription.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function resolveSubscription(
  stripe: Stripe,
  event: Stripe.Event,
): Promise<Stripe.Subscription | null> {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode !== 'subscription' || !session.subscription) return null;
    const id =
      typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
    const subscription = await stripe.subscriptions.retrieve(id);
    // Checkout metadata does not automatically reach the subscription when the session
    // was created without subscription_data, so carry it across here.
    if (!subscription.metadata?.supabase_user_id && session.metadata?.supabase_user_id) {
      subscription.metadata = { ...subscription.metadata, ...session.metadata };
    }
    return subscription;
  }
  return event.data.object as Stripe.Subscription;
}
