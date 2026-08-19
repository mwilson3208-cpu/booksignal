'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn, formatNumber } from '@/lib/utils';
import { NICHE_QUESTIONS, findNiches, type NicheAnswers } from '@/lib/tools/niche-finder';
import { titleCaseTopic } from '@/lib/market/seed';

export function NicheFinderClient() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<NicheAnswers>>({});

  const complete = step >= NICHE_QUESTIONS.length;
  const results = useMemo(
    () => (complete ? findNiches(answers as NicheAnswers) : []),
    [complete, answers],
  );

  if (complete) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{results.length} niches worth a look</h2>
            <p className="text-sm text-muted-foreground">
              Ranked by fit against your answers. Send any one straight to Topic Explorer for a
              full scored report.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAnswers({});
              setStep(0);
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Start over
          </Button>
        </div>

        {results.map((niche, i) => (
          <Card key={niche.topic}>
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <span className="tnum w-8 shrink-0 text-2xl font-semibold text-muted-foreground">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{titleCaseTopic(niche.topic)}</div>
                <p className="mt-1 text-sm text-muted-foreground">{niche.rationale}</p>
                <div className="tnum mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                  <span>{formatNumber(niche.monthlySearchVolume)} searches/mo</span>
                  <span>{formatNumber(niche.competingTitles)} competing titles</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <div className="text-center">
                  <div
                    className={cn(
                      'tnum text-2xl font-semibold',
                      niche.fit >= 65
                        ? 'text-verdict-go'
                        : niche.fit >= 45
                          ? 'text-verdict-maybe'
                          : 'text-verdict-skip',
                    )}
                  >
                    {niche.fit}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Fit
                  </div>
                </div>
                <Button asChild size="sm">
                  <Link href={`/tools/topic-explorer?topic=${encodeURIComponent(niche.topic)}`}>
                    Validate
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const question = NICHE_QUESTIONS[step];

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <div className="mb-6">
          <div className="tnum mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Question {step + 1} of {NICHE_QUESTIONS.length}
            </span>
            <span>{Math.round((step / NICHE_QUESTIONS.length) * 100)}%</span>
          </div>
          <Progress value={(step / NICHE_QUESTIONS.length) * 100} />
        </div>

        <h2 className="text-xl font-semibold tracking-tight">{question.question}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{question.help}</p>

        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {question.options.map((option) => {
            const selected = answers[question.id] === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setAnswers((prev) => ({ ...prev, [question.id]: option.value }));
                  setStep((s) => s + 1);
                }}
                className={cn(
                  'rounded-lg border p-4 text-left text-sm font-medium transition-colors',
                  selected ? 'border-primary bg-primary/5' : 'hover:border-primary/40 hover:bg-accent',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {step > 0 && (
          <Button variant="ghost" size="sm" className="mt-6 -ml-2" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
