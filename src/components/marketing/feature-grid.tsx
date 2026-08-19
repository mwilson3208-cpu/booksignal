import Link from 'next/link';
import {
  Calculator,
  Compass,
  Layers,
  Lightbulb,
  MessageSquare,
  Radar,
  Search,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TOOLS } from '@/lib/brand';
import { ToolPreview } from './product-shot';

const ICONS: Record<string, LucideIcon> = {
  Radar,
  Compass,
  Lightbulb,
  Search,
  Layers,
  MessageSquare,
  Calculator,
};

export function FeatureGrid() {
  return (
    <section id="tools" className="section scroll-mt-16 border-b">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Seven tools, one workflow</span>
          <h2 className="h2 mt-3 text-balance">From a vague idea to a book you can price</h2>
          <p className="lede mt-4">
            Each tool hands its output to the next one. Find a niche, validate it, name the book,
            study the competition, plan the series.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => {
            const Icon = ICONS[tool.icon] ?? Radar;
            // The two tools that run on real logic in v1 get the wide cells. Seven tools
            // across three columns only tiles cleanly when two of them span two cells.
            const wide = tool.status === 'live';
            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className={cn(
                  'group flex flex-col rounded-xl border bg-card p-6 transition-shadow hover:shadow-md',
                  wide && 'border-primary/25 lg:col-span-2',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  {tool.status === 'live' ? (
                    <Badge>Live in v1</Badge>
                  ) : (
                    <Badge variant="muted">Preview · sample data</Badge>
                  )}
                </div>

                <h3 className="mt-4 text-lg font-semibold tracking-tight">{tool.name}</h3>

                <div
                  className={cn(
                    'mt-2 flex flex-1 flex-col gap-5',
                    wide && 'lg:flex-row lg:items-start lg:gap-6',
                  )}
                >
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                    {tool.description}
                  </p>
                  <div className={cn('mt-auto', wide && 'lg:mt-0 lg:w-64 lg:shrink-0')}>
                    <ToolPreview slug={tool.slug} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
