import * as esbuild from 'esbuild';
import path from 'node:path';

const root = process.cwd();

/** Maps Next-only modules and server actions onto the static demo's stand-ins. */
const shim = {
  name: 'demo-shims',
  setup(build) {
    const map = {
      'next/link': 'demo/shims/next-link.tsx',
      'next/navigation': 'demo/shims/next-navigation.ts',
      '@/lib/actions/validation': 'demo/shims/actions.ts',
      '@/lib/actions/competitors': 'demo/shims/actions.ts',
      '@/lib/actions/projects': 'demo/shims/actions.ts',
      '@/lib/actions/onboarding': 'demo/shims/actions.ts',
    };
    for (const [from, to] of Object.entries(map)) {
      const filter = new RegExp(`^${from.replace(/[/@]/g, '\\$&')}$`);
      build.onResolve({ filter }, () => ({ path: path.join(root, to) }));
    }
    build.onResolve({ filter: /^server-only$/ }, () => ({
      path: 'server-only',
      namespace: 'empty',
    }));
    build.onLoad({ filter: /.*/, namespace: 'empty' }, () => ({ contents: '' }));
  },
};

await esbuild.build({
  entryPoints: ['demo/main.tsx'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  jsx: 'automatic',
  outfile: 'demo/dist/bundle.js',
  define: { 'process.env.NODE_ENV': '"production"' },
  loader: { '.svg': 'text' },
  plugins: [shim],
  alias: { '@': path.join(root, 'src') },
  logLevel: 'info',
});
