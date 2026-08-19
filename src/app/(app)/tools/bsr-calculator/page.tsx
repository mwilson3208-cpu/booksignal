import type { Metadata } from 'next';
import { PageHeader } from '@/components/app/page-header';
import { BsrCalculatorClient } from '@/components/tools/bsr-calculator-client';

export const metadata: Metadata = { title: 'BSR Calculator' };

export default function BsrCalculatorPage() {
  return (
    <>
      <PageHeader
        title="BSR Calculator"
        badge="Live in v1"
        description="Enter any Amazon Best Sellers Rank to read off estimated daily, monthly and yearly unit sales, plus what those units are worth at your list price after the royalty."
      />
      <BsrCalculatorClient />
    </>
  );
}
