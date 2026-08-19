'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getAccountState, consumeValidationCredit } from '@/lib/account/usage';
import { getMarketProvider } from '@/lib/market';
import { scoreTopic } from '@/lib/scoring/engine';
import { createClient } from '@/lib/supabase/server';
import type { ValidationReport } from '@/lib/types';

const topicSchema = z
  .string()
  .trim()
  .min(3, 'Give the topic at least three characters.')
  .max(120, 'Keep the topic under 120 characters.')
  .refine((v) => /[a-zA-Z]/.test(v), 'A topic needs at least one letter.');

export type ValidationResult =
  | { ok: true; id: string; report: ValidationReport }
  | { ok: false; error: string; code?: 'limit_reached' | 'invalid_topic' | 'unauthenticated' };

/**
 * Runs one validation: meters it, pulls the market snapshot, scores it and persists the
 * result. The credit is consumed before the report is generated, so a user cannot spend
 * one allowance twice by racing two submissions of the same topic.
 */
export async function runValidation(
  rawTopic: string,
  projectId?: string | null,
): Promise<ValidationResult> {
  const parsed = topicSchema.safeParse(rawTopic);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message, code: 'invalid_topic' };
  }
  const topic = parsed.data;

  const account = await getAccountState();
  if (!account) return { ok: false, error: 'You need to be signed in.', code: 'unauthenticated' };

  const meter = await consumeValidationCredit(account);
  if (!meter.allowed) {
    return { ok: false, error: meter.reason ?? 'Validation limit reached.', code: 'limit_reached' };
  }

  const provider = getMarketProvider();
  const snapshot = await provider.getSnapshot(topic);
  const report = scoreTopic(snapshot);

  const supabase = createClient();
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' };

  const { data, error } = await supabase
    .from('validations')
    .insert({
      user_id: account.userId,
      project_id: projectId || null,
      topic: report.topic,
      normalized_topic: report.normalizedTopic,
      score: report.score,
      verdict: report.verdict,
      scoring_version: report.version,
      data_source: snapshot.source,
      report,
    })
    .select('id')
    .single<{ id: string }>();

  if (error || !data) {
    return { ok: false, error: 'The report was generated but could not be saved. Try again.' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/projects');
  return { ok: true, id: data.id, report };
}

export async function deleteValidation(id: string) {
  const supabase = createClient();
  if (!supabase) return;
  await supabase.from('validations').delete().eq('id', id);
  revalidatePath('/dashboard');
  revalidatePath('/projects');
}

export async function assignValidationToProject(id: string, projectId: string | null) {
  const supabase = createClient();
  if (!supabase) return;
  await supabase.from('validations').update({ project_id: projectId }).eq('id', id);
  revalidatePath('/dashboard');
  revalidatePath('/projects');
  revalidatePath(`/tools/topic-explorer/${id}`);
}
