import { Hero } from '@/components/marketing/hero';
import { TrustBar } from '@/components/marketing/trust-bar';
import { DemoSection } from '@/components/marketing/demo-section';
import { FeatureGrid } from '@/components/marketing/feature-grid';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { Testimonials } from '@/components/marketing/testimonials';
import { PricingSection } from '@/components/marketing/pricing-table';
import { TeamSection } from '@/components/marketing/team-section';
import { Faq } from '@/components/marketing/faq';
import { FinalCta } from '@/components/marketing/final-cta';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <DemoSection />
      <FeatureGrid />
      <HowItWorks />
      <Testimonials />
      <PricingSection />
      <TeamSection />
      <Faq />
      <FinalCta />
    </>
  );
}
