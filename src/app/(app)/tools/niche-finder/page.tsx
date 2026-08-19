import type { Metadata } from 'next';
import { PageHeader } from '@/components/app/page-header';
import { createClient } from '@/lib/supabase/server';
import { PreviewNotice } from '@/components/app/preview-notice';
import { NicheFinderClient } from '@/components/tools/niche-finder-client';

export const metadata: Metadata = { title: 'Niche Finder' };


async function loadProjects() {
  const supabase = createClient();
  const { data } = (await supabase?.from('projects').select('id, name').order('name')) ?? {
    data: null,
  };
  return (data as { id: string; name: string }[] | null) ?? [];
}

export default async function NicheFinderPage() {
  const projects = await loadProjects();

  return (
    <>
      <PageHeader
        title="Niche Finder"
        badge="Preview"
        description="Five questions about your experience, expertise and audience turn into a ranked shortlist of niches. Send any one straight to Topic Explorer for a full scored report."
      />
      <PreviewNotice>
        The questionnaire and the ranking are real and deterministic — the same answers always give
        the same shortlist. Search volumes come from the sample data layer, so validate any
        suggestion in Topic Explorer before you act on it.
      </PreviewNotice>
      <NicheFinderClient projects={projects} />
    </>
  );
}
