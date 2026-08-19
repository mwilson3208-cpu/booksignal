import * as React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Github, Radar } from 'lucide-react';

import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { Hero } from '@/components/marketing/hero';
import { TrustBar } from '@/components/marketing/trust-bar';
import { DemoSection } from '@/components/marketing/demo-section';
import { FeatureGrid } from '@/components/marketing/feature-grid';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { Testimonials } from '@/components/marketing/testimonials';
import { PricingSection } from '@/components/marketing/pricing-table';
import { TeamSection } from '@/components/marketing/team-section';
import { Faq } from '@/components/marketing/faq';
import { FinalCta } from '@/components/marketing/final-cta';
import AboutPage from '@/app/(marketing)/about/page';
import TermsPage from '@/app/(marketing)/legal/terms/page';
import PrivacyPage from '@/app/(marketing)/legal/privacy/page';
import DisclaimerPage from '@/app/(marketing)/legal/disclaimer/page';

import { AppSidebar } from '@/components/app/app-sidebar';
import { CreditMeter } from '@/components/app/credit-meter';
import { UserMenu } from '@/components/app/user-menu';
import { PageHeader } from '@/components/app/page-header';
import { PreviewNotice } from '@/components/app/preview-notice';
import { ReportView } from '@/components/report/report-view';
import { VerdictBadge } from '@/components/report/verdict-badge';

import { TopicExplorerForm } from '@/components/tools/topic-explorer-form';
import { NicheFinderClient } from '@/components/tools/niche-finder-client';
import { BookIdeasClient } from '@/components/tools/book-ideas-client';
import { BestsellerAnalyzerClient } from '@/components/tools/bestseller-analyzer-client';
import { SeriesBuilderClient } from '@/components/tools/series-builder-client';
import { BsrCalculatorClient } from '@/components/tools/bsr-calculator-client';
import { CoachClient } from '@/components/tools/coach-client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PLANS } from '@/lib/billing/plans';
import { demoReport, registerDemoTopic } from './shims/actions';
import { generateMarketSnapshot } from '@/lib/market/mock-provider';
import { scoreTopic } from '@/lib/scoring/engine';
import { formatDate } from '@/lib/utils';
import type { ValidationReport } from '@/lib/types';

/* -------------------------------------------------------------------------- */
/* Hash routing                                                               */
/* -------------------------------------------------------------------------- */

/**
 * A hash that starts with "/" names a route; anything else ("#pricing") is a same-page
 * anchor and leaves the landing page mounted so the browser can scroll to it.
 */
function readRoute(): string {
  if (typeof window === 'undefined') return '/';
  const hash = window.location.hash.slice(1);
  if (!hash.startsWith('/')) return '/';
  return hash.split('?')[0] || '/';
}

function useHashRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const onChange = () => {
      const next = readRoute();
      setRoute((current) => {
        if (current !== next) window.scrollTo({ top: 0 });
        return next;
      });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

/* -------------------------------------------------------------------------- */
/* Demo banner                                                                */
/* -------------------------------------------------------------------------- */

const REPO = 'https://github.com/mwilson3208-cpu/booksignal';

function DemoBanner() {
  return (
    <div className="border-b bg-foreground text-background">
      <div className="container flex flex-col items-start gap-2 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p className="leading-relaxed">
          <span className="font-semibold">Live demo.</span> The scoring engine, the market data
          layer and every tool run here in your browser — real code, real numbers. Accounts,
          billing and PDF export need a server and are switched off.
        </p>
        <a
          href={REPO}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 font-medium underline underline-offset-2"
        >
          <Github className="h-3.5 w-3.5" />
          Source
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Marketing                                                                  */
/* -------------------------------------------------------------------------- */

/** Mirrors the marketing layout so a sub-page keeps the site chrome. */
function MarketingPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

/** Mirrors (marketing)/legal/layout.tsx, which the demo does not run. */
function LegalPage({ children }: { children: React.ReactNode }) {
  return (
    <MarketingPage>
      <div className="container py-16 sm:py-24">
        <article className="mx-auto max-w-3xl [&_h1]:text-4xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_li]:mt-2 [&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-muted-foreground">
          {children}
        </article>
      </div>
    </MarketingPage>
  );
}

function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <TrustBar />
        <DemoSection />
        <FeatureGrid />
        <HowItWorks />
        <Testimonials />
        <PricingSection />
        <TeamSection />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* App shell                                                                  */
/* -------------------------------------------------------------------------- */

const DEMO_USAGE = {
  used: 14,
  limit: PLANS.pro.validationsPerCycle,
  remaining: PLANS.pro.validationsPerCycle - 14,
  periodStart: '2026-08-01T00:00:00.000Z',
  periodEnd: '2026-09-01T00:00:00.000Z',
  percentUsed: 14,
};

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <AppSidebar>
        <div className="space-y-3">
          <CreditMeter usage={DEMO_USAGE} plan={PLANS.pro} />
          <UserMenu email="you@example.com" name="Demo account" />
        </div>
      </AppSidebar>
      <div className="lg:pl-64">
        <div className="border-b bg-muted/40">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-xs sm:px-6 lg:px-8">
            <span className="text-muted-foreground">
              Demo account — every tool below runs the real code in your browser.
            </span>
            <a href="#/" className="inline-flex items-center gap-1.5 font-medium text-primary">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to the site
            </a>
          </div>
        </div>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Topic Explorer                                                             */
/* -------------------------------------------------------------------------- */

const SAMPLE_TOPICS = [
  'AI prompt engineering',
  'Sourdough baking',
  'Intermittent fasting',
  'Airbnb hosting',
];

// Registered at load so a direct link to a sample report keeps its original wording.
SAMPLE_TOPICS.forEach(registerDemoTopic);

function TopicExplorer() {
  const samples = SAMPLE_TOPICS.map((topic) => ({ topic, report: registerDemoTopic(topic) }));

  return (
    <>
      <PageHeader
        title="Topic Explorer"
        description="Type any book topic. You get search volume, the ten books already competing, a 0-100 score broken into demand, competition and profit potential, and a GO, MAYBE or SKIP verdict with the formula behind it."
      />

      <Card className="mb-8">
        <CardContent className="pt-6">
          <TopicExplorerForm remaining={DEMO_USAGE.remaining} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Already scored</CardTitle>
          <p className="text-sm text-muted-foreground">
            Four topics run through the engine ahead of time. Every one is reproducible — type the
            same words above and you get the same number back.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {samples.map(({ topic, report }) => (
            <a
              key={topic}
              href={`#/tools/topic-explorer/${report.normalizedTopic.replace(/\s+/g, '-')}`}
              className="group flex items-center gap-4 rounded-lg border p-3.5 transition-colors hover:border-primary/40 hover:bg-accent"
            >
              <span className="tnum w-9 shrink-0 text-center text-lg font-semibold">
                {report.score}
              </span>
              <VerdictBadge verdict={report.verdict} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{report.topic}</span>
              <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                {formatDate(report.generatedAt)}
              </span>
            </a>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

function ReportPage({ slug }: { slug: string }) {
  const topic = slug.replace(/-/g, ' ');
  const report: ValidationReport =
    demoReport(slug) ?? scoreTopic(generateMarketSnapshot(topic));

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/tools/topic-explorer">
            <ArrowLeft className="h-4 w-4" />
            New validation
          </Link>
        </Button>
        <span className="text-xs text-muted-foreground">
          Engine v{report.version} · scored in your browser
        </span>
      </div>
      <ReportView
        report={report}
        actions={
          <>
            <Button variant="outline" disabled title="PDF export renders server-side">
              Export PDF — server only
            </Button>
            <Button variant="outline" disabled title="Projects need an account">
              Save to project — needs an account
            </Button>
          </>
        }
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Routing                                                                    */
/* -------------------------------------------------------------------------- */

function ServerOnly({ title, description, body }: { title: string; description: string; body: string }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
          <Radar className="h-8 w-8 text-muted-foreground" />
          <div>
            <h2 className="font-semibold">Not available in the demo</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              {body}
            </p>
          </div>
          <Button asChild variant="outline">
            <a href={REPO} target="_blank" rel="noreferrer">
              <Github className="h-4 w-4" />
              Read the code
            </a>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

export function App() {
  const route = useHashRoute();

  if (route === '/' || route === '') return <Landing />;
  if (route === '/about') return <MarketingPage><AboutPage /></MarketingPage>;
  if (route === '/legal/terms') return <LegalPage><TermsPage /></LegalPage>;
  if (route === '/legal/privacy') return <LegalPage><PrivacyPage /></LegalPage>;
  if (route === '/legal/disclaimer') return <LegalPage><DisclaimerPage /></LegalPage>;

  const reportMatch = route.match(/^\/tools\/topic-explorer\/(.+)$/);
  if (reportMatch) {
    return (
      <AppShell>
        <ReportPage slug={reportMatch[1]} />
      </AppShell>
    );
  }

  let content: React.ReactNode;
  switch (route) {
    case '/tools/topic-explorer':
      content = <TopicExplorer />;
      break;
    case '/tools/niche-finder':
      content = (
        <>
          <PageHeader
            title="Niche Finder"
            badge="Preview"
            description="Five questions about your experience, expertise and audience turn into a ranked shortlist of niches. Send any one straight to Topic Explorer for a full scored report."
          />
          <PreviewNotice>
            The questionnaire and the ranking are real and deterministic — the same answers always
            give the same shortlist. Search volumes come from the sample data layer.
          </PreviewNotice>
          <NicheFinderClient />
        </>
      );
      break;
    case '/tools/book-ideas':
      content = (
        <>
          <PageHeader
            title="Book Ideas Generator"
            badge="Preview"
            description="Turn a validated niche into specific title candidates, each with all seven KDP backend keyword slots and both category slots, formatted to paste straight in."
          />
          <PreviewNotice />
          <BookIdeasClient />
        </>
      );
      break;
    case '/tools/bestseller-analyzer':
      content = (
        <>
          <PageHeader
            title="Bestseller Analyzer"
            badge="Preview"
            description="Paste any Amazon book URL. See the keywords it ranks for with volume and position, and the categories it wins."
          />
          <PreviewNotice>
            URL parsing is real — paste any Amazon product link and the ASIN is extracted correctly.
            The ranking data returned against it is generated sample data rather than a live crawl.
          </PreviewNotice>
          <BestsellerAnalyzerClient projects={[]} />
        </>
      );
      break;
    case '/tools/series-builder':
      content = (
        <>
          <PageHeader
            title="Series Builder"
            badge="Preview"
            description="Expand one validated topic into a three-to-five book series. Each volume gets a working title, a hook and the reader it is written for."
          />
          <PreviewNotice />
          <SeriesBuilderClient />
        </>
      );
      break;
    case '/tools/bsr-calculator':
      content = (
        <>
          <PageHeader
            title="BSR Calculator"
            badge="Live in v1"
            description="Enter any Amazon Best Sellers Rank to read off estimated daily, monthly and yearly unit sales, plus what those units are worth at your list price after the royalty."
          />
          <BsrCalculatorClient />
        </>
      );
      break;
    case '/tools/coach':
      content = (
        <>
          <PageHeader
            title="AI Publishing Coach"
            badge="Preview"
            description="A chat assistant that can read your saved reports. It explains what a score means, names the signal dragging it down, and tells you what to do next."
          />
          <CoachClient
            enabled={false}
            reportCount={0}
            disabledReason="The coach streams from the Anthropic API, which needs a server and an API key. In the running app it reads your saved reports and explains any score in them — it never recalculates the score."
          />
        </>
      );
      break;
    case '/dashboard':
      content = (
        <ServerOnly
          title="Dashboard"
          description="Recent validations, remaining credits and where to pick up."
          body="The dashboard reads your saved reports and metered usage out of Supabase, so it needs an account. Start with Topic Explorer instead — it runs fully in the browser."
        />
      );
      break;
    case '/projects':
      content = (
        <ServerOnly
          title="Projects"
          description="File validations, competitors and ideas under the book they belong to."
          body="Projects are stored per user with row-level security, so they need an account and a database."
        />
      );
      break;
    case '/account':
      content = (
        <ServerOnly
          title="Account & billing"
          description="Your plan, your usage for this cycle, and where to change either."
          body="Billing runs through Stripe Checkout and a signature-verified webhook. Both need server credentials. The pricing on the landing page is the real plan configuration."
        />
      );
      break;
    default:
      content = <TopicExplorer />;
  }

  return <AppShell>{content}</AppShell>;
}
