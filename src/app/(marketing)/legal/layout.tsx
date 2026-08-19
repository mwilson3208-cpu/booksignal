export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container py-16 sm:py-24">
      <article className="prose-legal mx-auto max-w-3xl [&_h1]:text-4xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_li]:mt-2 [&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-muted-foreground">
        {children}
      </article>
    </div>
  );
}
