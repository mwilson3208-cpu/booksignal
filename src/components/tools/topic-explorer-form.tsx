'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { runValidation } from '@/lib/actions/validation';
import { cn } from '@/lib/utils';

const EXAMPLES = [
  'sourdough baking',
  'intermittent fasting for women over 40',
  'notion templates',
  'grief after loss',
];

/** The stages shown while a validation runs. Cosmetic, but they mirror the real pipeline. */
const STAGES = [
  'Normalizing the topic',
  'Pulling search volume',
  'Reading the competing shelf',
  'Estimating sales from rank',
  'Scoring demand, competition and profit',
];

export function TopicExplorerForm({
  remaining,
  projectId,
  initialTopic = '',
}: {
  remaining: number;
  projectId?: string;
  /** Prefilled when arriving from a niche suggestion or a series volume. */
  initialTopic?: string;
}) {
  const router = useRouter();
  const [topic, setTopic] = useState(initialTopic);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [stage, setStage] = useState(0);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Advance the stage indicator while the server action is in flight.
  useEffect(() => {
    if (!pending) {
      setStage(0);
      return;
    }
    const id = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 550);
    return () => clearInterval(id);
  }, [pending]);

  function submit(value: string) {
    setError(null);
    setLimitReached(false);
    startTransition(async () => {
      const result = await runValidation(value, projectId ?? null);
      if (result.ok) {
        router.push(`/tools/topic-explorer/${result.id}`);
        router.refresh();
      } else {
        setError(result.error);
        setLimitReached(result.code === 'limit_reached');
      }
    });
  }

  const disabled = pending || remaining <= 0;

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(topic);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <Input
          ref={inputRef}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Type a book topic, e.g. sourdough baking"
          className="h-12 flex-1 text-base"
          maxLength={120}
          disabled={pending}
          aria-label="Book topic"
        />
        <Button type="submit" size="lg" className="h-12 sm:w-44" disabled={disabled || !topic.trim()}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Validating
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Validate topic
            </>
          )}
        </Button>
      </form>

      {pending && (
        <div className="rounded-lg border bg-card p-4">
          <div className="space-y-2">
            {STAGES.map((label, i) => (
              <div
                key={label}
                className={cn(
                  'flex items-center gap-2.5 text-sm transition-colors',
                  i < stage ? 'text-muted-foreground' : i === stage ? 'text-foreground' : 'text-muted-foreground/40',
                )}
              >
                <span
                  className={cn(
                    'inline-block h-1.5 w-1.5 shrink-0 rounded-full',
                    i < stage ? 'bg-primary' : i === stage ? 'animate-pulse bg-primary' : 'bg-muted',
                  )}
                />
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {!pending && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Try:</span>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setTopic(example);
                inputRef.current?.focus();
              }}
              className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {example}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div
          className={cn(
            'flex flex-col gap-3 rounded-lg border p-4 text-sm sm:flex-row sm:items-center sm:justify-between',
            limitReached
              ? 'border-verdict-maybe/30 bg-verdict-maybe-soft text-verdict-maybe'
              : 'border-destructive/30 bg-destructive/5 text-destructive',
          )}
        >
          <div className="flex gap-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
          {limitReached && (
            <Button asChild size="sm" className="shrink-0">
              <Link href="/account">
                Upgrade
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
