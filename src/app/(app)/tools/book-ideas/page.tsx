import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/app/page-header';
import { PreviewNotice } from '@/components/app/preview-notice';
import { BookIdeasClient } from '@/components/tools/book-ideas-client';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = { title: 'Book Ideas Generator' };

export default function BookIdeasPage() {
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
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <BookIdeasClient />
      </Suspense>
    </>
  );
}
