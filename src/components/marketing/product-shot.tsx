import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { ScoreGauge } from '@/components/report/score-gauge';
import { VerdictBadge } from '@/components/report/verdict-badge';
import { generateMarketSnapshot } from '@/lib/market/mock-provider';
import { scoreTopic } from '@/lib/scoring/engine';

/**
 * The product shot on the landing page is the real report UI rendered from the real
 * scoring engine, not a picture of it. Every number below is computed at build time by
 * the same code path a signed-in user hits, so the marketing site can never drift from
 * the product.
 */
const SHOWCASE_TOPIC = 'ai prompt engineering';

export function ProductShot({ className }: { className?: string }) {
  const report = scoreTopic(generateMarketSnapshot(SHOWCASE_TOPIC));
  const ebook = report.pricing.find((p) => p.format === 'ebook')!;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-card shadow-2xl shadow-primary/5 ring-1 ring-black/5',
        className,
      )}
    >
      {/* chrome */}
      <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <div className="ml-3 truncate rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
          booksignal.app/tools/topic-explorer
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <ScoreGauge score={report.score} verdict={report.verdict} size={124} />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <VerdictBadge verdict={report.verdict} />
            <div className="mt-3 truncate text-lg font-semibold capitalize">{report.topic}</div>
            <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
              {report.verdictReason}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {report.factors.map((f) => (
            <div key={f.key}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">{f.label}</span>
                <span className="tnum text-muted-foreground">
                  {f.score.toFixed(1)} × {f.weight.toFixed(2)} ={' '}
                  <span className="font-medium text-foreground">{f.contribution.toFixed(1)}</span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full',
                    f.score >= 70
                      ? 'bg-verdict-go'
                      : f.score >= 45
                        ? 'bg-verdict-maybe'
                        : 'bg-verdict-skip',
                  )}
                  style={{ width: `${f.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t pt-5 text-center">
          <MiniStat label="Searches/mo" value={formatNumber(report.market.monthlySearchVolume)} />
          <MiniStat label="Ebook price" value={`$${ebook.recommended.toFixed(2)}`} />
          <MiniStat label="Revenue/mo" value={formatCurrency(report.revenue.mid)} />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="tnum text-base font-semibold sm:text-lg">{value}</div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

/** Compact verdict-card preview used inside the feature grid. */
export function ToolPreview({ slug }: { slug: string }) {
  const previews: Record<string, React.ReactNode> = {
    'topic-explorer': <TopicExplorerPreview />,
    'niche-finder': <NicheFinderPreview />,
    'book-ideas': <BookIdeasPreview />,
    'bestseller-analyzer': <AnalyzerPreview />,
    'series-builder': <SeriesPreview />,
    coach: <CoachPreview />,
    'bsr-calculator': <BsrPreview />,
  };
  return (
    <div className="overflow-hidden rounded-lg border bg-muted/30 p-3">
      {previews[slug] ?? <div className="h-20" />}
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[11px]">
      <span className="truncate text-muted-foreground">{label}</span>
      <span className={cn('tnum shrink-0 font-medium', tone)}>{value}</span>
    </div>
  );
}

function TopicExplorerPreview() {
  const report = scoreTopic(generateMarketSnapshot('sourdough baking'));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <VerdictBadge verdict={report.verdict} size="sm" />
        <span className="tnum text-lg font-semibold">{report.score}</span>
      </div>
      {report.factors.map((f) => (
        <div key={f.key} className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full rounded-full',
              f.score >= 70 ? 'bg-verdict-go' : f.score >= 45 ? 'bg-verdict-maybe' : 'bg-verdict-skip',
            )}
            style={{ width: `${f.score}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function NicheFinderPreview() {
  return (
    <div className="space-y-1.5">
      <Row label="1. Habit design for shift workers" value="3,100/mo" tone="text-verdict-go" />
      <Row label="2. Meal prep for night shifts" value="1,850/mo" tone="text-verdict-go" />
      <Row label="3. Sleep debt recovery" value="940/mo" tone="text-verdict-maybe" />
      <Row label="4. Commuter strength training" value="610/mo" tone="text-verdict-maybe" />
    </div>
  );
}

function BookIdeasPreview() {
  return (
    <div className="space-y-1.5 text-[11px]">
      <div className="font-medium">The Night Shift Reset</div>
      <div className="text-muted-foreground">Subtitle: A 30-day plan for people who work while the world sleeps</div>
      <div className="mt-2 flex flex-wrap gap-1">
        {['shift work sleep', 'night shift health', 'circadian reset'].map((k) => (
          <span key={k} className="rounded bg-background px-1.5 py-0.5 text-[10px]">
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}

function AnalyzerPreview() {
  return (
    <div className="space-y-1.5">
      <Row label="sourdough starter guide" value="#3 · 2,400/mo" tone="text-verdict-go" />
      <Row label="no knead bread" value="#11 · 1,700/mo" tone="text-verdict-maybe" />
      <Row label="artisan baking book" value="#28 · 880/mo" />
      <Row label="Category: Bread Baking" value="#1" tone="text-verdict-go" />
    </div>
  );
}

function SeriesPreview() {
  return (
    <div className="space-y-1.5 text-[11px]">
      {['Book 1 — The Starter', 'Book 2 — The Loaf', 'Book 3 — The Bakery'].map((b) => (
        <div key={b} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="truncate">{b}</span>
        </div>
      ))}
    </div>
  );
}

function CoachPreview() {
  return (
    <div className="space-y-2 text-[11px]">
      <div className="ml-auto w-fit max-w-[85%] rounded-lg bg-primary px-2.5 py-1.5 text-primary-foreground">
        Why did this score 46?
      </div>
      <div className="w-fit max-w-[90%] rounded-lg bg-background px-2.5 py-1.5">
        Demand is fine at 69, but the review wall is the problem — the median top-ten title has
        1,400 reviews.
      </div>
    </div>
  );
}

function BsrPreview() {
  return (
    <div className="space-y-1.5">
      <Row label="BSR entered" value="#18,400" />
      <Row label="Est. sales/day" value="7.2" tone="text-verdict-go" />
      <Row label="Est. sales/month" value="219" tone="text-verdict-go" />
      <Row label="Revenue at $6.99" value="$1,531" tone="text-verdict-go" />
    </div>
  );
}
