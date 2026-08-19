import { formatCurrency, formatNumber } from '@/lib/utils';
import type { Competitor } from '@/lib/types';

export function CompetitorTable({ competitors }: { competitors: Competitor[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="pb-2 font-medium">#</th>
            <th className="pb-2 font-medium">Title</th>
            <th className="pb-2 text-right font-medium">Price</th>
            <th className="pb-2 text-right font-medium">BSR</th>
            <th className="pb-2 text-right font-medium">Reviews</th>
            <th className="pb-2 text-right font-medium">Est. sales/mo</th>
            <th className="pb-2 text-right font-medium">Est. revenue/mo</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {competitors.map((c) => (
            <tr key={c.asin}>
              <td className="tnum py-3 pr-2 text-muted-foreground">{c.rank}</td>
              <td className="py-3 pr-3">
                <div className="font-medium leading-snug">{c.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {c.author} &middot; {c.format} &middot; {c.publishedYear}
                  {c.traditionallyPublished && ' · traditional'}
                </div>
              </td>
              <td className="tnum py-3 text-right">${c.price.toFixed(2)}</td>
              <td className="tnum py-3 text-right text-muted-foreground">
                {formatNumber(c.bsr)}
              </td>
              <td className="tnum py-3 text-right text-muted-foreground">
                {formatNumber(c.reviews)}
              </td>
              <td className="tnum py-3 text-right">{formatNumber(c.estimatedMonthlySales)}</td>
              <td className="tnum py-3 text-right font-medium">
                {formatCurrency(c.estimatedMonthlyRevenue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
