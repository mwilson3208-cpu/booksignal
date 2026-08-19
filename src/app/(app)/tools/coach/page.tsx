import type { Metadata } from 'next';
import { PageHeader } from '@/components/app/page-header';
import { CoachClient } from '@/components/tools/coach-client';
import { getAccountState } from '@/lib/account/usage';
import { createClient } from '@/lib/supabase/server';
import { canUseCoach } from '@/lib/billing/plans';
import { isCoachConfigured } from '@/lib/env';

export const metadata: Metadata = { title: 'AI Publishing Coach' };

export default async function CoachPage() {
  const account = await getAccountState();
  const supabase = createClient();
  const { count } = (await supabase
    ?.from('validations')
    .select('id', { count: 'exact', head: true })) ?? { count: 0 };

  const planAllows = account ? canUseCoach(account.plan.id) : false;
  const enabled = planAllows && isCoachConfigured;

  const disabledReason = !planAllows
    ? 'The Publishing Coach is included on the Standard and Pro plans. Everything else in the app keeps working on Free.'
    : 'This deployment has no ANTHROPIC_API_KEY configured, so the coach cannot answer yet. Add the key to your environment and restart.';

  return (
    <>
      <PageHeader
        title="AI Publishing Coach"
        badge={enabled ? undefined : 'Preview'}
        description="A chat assistant that can read your saved reports. It explains what a score means, names the signal dragging it down, and tells you what to do next. It never recalculates the score — that stays deterministic."
      />
      <CoachClient
        enabled={enabled}
        reportCount={count ?? 0}
        disabledReason={disabledReason}
      />
    </>
  );
}
