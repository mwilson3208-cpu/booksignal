'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAccountState } from '@/lib/account/usage';

export async function saveCompetitor(input: {
  asin: string;
  title: string;
  author?: string | null;
  sourceUrl?: string | null;
  snapshot: Record<string, unknown>;
  projectId?: string | null;
}) {
  const account = await getAccountState();
  const supabase = createClient();
  if (!account || !supabase) return { ok: false as const };

  await supabase.from('saved_competitors').insert({
    user_id: account.userId,
    project_id: input.projectId ?? null,
    asin: input.asin,
    title: input.title,
    author: input.author ?? null,
    source_url: input.sourceUrl ?? null,
    snapshot: input.snapshot,
  });

  revalidatePath('/projects');
  return { ok: true as const };
}

export async function saveIdea(input: {
  kind: 'niche' | 'book_idea' | 'series';
  title: string;
  payload: Record<string, unknown>;
  projectId?: string | null;
}) {
  const account = await getAccountState();
  const supabase = createClient();
  if (!account || !supabase) return { ok: false as const };

  await supabase.from('saved_ideas').insert({
    user_id: account.userId,
    project_id: input.projectId ?? null,
    kind: input.kind,
    title: input.title,
    payload: input.payload,
  });

  revalidatePath('/projects');
  return { ok: true as const };
}
