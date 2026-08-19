import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, Download, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportView } from '@/components/report/report-view';
import { SaveToProject } from '@/components/app/save-to-project';
import { getAccountState } from '@/lib/account/usage';
import { createClient } from '@/lib/supabase/server';
import { canExportPdf } from '@/lib/billing/plans';
import { formatDate } from '@/lib/utils';
import type { Project, ValidationRow } from '@/lib/supabase/types';

interface Props {
  params: { id: string };
}

async function loadValidation(id: string) {
  const supabase = createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from('validations')
    .select('*')
    .eq('id', id)
    .maybeSingle<ValidationRow>();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const validation = await loadValidation(params.id);
  return { title: validation ? `${validation.topic} — ${validation.verdict}` : 'Report' };
}

export default async function ValidationReportPage({ params }: Props) {
  const [validation, account] = await Promise.all([loadValidation(params.id), getAccountState()]);
  if (!validation) notFound();

  const supabase = createClient();
  const { data: projects } = (await supabase
    ?.from('projects')
    .select('id, name')
    .order('name')) ?? { data: null };

  const exportAllowed = account ? canExportPdf(account.plan.id) : false;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/tools/topic-explorer">
            <ArrowLeft className="h-4 w-4" />
            New validation
          </Link>
        </Button>
        <span className="text-xs text-muted-foreground">
          Run {formatDate(validation.created_at)} · engine v{validation.scoring_version}
        </span>
      </div>

      <ReportView
        report={validation.report}
        actions={
          <>
            {exportAllowed ? (
              <Button asChild variant="outline">
                <a href={`/api/validations/${validation.id}/pdf`} target="_blank" rel="noreferrer">
                  <Download className="h-4 w-4" />
                  Export PDF
                </a>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href="/account">
                  <Lock className="h-4 w-4" />
                  PDF export on paid plans
                </Link>
              </Button>
            )}
            <SaveToProject
              validationId={validation.id}
              projectId={validation.project_id}
              projects={(projects as Pick<Project, 'id' | 'name'>[] | null) ?? []}
            />
          </>
        }
      />
    </>
  );
}
