'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getAccountState } from '@/lib/account/usage';

const projectSchema = z.object({
  name: z.string().trim().min(1, 'Name the project.').max(120),
  description: z.string().trim().max(500).optional(),
});

export async function createProject(formData: FormData) {
  const parsed = projectSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
  });
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };

  const account = await getAccountState();
  const supabase = createClient();
  if (!account || !supabase) return { ok: false as const, error: 'You need to be signed in.' };

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: account.userId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    })
    .select('id')
    .single<{ id: string }>();

  if (error || !data) return { ok: false as const, error: 'Could not create the project.' };

  revalidatePath('/projects');
  return { ok: true as const, id: data.id };
}

export async function deleteProject(id: string) {
  const supabase = createClient();
  if (!supabase) return;
  await supabase.from('projects').delete().eq('id', id);
  revalidatePath('/projects');
}
