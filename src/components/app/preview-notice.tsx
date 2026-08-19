import { FlaskConical } from 'lucide-react';

/**
 * Shown on every tool that runs on generated data rather than a live feed. Non-dismissible
 * on purpose: a user should never be unsure which numbers are real.
 */
export function PreviewNotice({ children }: { children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex gap-3 rounded-lg border border-verdict-maybe/30 bg-verdict-maybe-soft p-4 text-sm text-verdict-maybe">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="space-y-1">
        <p className="font-medium">Preview tool — sample data</p>
        <p className="leading-relaxed opacity-90">
          {children ??
            'The interface and the workflow are real. The numbers are generated sample data, deterministic per input, and are not drawn from a live marketplace feed.'}
        </p>
      </div>
    </div>
  );
}
