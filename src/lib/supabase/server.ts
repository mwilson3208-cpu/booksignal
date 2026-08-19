import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { env, isSupabaseConfigured } from '@/lib/env';

/** Request-scoped Supabase client for server components, actions and route handlers. */
export function createClient() {
  if (!isSupabaseConfigured) return null;
  const cookieStore = cookies();

  return createServerClient(env.supabaseUrl!, env.supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a server component, where cookies are read-only. The middleware
          // refreshes the session instead, so this is safe to swallow.
        }
      },
    },
  });
}

/** Service-role client for webhook handlers, which run without a user session. */
export function createAdminClient() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) return null;
  return createServerClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
