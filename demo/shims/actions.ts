/**
 * Server actions are unavailable in a static bundle. The demo runs the same scoring
 * pipeline the action would have run, just in the browser, and skips the parts that
 * need a database (metering, persistence).
 */
import { generateMarketSnapshot } from '@/lib/market/mock-provider';
import { scoreTopic } from '@/lib/scoring/engine';
import type { ValidationReport } from '@/lib/types';

export type ValidationResult =
  | { ok: true; id: string; report: ValidationReport }
  | { ok: false; error: string; code?: 'limit_reached' | 'invalid_topic' | 'unauthenticated' };

const reports = new Map<string, ValidationReport>();

export function slugFor(topic: string): string {
  return scoreTopic(generateMarketSnapshot(topic)).normalizedTopic.replace(/\s+/g, '-');
}

/**
 * Pre-registers a topic so a direct link to its report renders the wording the author
 * used. A slug is lower-cased, so reconstructing the topic from it alone would turn
 * "AI prompt engineering" into "ai prompt engineering".
 */
export function registerDemoTopic(topic: string): ValidationReport {
  const report = scoreTopic(generateMarketSnapshot(topic));
  reports.set(report.normalizedTopic.replace(/\s+/g, '-'), report);
  return report;
}

export function demoReport(id: string): ValidationReport | undefined {
  return reports.get(id);
}

export async function runValidation(rawTopic: string): Promise<ValidationResult> {
  const topic = rawTopic.trim();
  if (topic.length < 3) {
    return { ok: false, error: 'Give the topic at least three characters.', code: 'invalid_topic' };
  }
  // The real path takes up to ninety seconds against live data; hold a beat so the
  // progress stages are readable rather than flashing past.
  await new Promise((resolve) => setTimeout(resolve, 1400));
  const report = scoreTopic(generateMarketSnapshot(topic, new Date().toISOString()));
  const id = report.normalizedTopic.replace(/\s+/g, '-');
  reports.set(id, report);
  return { ok: true, id, report };
}

export async function deleteValidation() {}
export async function assignValidationToProject() {}
export async function saveCompetitor() {
  return { ok: true as const };
}
export async function saveIdea() {
  return { ok: true as const };
}
export async function createProject() {
  return { ok: true as const, id: 'demo' };
}
export async function deleteProject() {}
export async function renameProject() {}
export async function completeOnboarding() {}
