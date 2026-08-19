-- Book Demand Lab initial schema.
-- Row level security is on for every table; a user only ever sees their own rows.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, carrying plan and billing-cycle state
-- ---------------------------------------------------------------------------
create type plan_tier as enum ('free', 'standard', 'pro');
create type subscription_status as enum (
  'none', 'trialing', 'active', 'past_due', 'canceled', 'incomplete'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  author_level text check (author_level in ('beginner', 'published', 'experienced')),
  onboarded_at timestamptz,
  plan plan_tier not null default 'free',
  subscription_status subscription_status not null default 'none',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  billing_interval text check (billing_interval in ('month', 'year')),
  -- Start of the current usage window. Validation credits reset when this rolls forward.
  current_period_start timestamptz not null default date_trunc('month', now()),
  current_period_end timestamptz not null default (date_trunc('month', now()) + interval '1 month'),
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are readable by their owner"
  on public.profiles for select using (auth.uid() = id);
create policy "profiles are updatable by their owner"
  on public.profiles for update using (auth.uid() = id);
create policy "profiles are insertable by their owner"
  on public.profiles for insert with check (auth.uid() = id);

-- Create the profile row automatically whenever an auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- projects: named folders a user files validations and competitors into
-- ---------------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  description text,
  color text not null default 'blue',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_user_id_idx on public.projects (user_id, created_at desc);
alter table public.projects enable row level security;

create policy "projects are owner-scoped"
  on public.projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- validations: one saved Topic Explorer report
-- ---------------------------------------------------------------------------
create type verdict as enum ('GO', 'MAYBE', 'SKIP');

create table public.validations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  topic text not null,
  normalized_topic text not null,
  score int not null check (score between 0 and 100),
  verdict verdict not null,
  scoring_version text not null,
  data_source text not null default 'mock',
  -- The full ValidationReport, stored verbatim so a saved report never drifts when the
  -- engine is recalibrated. Re-running the topic produces a new row instead.
  report jsonb not null,
  created_at timestamptz not null default now()
);

create index validations_user_id_idx on public.validations (user_id, created_at desc);
create index validations_project_id_idx on public.validations (project_id, created_at desc);
alter table public.validations enable row level security;

create policy "validations are owner-scoped"
  on public.validations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- usage_events: the metering ledger. One row per metered action.
-- ---------------------------------------------------------------------------
create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('validation', 'bestseller_analysis', 'coach_message')),
  reference_id uuid,
  -- Denormalized window start, so counting a cycle's usage is a single indexed scan.
  period_start timestamptz not null,
  created_at timestamptz not null default now()
);

create index usage_events_period_idx on public.usage_events (user_id, kind, period_start);
alter table public.usage_events enable row level security;

create policy "usage events are owner-readable"
  on public.usage_events for select using (auth.uid() = user_id);
create policy "usage events are owner-insertable"
  on public.usage_events for insert with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- saved_competitors: titles pulled in from the Bestseller Analyzer
-- ---------------------------------------------------------------------------
create table public.saved_competitors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  asin text not null,
  title text not null,
  author text,
  source_url text,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create index saved_competitors_user_id_idx on public.saved_competitors (user_id, created_at desc);
alter table public.saved_competitors enable row level security;

create policy "saved competitors are owner-scoped"
  on public.saved_competitors for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- saved_ideas: book ideas, niches and series plans filed into a project
-- ---------------------------------------------------------------------------
create table public.saved_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  kind text not null check (kind in ('niche', 'book_idea', 'series')),
  title text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index saved_ideas_user_id_idx on public.saved_ideas (user_id, created_at desc);
alter table public.saved_ideas enable row level security;

create policy "saved ideas are owner-scoped"
  on public.saved_ideas for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- keep updated_at honest
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();
