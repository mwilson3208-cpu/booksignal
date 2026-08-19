import type { Metadata } from 'next';
import { PageHeader } from '@/components/app/page-header';
import { createClient } from '@/lib/supabase/server';
import { PreviewNotice } from '@/components/app/preview-notice';
import { SeriesBuilderClient } from '@/components/tools/series-builder-client';

export const metadata: Metadata = { title: 'Series Builder' };


async function loadProjects() {
  const supabase = createClient();
  const { data } = (await supabase?.from('projects').select('id, name').order('name')) ?? {
    data: null,
  };
  return (data as { id: string; name: string }[] | null) ?? [];
}

export default async function SeriesBuilderPage({
  searchParams,
}: {
  searchParams: { topic?: string };
}) {
  const projects = await loadProjects();

  return (
    <>
      <PageHeader
        title="Series Builder"
        badge="Preview"
        description="Expand one validated topic into a three-to-five book series. Each volume gets a working title, a hook and the reader it is written for, staged so that finishing one book makes the next one the obvious purchase."
      />
      <PreviewNotice>
        The series arc and the copy are real output you can work from. The per-volume search volumes
        come from the sample data layer.
      </PreviewNotice>
      <SeriesBuilderClient projects={projects} initialTopic={searchParams.topic ?? ''} />
    </>
  );
}
