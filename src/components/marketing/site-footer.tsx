import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { BRAND, TOOLS } from '@/lib/brand';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '/#tools', label: 'Tools' },
      { href: '/#pricing', label: 'Pricing' },
      { href: '/#how-it-works', label: 'How it works' },
      { href: '/#faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: `mailto:${BRAND.supportEmail}`, label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/legal/terms', label: 'Terms of Service' },
      { href: '/legal/privacy', label: 'Privacy Policy' },
      { href: '/legal/disclaimer', label: 'Data & Earnings Disclaimer' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr,repeat(4,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{BRAND.tagline}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Tools</h3>
            <ul className="mt-4 space-y-2.5">
              {TOOLS.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t pt-8">
          <p className="max-w-4xl text-xs leading-relaxed text-muted-foreground">
            {BRAND.amazonDisclaimer}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
