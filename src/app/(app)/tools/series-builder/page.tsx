import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/app/page-header';
import { PreviewNotice } from '@/components/app/preview-notice';
import { SeriesBuilderClient } from '@/components/tools/series-builder-client';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = { title: 'Series Builder' };

export default function SeriesBuilderPage() {
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
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <SeriesBuilderClient />
      </Suspense>
    </>
  );
}
