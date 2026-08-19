import type { PlanId } from '@/lib/billing/plans';
import type { ValidationReport, Verdict } from '@/lib/types';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  author_level: 'beginner' | 'published' | 'experienced' | null;
  onboarded_at: string | null;
  plan: PlanId;
  subscription_status: 'none' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  billing_interval: 'month' | 'year' | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface ValidationRow {
  id: string;
  user_id: string;
  project_id: string | null;
  topic: string;
  normalized_topic: string;
  score: number;
  verdict: Verdict;
  scoring_version: string;
  data_source: string;
  report: ValidationReport;
  created_at: string;
}

export interface SavedCompetitor {
  id: string;
  user_id: string;
  project_id: string | null;
  asin: string;
  title: string;
  author: string | null;
  source_url: string | null;
  snapshot: Record<string, unknown>;
  created_at: string;
}

export interface SavedIdea {
  id: string;
  user_id: string;
  project_id: string | null;
  kind: 'niche' | 'book_idea' | 'series';
  title: string;
  payload: Record<string, unknown>;
  created_at: string;
}
