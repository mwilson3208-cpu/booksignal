import type { Metadata } from 'next';
import { PageHeader } from '@/components/app/page-header';
import { PreviewNotice } from '@/components/app/preview-notice';
import { NicheFinderClient } from '@/components/tools/niche-finder-client';

export const metadata: Metadata = { title: 'Niche Finder' };

export default function NicheFinderPage() {
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
      <NicheFinderClient />
    </>
  );
}
