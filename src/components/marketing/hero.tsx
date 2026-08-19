import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductShot } from './product-shot';

const PROOF = [
  'A score you can audit, line by line',
  'Every report exports to PDF',
  'No credit card to run your first three',
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-primary/[0.07] to-transparent"
      />
      <div className="container relative py-16 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr,1fr] lg:gap-16">
          <div className="animate-fade-up">
            <span className="eyebrow">Market validation for self-publishers</span>
            <h1 className="h1 mt-4 text-balance">
              Know whether the book is worth writing{' '}
              <span className="text-primary">before you write it.</span>
            </h1>
            <p className="lede mt-6 max-w-xl text-pretty">
              Type any book topic. In under ninety seconds you get search volume, the ten books
              already competing, a 0-100 score broken into demand, competition and profit, and a
              straight answer: GO, MAYBE or SKIP.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/signup">
                  Validate a topic free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/#how-it-works">See how the score works</Link>
              </Button>
            </div>

            <ul className="mt-8 space-y-2.5">
              {PROOF.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-fade-up lg:pl-4" style={{ animationDelay: '120ms' }}>
            <ProductShot />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              A live report, rendered by the same scoring engine the app runs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
