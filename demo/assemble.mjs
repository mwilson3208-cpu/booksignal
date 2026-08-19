import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const css = readFileSync('demo/dist/styles.css', 'utf8');
const js = readFileSync('demo/dist/bundle.js', 'utf8');

// The bundle is inlined, so any literal </script> inside it would close the tag early.
const safeJs = js.replace(/<\/script/gi, '<\\/script');

const html = `<title>Book Demand Lab</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
<style>
:root { --font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
${css}
</style>
<div id="root"></div>
<noscript>
  <div style="max-width:44rem;margin:6rem auto;padding:0 1.5rem;font-family:var(--font-sans);line-height:1.6">
    <h1 style="font-size:1.75rem;font-weight:600;letter-spacing:-0.02em">Book Demand Lab</h1>
    <p style="margin-top:1rem;color:hsl(var(--muted-foreground))">
      This demo runs the scoring engine in your browser, so it needs JavaScript enabled.
      The source is at
      <a href="https://github.com/mwilson3208-cpu/booksignal">github.com/mwilson3208-cpu/booksignal</a>.
    </p>
  </div>
</noscript>
<script>
${safeJs}
</script>
`;

mkdirSync('demo/dist', { recursive: true });
writeFileSync('demo/dist/book-demand-lab-demo.html', html);
console.log(`book-demand-lab-demo.html: ${(html.length / 1024).toFixed(0)} KB`);
