import type { Metadata } from 'next';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = { title: 'Data & Earnings Disclaimer' };

export default function DisclaimerPage() {
  return (
    <>
      <h1>Data &amp; Earnings Disclaimer</h1>

      <h2>Not affiliated with Amazon</h2>
      <p>{BRAND.amazonDisclaimer}</p>

      <h2>Where the numbers come from</h2>
      <p>
        Version 1 of {BRAND.name} runs on a deterministic sample data layer rather than a live
        marketplace feed. Every report generated from it carries a &quot;Sample data&quot; label in
        the app and on the exported PDF. The sample data is generated from the topic string itself,
        which is what makes the scoring reproducible, but it does not describe any real
        marketplace.
      </p>
      <p>
        Where live data is used, search volume comes from third-party keyword sources and listing
        data from retailer APIs. Both are estimates. Retailers do not publish per-title sales
        figures, so no tool — this one included — can report them.
      </p>

      <h2>How sales estimates are modelled</h2>
      <p>
        Unit sales are derived from Best Sellers Rank using a piecewise power-law curve fitted to
        publicly reported anchor points. The curve is documented in the product and applied
        identically to every title, which makes the estimates useful for comparing books and topics
        against each other. It does not make them accurate for any individual title.
      </p>

      <h2>No earnings guarantee</h2>
      <p>
        Revenue ranges in a report are modelled projections built on stated assumptions, shown
        alongside every estimate. They are not a promise, a forecast, or a representation of typical
        results. Book sales depend on the manuscript, the cover, the listing, the marketing and the
        timing — none of which this tool measures. Many books earn nothing.
      </p>

      <h2>Not professional advice</h2>
      <p>
        Nothing in {BRAND.name} is financial, legal, tax or business advice. Decisions about what to
        write and how to price it are yours.
      </p>
    </>
  );
}
