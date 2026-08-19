import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PLANS } from '@/lib/billing/plans';

export function FinalCta() {
  return (
    <section className="section">
      <div className="container">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12 sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.18),transparent_60%)]"
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              The next six months are worth more than a guess
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-primary-foreground/85">
              Run your idea through {PLANS.free.validationsPerCycle} free validations and find out
              whether the market is waiting for it.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" variant="secondary">
                <Link href="/signup">
                  Validate a topic free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link href="/#pricing">Compare plans</Link>
              </Button>
            </div>
            <p className="mt-5 text-sm text-primary-foreground/70">
              No credit card required. Cancel any time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
