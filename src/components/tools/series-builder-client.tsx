'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CopyButton } from './copy-button';
import { buildSeries, type SeriesBook } from '@/lib/tools/series-builder';
import { cn, formatNumber } from '@/lib/utils';

export function SeriesBuilderClient() {
  const params = useSearchParams();
  const [topic, setTopic] = useState(params.get('topic') ?? '');
  const [length, setLength] = useState(4);
  const [series, setSeries] = useState<SeriesBook[]>(() =>
    params.get('topic') ? buildSeries(params.get('topic')!, 4) : [],
  );

  const asText = series
    .map((b) => `Book ${b.position}: ${b.workingTitle}\nHook: ${b.hook}\nReader: ${b.targetReader}`)
    .join('\n\n');

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (topic.trim().length >= 3) setSeries(buildSeries(topic, length));
            }}
            className="space-y-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="A validated topic, e.g. sourdough baking"
                className="h-12 flex-1 text-base"
                maxLength={120}
                aria-label="Topic"
              />
              <Button type="submit" size="lg" className="h-12 sm:w-40" disabled={topic.trim().length < 3}>
                <Layers className="h-4 w-4" />
                Build series
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Label className="text-sm text-muted-foreground">Series length</Label>
              <div className="inline-flex rounded-md border p-0.5">
                {[3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setLength(n);
                      if (series.length > 0) setSeries(buildSeries(topic, n));
                    }}
                    className={cn(
                      'tnum rounded px-3 py-1 text-sm font-medium transition-colors',
                      length === n ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {n} books
                  </button>
                ))}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {series.length > 0 && (
        <>
          <div className="flex justify-end">
            <CopyButton value={asText} label="Copy series plan" />
          </div>

          <div className="relative space-y-4 before:absolute before:bottom-6 before:left-[19px] before:top-6 before:w-px before:bg-border">
            {series.map((book) => (
              <div key={book.position} className="relative flex gap-5">
                <span className="tnum relative z-10 mt-4 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-background bg-primary text-sm font-semibold text-primary-foreground ring-1 ring-border">
                  {book.position}
                </span>
                <Card className="min-w-0 flex-1">
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold tracking-tight">{book.workingTitle}</h3>
                      <span className="tnum shrink-0 text-xs text-muted-foreground">
                        ~{formatNumber(book.estimatedSearchVolume)} searches/mo
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed">{book.hook}</p>
                    <div className="mt-4 rounded-md bg-muted p-3">
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Target reader
                      </div>
                      <p className="mt-1 text-sm">{book.targetReader}</p>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="mt-3 -ml-2">
                      <Link
                        href={`/tools/topic-explorer?topic=${encodeURIComponent(book.workingTitle)}`}
                      >
                        Validate this volume
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
