import * as React from 'react';

/**
 * Stands in for next/link in the static demo.
 *
 * The demo is one page, so every internal route has to become a hash. Anything left as
 * a plain path would navigate away from the artifact and 404, which is what used to
 * happen to the sign-up and log-in CTAs.
 */

/** Routes the demo renders under a `#/...` hash. */
const DEMO_ROUTES = [
  '/dashboard',
  '/projects',
  '/account',
  '/onboarding',
  '/about',
  '/legal/terms',
  '/legal/privacy',
  '/legal/disclaimer',
];

/** There are no accounts in the demo, so the auth CTAs go where they were headed. */
const AUTH_DESTINATION = '#/tools/topic-explorer';

export function resolveHref(href: string): string {
  if (!href) return '#/';
  if (href.startsWith('#') || href.startsWith('mailto:') || /^https?:\/\//.test(href)) return href;

  // "/#pricing" and friends are same-page anchors on the landing page.
  if (href.startsWith('/#')) return href.slice(1);
  if (href === '/') return '#/';

  if (href === '/signup' || href === '/login' || href.startsWith('/login?')) {
    return AUTH_DESTINATION;
  }

  const path = href.split('?')[0].split('#')[0];
  if (path.startsWith('/tools/') || DEMO_ROUTES.includes(path)) return `#${href}`;

  // Anything else has no demo equivalent; keep the user on the page.
  return '#/';
}

const Link = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    prefetch?: boolean;
    replace?: boolean;
    scroll?: boolean;
  }
>(({ href, prefetch, replace, scroll, children, ...props }, ref) => (
  <a ref={ref} href={resolveHref(href)} {...props}>
    {children}
  </a>
));
Link.displayName = 'Link';

export default Link;
