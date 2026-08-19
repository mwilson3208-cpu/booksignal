import Link from 'next/link';
import type { Metadata } from 'next';
import { FolderKanban } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/app/page-header';
import { NewProjectDialog } from '@/components/app/new-project-dialog';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import type { Project } from '@/lib/supabase/types';

export const metadata: Metadata = { title: 'Projects' };

export default async function ProjectsPage() {
  const supabase = createClient();
  const { data: projects } = (await supabase
    ?.from('projects')
    .select('*')
    .order('created_at', { ascending: false })) ?? { data: null };

  const { data: counts } = (await supabase
    ?.from('validations')
    .select('project_id')) ?? { data: null };

  const validationCounts = ((counts as { project_id: string | null }[] | null) ?? []).reduce<
    Record<string, number>
  >((acc, row) => {
    if (row.project_id) acc[row.project_id] = (acc[row.project_id] ?? 0) + 1;
    return acc;
  }, {});

  const list = (projects as Project[] | null) ?? [];

  return (
    <>
      <PageHeader
        title="Projects"
        description="File validations, competitors and ideas under the book they belong to."
        actions={<NewProjectDialog />}
      />

      {list.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FolderKanban className="h-6 w-6" />
            </span>
            <h2 className="font-medium">No projects yet</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Create one for the book you are working on, then save validations into it from any
              report.
            </p>
            <div className="mt-2">
              <NewProjectDialog />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="h-full transition-colors hover:border-primary/40">
                <CardContent className="p-5">
                  <FolderKanban className="h-5 w-5 text-primary" />
                  <h2 className="mt-3 font-semibold tracking-tight">{project.name}</h2>
                  {project.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                  <p className="tnum mt-4 text-xs text-muted-foreground">
                    {validationCounts[project.id] ?? 0} validation
                    {validationCounts[project.id] === 1 ? '' : 's'} · created{' '}
                    {formatDate(project.created_at)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
