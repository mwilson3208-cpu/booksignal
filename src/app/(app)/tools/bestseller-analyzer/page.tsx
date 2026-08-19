import type { Metadata } from 'next';
import { PageHeader } from '@/components/app/page-header';
import { PreviewNotice } from '@/components/app/preview-notice';
import { BestsellerAnalyzerClient } from '@/components/tools/bestseller-analyzer-client';
import { createClient } from '@/lib/supabase/server';
import type { Project } from '@/lib/supabase/types';

export const metadata: Metadata = { title: 'Bestseller Analyzer' };

export default async function BestsellerAnalyzerPage() {
  const supabase = createClient();
  const { data: projects } = (await supabase?.from('projects').select('id, name').order('name')) ?? {
    data: null,
  };

  return (
    <>
      <PageHeader
        title="Bestseller Analyzer"
        badge="Preview"
        description="Paste any Amazon book URL. See the keywords it ranks for with volume and position, the categories it wins, and save it to a project as a competitor to watch."
      />
      <PreviewNotice>
        URL parsing is real — paste any Amazon product link and the ASIN is extracted correctly. The
        ranking data returned against it is generated sample data rather than a live crawl.
      </PreviewNotice>
      <BestsellerAnalyzerClient
        projects={(projects as Pick<Project, 'id' | 'name'>[] | null) ?? []}
      />
    </>
  );
}
