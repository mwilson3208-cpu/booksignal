import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { ReportDocument } from '@/lib/pdf/report-document';
import { createClient } from '@/lib/supabase/server';
import { getAccountState } from '@/lib/account/usage';
import { canExportPdf } from '@/lib/billing/plans';
import { slugify } from '@/lib/utils';
import type { ValidationRow } from '@/lib/supabase/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Streams a saved report as a PDF. RLS scopes the lookup to the signed-in user. */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const account = await getAccountState();
  if (!account) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }
  if (!canExportPdf(account.plan.id)) {
    return NextResponse.json(
      { error: 'PDF export is available on the Standard and Pro plans.' },
      { status: 403 },
    );
  }

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  }

  const { data: validation } = await supabase
    .from('validations')
    .select('*')
    .eq('id', params.id)
    .maybeSingle<ValidationRow>();

  if (!validation) {
    return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
  }

  const buffer = await renderToBuffer(<ReportDocument report={validation.report} />);
  const filename = `booksignal-${slugify(validation.topic) || 'report'}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
