import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BRAND } from '@/lib/brand';

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground',
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19V6a2 2 0 0 1 2-2h9" />
        <path d="M4 19h13a2 2 0 0 0 2-2V9" />
        <path d="M8 15l3-4 3 2.5L20 6" />
      </svg>
    </span>
  );
}

export function Logo({ className, href = '/' }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="text-lg font-semibold tracking-tight">{BRAND.name}</span>
    </Link>
  );
}
