import * as React from 'react';

/**
 * Stands in for next/link in the static demo bundle. Same props surface, renders a
 * plain anchor. In-app hrefs become hash routes so the single-page demo can navigate.
 */
const Link = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; prefetch?: boolean; replace?: boolean; scroll?: boolean }
>(({ href, prefetch, replace, scroll, children, ...props }, ref) => {
  const resolved = href.startsWith('/tools/') || href === '/dashboard' || href === '/projects' || href === '/account'
    ? `#${href}`
    : href;
  return (
    <a ref={ref} href={resolved} {...props}>
      {children}
    </a>
  );
});
Link.displayName = 'Link';

export default Link;
