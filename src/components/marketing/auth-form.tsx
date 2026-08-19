'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Loader2, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/brand/logo';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/env';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') ?? '/dashboard';
  // The pricing table links here with the plan the visitor picked. Carry it through so
  // the choice survives sign-up instead of being dropped on the floor.
  const plan = params.get('plan');
  const interval = params.get('interval');
  const afterSignup =
    plan === 'standard' || plan === 'pro'
      ? `/account?plan=${plan}&interval=${interval === 'year' ? 'year' : 'month'}`
      : '/onboarding';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const supabase = createClient();
    if (!supabase) {
      setError(
        'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then restart the dev server.',
      );
      return;
    }

    setPending(true);
    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName || null },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(afterSignup)}`,
          },
        });
        if (signUpError) throw signUpError;
        // With email confirmation on, no session comes back and the user has to click through.
        if (!data.session) {
          setConfirmSent(true);
          return;
        }
        router.push(afterSignup);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push(next);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setPending(false);
    }
  }

  if (confirmSent) {
    return (
      <Shell>
        <div className="text-center">
          <MailCheck className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Check your inbox</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>.
            Click it and you will land straight in your first validation.
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === 'signup'
            ? 'Three free validations. No credit card.'
            : 'Sign in to pick up where you left off.'}
        </p>
      </div>

      {!isSupabaseConfigured && (
        <div className="flex gap-2.5 rounded-lg border border-verdict-maybe/30 bg-verdict-maybe-soft p-4 text-sm text-verdict-maybe">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Supabase is not configured, so accounts cannot be created yet. Copy{' '}
            <code className="font-mono text-xs">.env.example</code> to{' '}
            <code className="font-mono text-xs">.env.local</code> and fill in your project keys.
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="fullName">Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              placeholder="Your name"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            placeholder={mode === 'signup' ? 'At least 8 characters' : ''}
          />
        </div>

        {error && (
          <div className="flex gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === 'signup' ? 'Create account' : 'Sign in'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {mode === 'signup' ? (
          <>
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            No account yet?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Create one free
            </Link>
          </>
        )}
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        {children}
      </div>
    </div>
  );
}
