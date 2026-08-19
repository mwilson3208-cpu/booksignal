import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Verdict } from '@/lib/types';

/**
 * The visual signature of the product. Green GO, amber MAYBE, red SKIP — identical
 * everywhere a verdict appears, so a user can read a dashboard at a glance.
 */
const STYLES: Record<
  Verdict,
  { wrap: string; icon: typeof CheckCircle2; label: string; dot: string }
> = {
  GO: {
    wrap: 'bg-verdict-go-soft text-verdict-go ring-verdict-go/25',
    icon: CheckCircle2,
    label: 'GO',
    dot: 'bg-verdict-go',
  },
  MAYBE: {
    wrap: 'bg-verdict-maybe-soft text-verdict-maybe ring-verdict-maybe/25',
    icon: HelpCircle,
    label: 'MAYBE',
    dot: 'bg-verdict-maybe',
  },
  SKIP: {
    wrap: 'bg-verdict-skip-soft text-verdict-skip ring-verdict-skip/25',
    icon: XCircle,
    label: 'SKIP',
    dot: 'bg-verdict-skip',
  },
};

export function VerdictBadge({
  verdict,
  size = 'md',
  className,
}: {
  verdict: Verdict;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const style = STYLES[verdict];
  const Icon = style.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider ring-1 ring-inset',
        size === 'sm' && 'px-2.5 py-0.5 text-[11px]',
        size === 'md' && 'px-3 py-1 text-xs',
        size === 'lg' && 'px-4 py-1.5 text-sm',
        style.wrap,
        className,
      )}
    >
      <Icon className={cn(size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5')} />
      {style.label}
    </span>
  );
}
