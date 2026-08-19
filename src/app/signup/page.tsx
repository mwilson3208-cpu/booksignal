import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthForm } from '@/components/marketing/auth-form';

export const metadata: Metadata = { title: 'Sign up' };

export default function SignupPage() {
  return (
    <Suspense>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
