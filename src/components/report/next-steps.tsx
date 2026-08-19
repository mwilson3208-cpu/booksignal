import Link from 'next/link';
import { ArrowRight, Layers, Lightbulb, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ValidationReport } from '@/lib/types';

/**
 * The hand-off. A validated topic is the input to three other tools, so the report
 * ends by passing it to them rather than leaving the user to retype it.
 */
export function NextSteps({ report }: { report: ValidationReport }) {
  const topic = encodeURIComponent(report.topic);

  const steps = [
    {
      href: `/tools/book-ideas?topic=${topic}`,
      icon: Lightbulb,
      title: 'Name the book',
      body: 'Title candidates with all seven KDP backend keywords and both categories.',
    },
    {
      href: `/tools/series-builder?topic=${topic}`,
      icon: Layers,
      title: 'Plan the series',
      body: 'Turn this one topic into a staged three-to-five book run.',
    },
    {
      href: '/tools/bestseller-analyzer',
      icon: Search,
      title: 'Study a rival',
      body: 'Paste a competing title above and see the keywords it ranks for.',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>What to do next</CardTitle>
        <p className="text-sm text-muted-foreground">
          {report.verdict === 'SKIP'
            ? 'This topic did not clear the line, but the tools below still take it as a starting point — narrowing it is often what turns a SKIP into a MAYBE.'
            : 'Your topic carries straight through to the next three tools. No retyping.'}
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Link
              key={step.href}
              href={step.href}
              className="group flex flex-col rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-accent"
            >
              <Icon className="h-5 w-5 text-primary" />
              <span className="mt-3 flex items-center gap-1.5 font-medium">
                {step.title}
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </span>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
