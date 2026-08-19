import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight, FolderKanban, Plus, Radar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/app/page-header';
import { VerdictBadge } from '@/components/report/verdict-badge';
import { getAccountState } from '@/lib/account/usage';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import type { Project, ValidationRow } from '@/lib/supabase/types';
import type { Verdict } from '@/lib/types';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const account = await getAccountState();
  if (!account) redirect('/login');

  // First-time users land in onboarding, which routes them to the right starting tool.
  if (!account.profile.onboarded_at) redirect('/onboarding');

  const supabase = createClient();
  const [validationsResult, projectsResult] = await Promise.all([
    supabase
      ?.from('validations')
      .select('id, topic, score, verdict, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      ?.from('projects')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(4),
  ]);

  const validations = (validationsResult?.data ?? []) as Pick<
    ValidationRow,
    'id' | 'topic' | 'score' | 'verdict' | 'created_at'
  >[];
  const projects = (projectsResult?.data ?? []) as Pick<Project, 'id' | 'name' | 'created_at'>[];

  const counts = validations.reduce<Record<Verdict, number>>(
    (acc, v) => ({ ...acc, [v.verdict]: acc[v.verdict] + 1 }),
    { GO: 0, MAYBE: 0, SKIP: 0 },
  );

  const firstName = account.profile.full_name?.split(' ')[0];

  return (
    <>
      <PageHeader
        title={firstName ? `Welcome back, ${firstName}` : 'Dashboard'}
        description="Your recent validations, the credits left in this cycle, and where to pick up."
        actions={
          <Button asChild>
            <Link href="/tools/topic-explorer">
              <Radar className="h-4 w-4" />
              Validate a topic
            </Link>
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Validations left"
          value={`${account.usage.remaining}`}
          sub={`of ${account.usage.limit} this cycle`}
        />
        <MetricCard label="GO verdicts" value={`${counts.GO}`} sub="in your last 10" tone="go" />
        <MetricCard
          label="MAYBE verdicts"
          value={`${counts.MAYBE}`}
          sub="in your last 10"
          tone="maybe"
        />
        <MetricCard label="SKIP verdicts" value={`${counts.SKIP}`} sub="in your last 10" tone="skip" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr] lg:items-start">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent validations</CardTitle>
            {validations.length > 0 && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/tools/topic-explorer">New</Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {validations.length === 0 ? (
              <EmptyState
                icon={<Radar className="h-6 w-6" />}
                title="Nothing validated yet"
                body="Put your first topic through Topic Explorer and you will have a full scored report in under ninety seconds."
                action={
                  <Button asChild>
                    <Link href="/tools/topic-explorer">Validate a topic</Link>
                  </Button>
                }
              />
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
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Projects</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/projects">
                <Plus className="h-4 w-4" />
                New
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <EmptyState
                icon={<FolderKanban className="h-6 w-6" />}
                title="No projects yet"
                body="Projects hold the validations, ideas and competitors for one book."
                action={
                  <Button asChild variant="outline">
                    <Link href="/projects">Create a project</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-3 rounded-lg border p-3.5 text-sm transition-colors hover:border-primary/40 hover:bg-accent"
                  >
                    <FolderKanban className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate font-medium">{project.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function MetricCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: 'go' | 'maybe' | 'skip';
}) {
  const toneClass =
    tone === 'go'
      ? 'text-verdict-go'
      : tone === 'maybe'
        ? 'text-verdict-maybe'
        : tone === 'skip'
          ? 'text-verdict-skip'
          : '';
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className={`tnum mt-1.5 text-3xl font-semibold ${toneClass}`}>{value}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </span>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">{body}</p>
      </div>
      <div className="mt-1">{action}</div>
    </div>
  );
}
