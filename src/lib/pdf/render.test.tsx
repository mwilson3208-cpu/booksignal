import { describe, expect, it } from 'vitest';
import { renderToBuffer } from '@react-pdf/renderer';
import { ReportDocument } from './report-document';
import { generateMarketSnapshot } from '@/lib/market/mock-provider';
import { scoreTopic } from '@/lib/scoring/engine';

describe('PDF export', () => {
  it('renders a real PDF for each verdict shape', async () => {
    for (const topic of ['ai prompt engineering', 'sourdough baking', 'airbnb hosting']) {
      const report = scoreTopic(generateMarketSnapshot(topic));
      const buffer = await renderToBuffer(<ReportDocument report={report} />);
      expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
      expect(buffer.length).toBeGreaterThan(5_000);
    }
  }, 60_000);
});
