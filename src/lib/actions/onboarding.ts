'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type AuthorLevel = 'beginner' | 'published' | 'experienced';

/**
 * Records where the user is starting from and routes them accordingly: someone with no
 * book yet goes to Niche Finder to work out what to write about, everyone else goes
 * straight to Topic Explorer with a topic in mind.
 */
export async function completeOnboarding(level: AuthorLevel) {
  const supabase = createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ author_level: level, onboarded_at: new Date().toISOString() })
        .eq('id', user.id);
    }
  }

  revalidatePath('/dashboard');
  redirect(level === 'beginner' ? '/tools/niche-finder' : '/tools/topic-explorer');
}
