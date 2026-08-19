import type { MarketSnapshot } from '@/lib/types';
import { generateMarketSnapshot } from './mock-provider';
import { normalizeTopic } from './seed';

export interface MarketProvider {
  readonly id: string;
  /** Human-readable label shown in report footers and the data-source disclosure. */
  readonly label: string;
  getSnapshot(topic: string): Promise<MarketSnapshot>;
}

const mockProvider: MarketProvider = {
  id: 'mock',
  label: 'Book Demand Lab sample data (v1)',
  async getSnapshot(topic: string) {
    return generateMarketSnapshot(topic, new Date().toISOString());
  },
};

/**
 * v1 always returns the mock provider. Point this at a live implementation
 * (Amazon Product Advertising API + a keyword volume API) when credentials exist;
 * nothing downstream of `MarketSnapshot` needs to change.
 */
export function getMarketProvider(): MarketProvider {
  return mockProvider;
}

export { generateMarketSnapshot, normalizeTopic };
