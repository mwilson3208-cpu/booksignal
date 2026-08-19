'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calculator,
  Compass,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  Layers,
  Lightbulb,
  Menu,
  MessageSquare,
  Radar,
  Search,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/brand/logo';
import { cn } from '@/lib/utils';
import { TOOLS } from '@/lib/brand';

const ICONS: Record<string, LucideIcon> = {
  Radar,
  Compass,
  Lightbulb,
  Search,
  Layers,
  MessageSquare,
  Calculator,
};

export function AppSidebar({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const nav = (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
      <div className="space-y-1">
        <NavLink href="/dashboard" icon={LayoutDashboard} active={isActive('/dashboard')} onNavigate={() => setOpen(false)}>
          Dashboard
        </NavLink>
        <NavLink href="/projects" icon={FolderKanban} active={isActive('/projects')} onNavigate={() => setOpen(false)}>
          Projects
        </NavLink>
      </div>

      <div>
        <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tools
        </div>
        <div className="space-y-1">
          {TOOLS.map((tool) => (
            <NavLink
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              icon={ICONS[tool.icon] ?? Radar}
              active={isActive(`/tools/${tool.slug}`)}
              onNavigate={() => setOpen(false)}
              trailing={
                tool.status === 'preview' ? (
                  <Badge variant="muted" className="px-1.5 py-0 text-[10px]">
                    Preview
                  </Badge>
                ) : null
              }
            >
              {tool.name}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="mt-auto space-y-1">
        <NavLink href="/account" icon={CreditCard} active={isActive('/account')} onNavigate={() => setOpen(false)}>
          Account &amp; billing
        </NavLink>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4 lg:hidden">
        <Logo href="/dashboard" />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 top-14 z-30 flex flex-col bg-background lg:hidden">
          {nav}
          {children && <div className="border-t p-4">{children}</div>}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-background lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b px-5">
          <Logo href="/dashboard" />
        </div>
        {nav}
        {children && <div className="border-t p-4">{children}</div>}
      </aside>
    </>
  );
}

function NavLink({
  href,
  icon: Icon,
  active,
  children,
  trailing,
  onNavigate,
}: {
  href: string;
  icon: LucideIcon;
  active: boolean;
  children: React.ReactNode;
  trailing?: React.ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{children}</span>
      {trailing}
    </Link>
  );
}
