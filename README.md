# BookSignal

Book topic validation for self-publishers. Type a topic, get a 0-100 score broken into
demand, competition and profit potential, and a **GO**, **MAYBE** or **SKIP** verdict
backed by a formula you can read line by line.

---

## What ships in v1

| Tool | Status | What it does |
| --- | --- | --- |
| **Topic Explorer** | Live | Search volume, top-10 competing titles, three sub-scores, verdict, pricing per format, revenue range, niche-down suggestions |
| **BSR Calculator** | Live | Any Best Sellers Rank → estimated daily/monthly/yearly units and royalty at your price |
| Niche Finder | Preview | Five-question shortlist, each niche one click from validation |
| Book Ideas Generator | Preview | Title candidates with all seven KDP backend keyword slots and both categories |
| Bestseller Analyzer | Preview | Real Amazon URL parsing → keyword ranks and categories, savable to a project |
| Series Builder | Preview | One topic → a staged 3-5 book series with hooks and target readers |
| AI Publishing Coach | Preview | Chat over your own saved reports, via the Anthropic API |

**Preview** means the interface and the workflow are real and deterministic, but the
numbers come from the sample data layer rather than a live marketplace feed. Every
preview tool says so on the page, and every report generated from sample data is
labelled in the app and on the exported PDF.

## Data source

v1 runs on a **deterministic mock market provider** (`src/lib/market/mock-provider.ts`).
A topic string is hashed into a seeded PRNG, so the same topic always returns the same
market — which is what makes the score reproducible and the engine testable.

Swapping in live data means implementing the `MarketProvider` interface
(`src/lib/market/index.ts`) against the Amazon Product Advertising API for listings plus
a keyword volume API, and changing one line in `getMarketProvider()`. Nothing downstream
changes: the scoring engine consumes a `MarketSnapshot` and knows nothing about where it
came from.

## The scoring engine

Deterministic, not AI-generated. `src/lib/scoring/engine.ts` is a pure function from
`MarketSnapshot` to `ValidationReport` — no model call, no randomness, no clock.

```
score = demand × 0.40  +  competition × 0.35  +  profit × 0.25
```

Each factor is itself a weighted sum of individual signals:

| Factor | Signals |
| --- | --- |
| **Demand** (0.40) | search volume (0.60), related keyword pool (0.25), YoY trend (0.15) |
| **Competition** (0.35) | review wall (0.35), title supply (0.30), rank wall (0.20), publisher mix (0.15) |
| **Profit** (0.25) | sales velocity (0.40), price ceiling (0.35), revenue pool (0.25) |

A higher **competition** score means an *easier* market to enter — every inverted signal
is marked as such in the UI.

**Verdict bands:** GO at 70+, MAYBE 45-69, SKIP below 45. Two guardrails override the
band: a topic cannot earn a GO with demand under 50 or competition under 35, and demand
below 22 forces a SKIP whatever the total. Every report states which rule fired.

Every signal appears in the UI and the PDF with its raw input, its normalized 0-100
value, its weight and the points it contributed, so a user can add the column up and get
the score back.

Sales estimates come from a documented piecewise power-law BSR curve
(`src/lib/scoring/bsr.ts`), applied identically to every title. Amazon does not publish
per-title sales, so this is a model, and the product says so everywhere it appears.

## Stack

- **Next.js 14** (App Router) · TypeScript · Tailwind CSS · shadcn/ui primitives
- **Supabase** — auth, Postgres, row-level security
- **Stripe** — subscriptions, customer portal, webhook-driven entitlements
- **@react-pdf/renderer** — server-rendered PDF export
- **Anthropic API** — the Publishing Coach, and nothing else
- **Vitest** — unit tests for the engine, the data layer and the tools

## Getting started

```bash
npm install
cp .env.example .env.local     # fill in what you have; nothing is required to boot
npm run dev
```

The app boots with **no credentials configured**. The marketing site, the scoring engine
and the PDF renderer all work; each missing key disables its feature with a visible
message rather than crashing. Add Supabase keys to enable accounts and the app routes.

### Supabase

1. Create a project.
2. Run `supabase/migrations/0001_init.sql` in the SQL editor. It creates every table,
   turns on row-level security with owner-scoped policies, and installs the trigger that
   creates a profile row for each new auth user.
3. Copy the project URL, the anon key and the service-role key into `.env.local`.

The service-role key is used by exactly one file — the Stripe webhook — which runs
without a user session. Everything else goes through RLS.

### Stripe

1. Create two products (Standard, Pro) with a monthly and a yearly recurring price each.
   Yearly should be **ten times** the monthly amount; that is what "two months free"
   means in `src/lib/billing/plans.ts`, and the UI derives the saving from it.
2. Put the four price IDs in `.env.local`.
3. Forward webhooks in development:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   In production, point an endpoint at `/api/stripe/webhook` subscribed to
   `checkout.session.completed` and the three `customer.subscription.*` events.

Plan entitlements are written **only** by a signature-verified webhook. Nothing in the
checkout flow grants a plan, so hitting the success URL directly does nothing.

### Usage metering

Every validation writes a row to `usage_events`. The allowance is counted against the
billing window stored on the profile, which Stripe's webhook keeps in sync. Rolling the
window forward *is* the reset — there is no cron job to miss. Free accounts fall back to
the calendar month.

Limits: Free 3, Standard 30, Pro 100 validations per cycle.

## Scripts

```bash
npm run dev         # dev server
npm run build       # production build
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm test            # vitest
```

## Deploying to Vercel

Import the repo, set the environment variables from `.env.example`, and deploy.
`NEXT_PUBLIC_SITE_URL` should be the production URL — Stripe redirects and Supabase auth
callbacks use it.

## Before you launch

These ship as clearly-labelled placeholders and need replacing:

- **Testimonials** (`src/components/marketing/testimonials.tsx`) — written in-house and
  badged as sample copy. Swap in real quotes and delete the badge.
- **Team bios** (`src/components/marketing/team-section.tsx`) — same.
- **Legal pages** (`src/app/(marketing)/legal/`) — templates. Have a lawyer review them
  before taking payments.
- **Brand contact details** (`src/lib/brand.ts`).

The Amazon non-affiliation disclaimer in `src/lib/brand.ts` appears in the footer, on
every report and on every exported PDF. Keep it there.

## Project layout

```
src/
  app/
    (marketing)/        public site: landing, about, legal
    (app)/              authenticated: dashboard, tools, projects, account
    api/                Stripe, coach, PDF export
  components/
    ui/                 shadcn/ui primitives
    marketing/          landing page sections
    app/                shell: sidebar, credit meter, page headers
    report/             score gauge, factor breakdown, verdict badge
    tools/              one client component per tool
  lib/
    scoring/            the engine, the BSR curve, the maths (pure, tested)
    market/             MarketProvider interface + the deterministic mock
    tools/              generators behind the six preview tools
    billing/            plan definitions and Stripe helpers
    account/            usage metering and billing periods
    supabase/           browser, server and admin clients
    pdf/                the PDF report document
supabase/migrations/    schema with RLS
```
