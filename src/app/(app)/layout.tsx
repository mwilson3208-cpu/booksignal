import { redirect } from 'next/navigation';
import { AppSidebar } from '@/components/app/app-sidebar';
import { CreditMeter } from '@/components/app/credit-meter';
import { UserMenu } from '@/components/app/user-menu';
import { getAccountState } from '@/lib/account/usage';

/**
 * Every authenticated page reads the session and the user's own rows, so none of it can
 * be prerendered. Declaring it here rather than per-page means a new tool page cannot
 * accidentally ship as static and serve one user's dashboard to another.
 */
export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const account = await getAccountState();
  if (!account) redirect('/login');

  return (
    <div className="min-h-screen">
      <AppSidebar>
        <div className="space-y-3">
          <CreditMeter usage={account.usage} plan={account.plan} />
          <UserMenu email={account.email} name={account.profile.full_name} />
        </div>
      </AppSidebar>
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
