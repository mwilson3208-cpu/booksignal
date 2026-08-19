'use client';

import { useTransition } from 'react';
import { Compass, Loader2, Radar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { LogoMark } from '@/components/brand/logo';
import { completeOnboarding, type AuthorLevel } from '@/lib/actions/onboarding';
import { cn } from '@/lib/utils';

const PATHS: {
  level: AuthorLevel;
  title: string;
  body: string;
  destination: string;
  icon: typeof Radar;
}[] = [
  {
    level: 'beginner',
    title: 'I want to write a book, but I do not know what about',
    body: 'You will start in Niche Finder. Five questions about your experience and audience turn into a ranked shortlist you can validate one by one.',
    destination: 'Starts in Niche Finder',
    icon: Compass,
  },
  {
    level: 'published',
    title: 'I have a topic in mind and want to check it',
    body: 'You will start in Topic Explorer. Type the topic and read the score, the competing shelf and the verdict.',
    destination: 'Starts in Topic Explorer',
    icon: Radar,
  },
  {
    level: 'experienced',
    title: 'I publish regularly and I am picking the next title',
    body: 'You will start in Topic Explorer too, with the full toolset open — Series Builder, Bestseller Analyzer and the Publishing Coach are all there when you need them.',
    destination: 'Starts in Topic Explorer',
    icon: Radar,
  },
];

export function OnboardingClient() {
  const [pending, startTransition] = useTransition();

  return (
    <div className="mx-auto max-w-2xl py-6">
      <div className="text-center">
        <LogoMark className="mx-auto h-12 w-12" />
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">Where are you starting from?</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          One question, so we can drop you in the right place. You can use every tool either way.
        </p>
      </div>

      <div className="mt-10 space-y-3">
        {PATHS.map((path) => {
          const Icon = path.icon;
          return (
            <Card
              key={path.level}
              className={cn(
                'cursor-pointer transition-colors hover:border-primary/40',
                pending && 'pointer-events-none opacity-60',
              )}
              onClick={() => startTransition(() => completeOnboarding(path.level))}
            >
              <CardContent className="flex items-start gap-4 p-5">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-medium">{path.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{path.body}</p>
                  <p className="mt-2 text-xs font-medium text-primary">{path.destination}</p>
                </div>
                {pending && <Loader2 className="mt-1 h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
