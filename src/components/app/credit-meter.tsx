import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Plan } from '@/lib/billing/plans';
import type { UsageState } from '@/lib/account/usage';

export function CreditMeter({
  usage,
  plan,
  className,
}: {
  usage: UsageState;
  plan: Plan;
  className?: string;
}) {
  const exhausted = usage.remaining === 0;
  const low = usage.remaining > 0 && usage.percentUsed >= 80;

  return (
    <div className={cn('rounded-lg border bg-card p-3.5', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {plan.name} plan
        </span>
        <span className="tnum text-xs text-muted-foreground">
          {usage.used}/{usage.limit}
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            exhausted ? 'bg-verdict-skip' : low ? 'bg-verdict-maybe' : 'bg-primary',
          )}
          style={{ width: `${usage.percentUsed}%` }}
        />
      </div>

      <p className="tnum mt-2 text-xs text-muted-foreground">
        {exhausted ? (
          <>No validations left this cycle</>
        ) : (
          <>
            <span className="font-medium text-foreground">{usage.remaining}</span> validation
            {usage.remaining === 1 ? '' : 's'} left
          </>
        )}
        {' · resets '}
        {new Date(usage.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </p>

      {(exhausted || low || plan.id === 'free') && (
        <Button asChild size="sm" variant={exhausted ? 'default' : 'outline'} className="mt-3 w-full">
          <Link href="/account">Upgrade plan</Link>
        </Button>
      )}
    </div>
  );
}
