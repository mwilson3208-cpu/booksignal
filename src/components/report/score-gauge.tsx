import { cn } from '@/lib/utils';
import type { Verdict } from '@/lib/types';

const STROKE: Record<Verdict, string> = {
  GO: 'stroke-verdict-go',
  MAYBE: 'stroke-verdict-maybe',
  SKIP: 'stroke-verdict-skip',
};

const TEXT: Record<Verdict, string> = {
  GO: 'text-verdict-go',
  MAYBE: 'text-verdict-maybe',
  SKIP: 'text-verdict-skip',
};

/** Radial 0-100 gauge. Renders as a single SVG so it prints and screenshots cleanly. */
export function ScoreGauge({
  score,
  verdict,
  size = 168,
  className,
}: {
  score: number;
  verdict: Verdict;
  size?: number;
  className?: string;
}) {
  const stroke = size * 0.085;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  // Three-quarter arc, rotated so the gap sits at the bottom.
  const arc = circumference * 0.75;
  const filled = arc * (Math.min(100, Math.max(0, score)) / 100);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-[225deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arc} ${circumference}`}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          className={STROKE[verdict]}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('tnum font-semibold leading-none', TEXT[verdict])} style={{ fontSize: size * 0.3 }}>
          {score}
        </span>
        <span className="mt-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          / 100
        </span>
      </div>
    </div>
  );
}
