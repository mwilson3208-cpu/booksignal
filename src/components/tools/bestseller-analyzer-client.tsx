'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { AlertCircle, Check, FolderPlus, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { analyzeBook, type BookAnalysis } from '@/lib/tools/bestseller-analyzer';
import { saveCompetitor } from '@/lib/actions/competitors';
import { formatCurrency, formatNumber } from '@/lib/utils';

export function BestsellerAnalyzerClient({
  projects,
}: {
  projects: { id: string; name: string }[];
}) {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState<BookAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedTo, setSavedTo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSavedTo(null);
              const result = analyzeBook(url);
              if (!result) {
                setError('That does not look like an Amazon book URL. Paste a /dp/ or /gp/product/ link, or the 10-character ASIN on its own.');
                setAnalysis(null);
                return;
              }
              setError(null);
              setAnalysis(result);
            }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.amazon.com/dp/B0..."
              className="h-12 flex-1 text-base"
              aria-label="Amazon book URL"
            />
            <Button type="submit" size="lg" className="h-12 sm:w-40" disabled={!url.trim()}>
              <Search className="h-4 w-4" />
              Analyze
            </Button>
          </form>

          {error && (
            <div className="mt-4 flex gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold tracking-tight">{analysis.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {analysis.author} · ASIN {analysis.asin}
                  </p>
                </div>
                {projects.length === 0 ? (
                  <Button asChild variant="outline">
                    <Link href="/projects">
                      <FolderPlus className="h-4 w-4" />
                      Create a project to save
                    </Link>
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" disabled={pending}>
                        {pending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : savedTo ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <FolderPlus className="h-4 w-4" />
                        )}
                        {savedTo ? `Saved to ${savedTo}` : 'Save competitor'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Save to</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {projects.map((project) => (
                        <DropdownMenuItem
                          key={project.id}
                          onSelect={() =>
                            startTransition(async () => {
                              await saveCompetitor({
                                asin: analysis.asin,
                                title: analysis.title,
                                author: analysis.author,
                                sourceUrl: analysis.sourceUrl,
                                snapshot: analysis as unknown as Record<string, unknown>,
                                projectId: project.id,
                              });
                              setSavedTo(project.name);
                            })
                          }
                        >
                          <span className="flex-1 truncate">{project.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
                <Stat label="Price" value={`$${analysis.price.toFixed(2)}`} />
                <Stat label="BSR" value={`#${formatNumber(analysis.bsr)}`} />
                <Stat label="Reviews" value={formatNumber(analysis.reviews)} />
                <Stat label="Est. sales/mo" value={formatNumber(analysis.estimatedMonthlySales)} />
                <Stat
                  label="Est. revenue/mo"
                  value={formatCurrency(analysis.estimatedMonthlyRevenue)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Keywords it ranks for</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="pb-2 font-medium">Keyword</th>
                      <th className="pb-2 text-right font-medium">Position</th>
                      <th className="pb-2 text-right font-medium">Searches/mo</th>
                      <th className="pb-2 text-right font-medium">Competing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {analysis.keywords.map((k) => (
                      <tr key={k.keyword}>
                        <td className="py-2.5 pr-3">{k.keyword}</td>
                        <td className="tnum py-2.5 text-right">
                          <span
                            className={
                              k.position <= 10
                                ? 'font-medium text-verdict-go'
                                : k.position <= 30
                                  ? 'font-medium text-verdict-maybe'
                                  : 'text-muted-foreground'
                            }
                          >
                            #{k.position}
                          </span>
                        </td>
                        <td className="tnum py-2.5 text-right">
                          {formatNumber(k.monthlySearchVolume)}
                        </td>
                        <td className="tnum py-2.5 text-right text-muted-foreground">
                          {formatNumber(k.competingTitles)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories it wins</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {analysis.categories.map((c) => (
                <div
                  key={c.path}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3.5"
                >
                  <span className="min-w-0 flex-1 truncate text-sm">{c.path}</span>
                  <span className="tnum shrink-0 text-sm">
                    <span className={c.position <= 10 ? 'font-medium text-verdict-go' : ''}>
                      #{c.position}
                    </span>
                    <span className="text-muted-foreground"> of {formatNumber(c.categorySize)}</span>
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="tnum mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
