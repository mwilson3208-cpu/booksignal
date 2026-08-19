import type { Metadata } from 'next';
import { OnboardingClient } from '@/components/app/onboarding-client';

export const metadata: Metadata = { title: 'Welcome' };

export default function OnboardingPage() {
  return <OnboardingClient />;
}
