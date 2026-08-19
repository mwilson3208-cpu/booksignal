import type { Metadata } from 'next';
import { PageHeader } from '@/components/app/page-header';
import { createClient } from '@/lib/supabase/server';
import { PreviewNotice } from '@/components/app/preview-notice';
import { BookIdeasClient } from '@/components/tools/book-ideas-client';

export const metadata: Metadata = { title: 'Book Ideas Generator' };


async function loadProjects() {
  const supabase = createClient();
  const { data } = (await supabase?.from('projects').select('id, name').order('name')) ?? {
    data: null,
  };
  return (data as { id: string; name: string }[] | null) ?? [];
}

export default async function BookIdeasPage({
  searchParams,
}: {
  searchParams: { topic?: string };
}) {
  const projects = await loadProjects();

  return (
    <>
      <PageHeader
        title="Book Ideas Generator"
        badge="Preview"
        description="Turn a validated niche into specific title candidates, each with all seven KDP backend keyword slots and both category slots, formatted to paste straight in."
      />
      <PreviewNotice>
        Titles, keywords and categories are generated from your niche and are yours to use. The
        search volumes attached to them come from the sample data layer.
      </PreviewNotice>
      <BookIdeasClient projects={projects} initialTopic={searchParams.topic ?? ''} />
    </>
  );
}
