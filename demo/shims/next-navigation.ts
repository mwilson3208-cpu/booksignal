/** next/navigation stand-ins for the static demo. Reads params off the hash. */

export function useSearchParams(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams();
  const hash = window.location.hash.slice(1);
  const query = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
  return new URLSearchParams(query);
}

export function usePathname(): string {
  if (typeof window === 'undefined') return '/';
  const hash = window.location.hash.slice(1);
  return (hash.split('?')[0] || '/') as string;
}

export function useRouter() {
  return {
    push: (href: string) => {
      window.location.hash = href;
    },
    replace: (href: string) => {
      window.location.hash = href;
    },
    refresh: () => {},
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    prefetch: () => {},
  };
}

export function redirect(href: string): never {
  window.location.hash = href;
  throw new Error('redirect');
}

export function notFound(): never {
  throw new Error('not found');
}
