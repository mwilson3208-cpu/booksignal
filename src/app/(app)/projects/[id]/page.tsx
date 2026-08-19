import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, BookMarked, Lightbulb, Radar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VerdictBadge } from '@/components/report/verdict-badge';
import { PageHeader } from '@/components/app/page-header';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatNumber } from '@/lib/utils';
import type { Project, SavedCompetitor, SavedIdea, ValidationRow } from '@/lib/supabase/types';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  const { data } = (await supabase
    ?.from('projects')
    .select('name')
    .eq('id', params.id)
    .maybeSingle<{ name: string }>()) ?? { data: null };
  return { title: data?.name ?? 'Project' };
}

export default async function ProjectDetailPage({ params }: Props) {
  const supabase = createClient();
  if (!supabase) notFound();

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .maybeSingle<Project>();

  if (!project) notFound();

  const [validationsResult, competitorsResult, ideasResult] = await Promise.all([
    supabase
      .from('validations')
      .select('id, topic, score, verdict, created_at')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('saved_competitors')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('saved_ideas')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false }),
  ]);

  const validations = (validationsResult.data ?? []) as Pick<
    ValidationRow,
    'id' | 'topic' | 'score' | 'verdict' | 'created_at'
  >[];
  const competitors = (competitorsResult.data ?? []) as SavedCompetitor[];
  const ideas = (ideasResult.data ?? []) as SavedIdea[];

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
        <Link href="/projects">
          <ArrowLeft className="h-4 w-4" />
          All projects
        </Link>
      </Button>

      <PageHeader
        title={project.name}
        description={project.description ?? undefined}
        actions={
          <Button asChild>
            <Link href="/tools/topic-explorer">
              <Radar className="h-4 w-4" />
              Validate a topic
            </Link>
          </Button>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Validations ({validations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {validations.length === 0 ? (
              <Empty text="No validations filed here yet. Open any report and use Save to project." />
            ) : (
              <div className="space-y-2">
                {validations.map((validation) => (
                  <Link
                    key={validation.id}
                    href={`/tools/topic-explorer/${validation.id}`}
                    className="group flex items-center gap-4 rounded-lg border p-3.5 transition-colors hover:border-primary/40 hover:bg-accent"
                  >
                    <span className="tnum w-9 shrink-0 text-center text-lg font-semibold">
                      {validation.score}
                    </span>
                    <VerdictBadge verdict={validation.verdict} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {validation.topic}
                    </span>
                    <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                      {formatDate(validation.created_at)}
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Competitors ({competitors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {competitors.length === 0 ? (
              <Empty text="Nothing saved from the Bestseller Analyzer yet." />
            ) : (
              <div className="space-y-2">
                {competitors.map((competitor) => {
                  const snapshot = competitor.snapshot as { bsr?: number; price?: number };
                  return (
                    <div
                      key={competitor.id}
                      className="flex items-center gap-3 rounded-lg border p-3.5"
                    >
                      <BookMarked className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{competitor.title}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {competitor.author} · {competitor.asin}
                        </div>
                      </div>
                      {typeof snapshot.bsr === 'number' && (
                        <span className="tnum shrink-0 text-xs text-muted-foreground">
                          #{formatNumber(snapshot.bsr)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ideas ({ideas.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {ideas.length === 0 ? (
              <Empty text="Nothing saved from Niche Finder, Book Ideas or Series Builder yet." />
            ) : (
              <div className="space-y-2">
                {ideas.map((idea) => (
                  <div key={idea.id} className="flex items-center gap-3 rounded-lg border p-3.5">
                    <Lightbulb className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{idea.title}</span>
                    <span className="shrink-0 text-xs capitalize text-muted-foreground">
                      {idea.kind.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{text}</p>;
}
