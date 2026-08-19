import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { env, isCoachConfigured } from '@/lib/env';
import { getAccountState } from '@/lib/account/usage';
import { canUseCoach } from '@/lib/billing/plans';
import { createClient } from '@/lib/supabase/server';
import { buildSystemPrompt, summarizeReport } from '@/lib/coach/prompt';
import type { ValidationRow } from '@/lib/supabase/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(4_000),
      }),
    )
    .min(1)
    .max(40),
});

/** How many saved reports to give the coach. Newest first; enough for real context. */
const REPORT_CONTEXT_LIMIT = 12;

export async function POST(request: Request) {
  const account = await getAccountState();
  if (!account) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  if (!canUseCoach(account.plan.id)) {
    return NextResponse.json(
      { error: 'The Publishing Coach is available on the Standard and Pro plans.' },
      { status: 403 },
    );
  }

  if (!isCoachConfigured) {
    return NextResponse.json(
      {
        error:
          'The coach is not configured on this deployment. Set ANTHROPIC_API_KEY to enable it.',
      },
      { status: 503 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // RLS scopes this to the signed-in user, so the coach can only ever read their reports.
  const supabase = createClient();
  const { data: validations } = (await supabase
    ?.from('validations')
    .select('report')
    .order('created_at', { ascending: false })
    .limit(REPORT_CONTEXT_LIMIT)) ?? { data: null };

  const summaries = ((validations as Pick<ValidationRow, 'report'>[] | null) ?? []).map((row) =>
    summarizeReport(row.report),
  );

  const client = new Anthropic({ apiKey: env.anthropicApiKey! });

  const stream = await client.messages.stream({
    model: env.anthropicModel,
    max_tokens: 1_024,
    system: buildSystemPrompt(summaries),
    messages: parsed.data.messages,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch {
        controller.enqueue(
          encoder.encode('\n\n(The connection dropped before the answer finished. Ask again.)'),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    },
  });
}
