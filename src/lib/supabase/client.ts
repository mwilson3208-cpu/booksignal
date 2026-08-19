'use client';

import { createBrowserClient } from '@supabase/ssr';
import { env, isSupabaseConfigured } from '@/lib/env';

/**
 * Browser Supabase client. Returns null when Supabase is not configured so that
 * client components can render a clear "not connected" state instead of throwing.
 */
export function createClient() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient(env.supabaseUrl!, env.supabaseAnonKey!);
}
