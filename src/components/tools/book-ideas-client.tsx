'use client';

import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CopyButton } from './copy-button';
import { generateBookIdeas, type BookIdea } from '@/lib/tools/book-ideas';
import { formatNumber } from '@/lib/utils';
import { SaveIdeaButton } from '@/components/app/save-idea-button';

export function BookIdeasClient({
  projects = [],
  initialTopic = '',
}: {
  projects?: { id: string; name: string }[];
  /** Handed over from a validated report, so the topic never has to be retyped. */
  initialTopic?: string;
}) {
  const [topic, setTopic] = useState(initialTopic);
  const [ideas, setIdeas] = useState<BookIdea[]>(() =>
    initialTopic.trim().length >= 3 ? generateBookIdeas(initialTopic) : [],
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (topic.trim().length >= 3) setIdeas(generateBookIdeas(topic));
            }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="A validated niche, e.g. sourdough baking for beginners"
              className="h-12 flex-1 text-base"
              maxLength={120}
              aria-label="Niche"
            />
            <Button type="submit" size="lg" className="h-12 sm:w-44" disabled={topic.trim().length < 3}>
              <Lightbulb className="h-4 w-4" />
              Generate ideas
            </Button>
          </form>
        </CardContent>
      </Card>

      {ideas.map((idea) => (
        <Card key={idea.title}>
          <CardContent className="space-y-5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold tracking-tight">{idea.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{idea.subtitle}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <CopyButton value={`${idea.title}: ${idea.subtitle}`} label="Copy title" />
                <SaveIdeaButton
                  kind="book_idea"
                  title={idea.title}
                  payload={idea as unknown as Record<string, unknown>}
                  projects={projects}
                  label="Save"
                />
              </div>
            </div>

            <p className="text-sm leading-relaxed">{idea.hook}</p>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Backend keywords — all 7 KDP slots
                </span>
                <CopyButton value={idea.backendKeywords.join('\n')} label="Copy keywords" />
              </div>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {idea.backendKeywords.map((keyword, i) => (
                  <div
                    key={keyword}
                    className="flex items-center gap-2 rounded-md bg-muted px-2.5 py-1.5 text-sm"
                  >
                    <span className="tnum w-4 shrink-0 text-xs text-muted-foreground">{i + 1}.</span>
                    <span className="truncate">{keyword}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Categories — both KDP slots
                </span>
                <CopyButton value={idea.categories.join('\n')} label="Copy categories" />
              </div>
              <div className="space-y-1.5">
                {idea.categories.map((category) => (
                  <div key={category} className="rounded-md bg-muted px-2.5 py-1.5 text-sm">
                    {category}
                  </div>
                ))}
              </div>
            </div>

            <p className="tnum text-xs text-muted-foreground">
              Parent niche demand: {formatNumber(idea.estimatedSearchVolume)} searches/mo
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
