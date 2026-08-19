import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/app/page-header';
import { TopicExplorerForm } from '@/components/tools/topic-explorer-form';
import { VerdictBadge } from '@/components/report/verdict-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getAccountState } from '@/lib/account/usage';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import type { ValidationRow } from '@/lib/supabase/types';

export const metadata: Metadata = { title: 'Topic Explorer' };

export default async function TopicExplorerPage() {
  const account = await getAccountState();
  const supabase = createClient();

  const { data: recent } = (await supabase
    ?.from('validations')
    .select('id, topic, score, verdict, created_at')
    .order('created_at', { ascending: false })
    .limit(8)) ?? { data: null };

  return (
    <>
      <PageHeader
        title="Topic Explorer"
        description="Type any book topic. You get search volume, the ten books already competing, a 0-100 score broken into demand, competition and profit potential, and a GO, MAYBE or SKIP verdict with the formula behind it."
      />

      <Card className="mb-8">
        <CardContent className="pt-6">
          <Suspense fallback={<Skeleton className="h-12 w-full" />}>
            <TopicExplorerForm remaining={account?.usage.remaining ?? 0} />
          </Suspense>
        </CardContent>
      </Card>

      {recent && recent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your recent validations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(recent as Pick<ValidationRow, 'id' | 'topic' | 'score' | 'verdict' | 'created_at'>[]).map(
              (row) => (
                <Link
                  key={row.id}
                  href={`/tools/topic-explorer/${row.id}`}
                  className="group flex items-center gap-4 rounded-lg border p-3.5 transition-colors hover:border-primary/40 hover:bg-accent"
                >
                  <span className="tnum w-9 shrink-0 text-center text-lg font-semibold">
                    {row.score}
                  </span>
                  <VerdictBadge verdict={row.verdict} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{row.topic}</span>
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                    {formatDate(row.created_at)}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ),
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
