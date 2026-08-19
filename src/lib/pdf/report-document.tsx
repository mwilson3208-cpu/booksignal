import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { BRAND } from '@/lib/brand';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { ValidationReport, Verdict } from '@/lib/types';

const COLORS = {
  ink: '#141a24',
  muted: '#5b6472',
  line: '#dfe3ea',
  soft: '#f4f6f9',
  accent: '#1f4fd8',
  GO: '#1d7a51',
  GOsoft: '#e7f6ee',
  MAYBE: '#9a6205',
  MAYBEsoft: '#fdf3e0',
  SKIP: '#bc2b2b',
  SKIPsoft: '#fdeceb',
} as const;

const styles = StyleSheet.create({
  page: {
    paddingTop: 44,
    paddingBottom: 60,
    paddingHorizontal: 44,
    fontSize: 9.5,
    color: COLORS.ink,
    fontFamily: 'Helvetica',
    lineHeight: 1.45,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingBottom: 10,
    marginBottom: 22,
  },
  brand: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
  brandMeta: { fontSize: 8, color: COLORS.muted },
  topic: { fontSize: 21, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  eyebrow: {
    fontSize: 7.5,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontFamily: 'Helvetica-Bold',
  },
  verdictCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 6,
    padding: 16,
    marginBottom: 18,
  },
  scoreBox: {
    width: 92,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    paddingVertical: 14,
  },
  scoreNumber: { fontSize: 34, fontFamily: 'Helvetica-Bold' },
  scoreOutOf: { fontSize: 7.5, letterSpacing: 1, marginTop: 2 },
  verdictPill: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  statRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  stat: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 5,
    padding: 9,
  },
  statLabel: { fontSize: 7, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  statValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginTop: 3 },
  h2: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 8, marginTop: 6 },
  body: { color: COLORS.muted, marginBottom: 10 },
  table: { borderWidth: 1, borderColor: COLORS.line, borderRadius: 5, marginBottom: 16 },
  tr: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  trLast: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 8 },
  th: {
    fontSize: 7,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontFamily: 'Helvetica-Bold',
  },
  headRow: { backgroundColor: COLORS.soft },
  factorHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bar: { height: 4, backgroundColor: COLORS.line, borderRadius: 2, marginBottom: 8 },
  barFill: { height: 4, borderRadius: 2 },
  footer: {
    position: 'absolute',
    bottom: 26,
    left: 44,
    right: 44,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingTop: 8,
    fontSize: 6.5,
    color: COLORS.muted,
    lineHeight: 1.4,
  },
  bullet: { flexDirection: 'row', gap: 5, marginBottom: 3 },
});

function verdictColors(verdict: Verdict) {
  return { fg: COLORS[verdict], bg: COLORS[`${verdict}soft` as const] };
}

function toneFor(score: number) {
  return score >= 70 ? COLORS.GO : score >= 45 ? COLORS.MAYBE : COLORS.SKIP;
}

function Cell({ children, width, align = 'left', bold }: {
  children: React.ReactNode;
  width: string | number;
  align?: 'left' | 'right';
  bold?: boolean;
}) {
  return (
    <Text
      style={{
        width: width as number,
        textAlign: align,
        fontFamily: bold ? 'Helvetica-Bold' : 'Helvetica',
      }}
    >
      {children}
    </Text>
  );
}

export function ReportDocument({ report }: { report: ValidationReport }) {
  const colors = verdictColors(report.verdict);
  const ebook = report.pricing.find((p) => p.format === 'ebook')!;
  const generated = new Date(report.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document
      title={`${BRAND.name} report — ${report.topic}`}
      author={BRAND.name}
      subject={`Topic validation: ${report.topic}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.brandRow} fixed>
          <Text style={styles.brand}>{BRAND.name}</Text>
          <Text style={styles.brandMeta}>
            Topic validation report · {generated}
            {report.market.source === 'mock' ? ' · SAMPLE DATA' : ''}
          </Text>
        </View>

        <Text style={styles.eyebrow}>Topic</Text>
        <Text style={styles.topic}>{report.topic}</Text>

        <View style={styles.verdictCard}>
          <View style={[styles.scoreBox, { backgroundColor: colors.bg }]}>
            <Text style={[styles.scoreNumber, { color: colors.fg }]}>{report.score}</Text>
            <Text style={[styles.scoreOutOf, { color: colors.fg }]}>OUT OF 100</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.verdictPill, { backgroundColor: colors.bg, color: colors.fg }]}>
              {report.verdict}
            </Text>
            <Text style={{ color: COLORS.muted }}>{report.verdictReason}</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Monthly searches</Text>
            <Text style={styles.statValue}>{formatNumber(report.market.monthlySearchVolume)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Competing titles</Text>
            <Text style={styles.statValue}>{formatNumber(report.market.totalCompetingTitles)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Est. revenue/mo</Text>
            <Text style={styles.statValue}>
              {formatCurrency(report.revenue.low)}–{formatCurrency(report.revenue.high)}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Ebook price</Text>
            <Text style={styles.statValue}>${ebook.recommended.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.h2}>How the {report.score} was calculated</Text>
        <Text style={styles.body}>
          The score is a fixed formula, not a model output. The same market data always produces
          the same number. Every signal below is listed with its raw input, its normalized value,
          its weight and the points it contributed.
        </Text>

        {report.factors.map((factor) => (
          <View key={factor.key} wrap={false} style={{ marginBottom: 14 }}>
            <View style={styles.factorHead}>
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10 }}>
                {factor.label} — {factor.score.toFixed(1)}
              </Text>
              <Text style={{ color: COLORS.muted, fontSize: 8.5 }}>
                weight {Math.round(factor.weight * 100)}% → {factor.contribution.toFixed(1)} pts
              </Text>
            </View>
            <View style={styles.bar}>
              <View
                style={[
                  styles.barFill,
                  { width: `${factor.score}%`, backgroundColor: toneFor(factor.score) },
                ]}
              />
            </View>
            <Text style={{ color: COLORS.muted, marginBottom: 6 }}>{factor.summary}</Text>

            <View style={styles.table}>
              <View style={[styles.tr, styles.headRow]}>
                <Text style={[styles.th, { width: '34%' }]}>Signal</Text>
                <Text style={[styles.th, { width: '30%' }]}>Input</Text>
                <Text style={[styles.th, { width: '12%', textAlign: 'right' }]}>Score</Text>
                <Text style={[styles.th, { width: '12%', textAlign: 'right' }]}>Weight</Text>
                <Text style={[styles.th, { width: '12%', textAlign: 'right' }]}>Points</Text>
              </View>
              {factor.components.map((c, i) => (
                <View
                  key={c.key}
                  style={i === factor.components.length - 1 ? styles.trLast : styles.tr}
                >
                  <Cell width="34%">{c.label}</Cell>
                  <Cell width="30%">{c.input}</Cell>
                  <Cell width="12%" align="right">
                    {c.normalized.toFixed(1)}
                  </Cell>
                  <Cell width="12%" align="right">
                    ×{c.weight.toFixed(2)}
                  </Cell>
                  <Cell width="12%" align="right" bold>
                    {c.contribution.toFixed(1)}
                  </Cell>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View
          style={{
            backgroundColor: COLORS.soft,
            borderRadius: 5,
            padding: 10,
            marginBottom: 16,
          }}
          wrap={false}
        >
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>
            {report.factors
              .map((f) => `${f.score.toFixed(1)} × ${f.weight.toFixed(2)}`)
              .join('  +  ')}{' '}
            = {report.score}
          </Text>
          <Text style={{ color: COLORS.muted, marginTop: 3, fontSize: 8 }}>
            GO at {report.thresholds.go}+ · MAYBE from {report.thresholds.maybe} to{' '}
            {report.thresholds.go - 1} · SKIP below {report.thresholds.maybe}. Engine v
            {report.version}.
          </Text>
        </View>

        <Text style={styles.h2} break>
          Top 10 competing books
        </Text>
        <View style={styles.table}>
          <View style={[styles.tr, styles.headRow]}>
            <Text style={[styles.th, { width: '6%' }]}>#</Text>
            <Text style={[styles.th, { width: '40%' }]}>Title</Text>
            <Text style={[styles.th, { width: '11%', textAlign: 'right' }]}>Price</Text>
            <Text style={[styles.th, { width: '14%', textAlign: 'right' }]}>BSR</Text>
            <Text style={[styles.th, { width: '13%', textAlign: 'right' }]}>Reviews</Text>
            <Text style={[styles.th, { width: '16%', textAlign: 'right' }]}>Est. rev/mo</Text>
          </View>
          {report.market.competitors.slice(0, 10).map((c, i, arr) => (
            <View key={c.asin} style={i === arr.length - 1 ? styles.trLast : styles.tr}>
              <Cell width="6%">{c.rank}</Cell>
              <View style={{ width: '40%' }}>
                <Text>{c.title}</Text>
                <Text style={{ fontSize: 7.5, color: COLORS.muted }}>
                  {c.author} · {c.format}
                </Text>
              </View>
              <Cell width="11%" align="right">
                ${c.price.toFixed(2)}
              </Cell>
              <Cell width="14%" align="right">
                {formatNumber(c.bsr)}
              </Cell>
              <Cell width="13%" align="right">
                {formatNumber(c.reviews)}
              </Cell>
              <Cell width="16%" align="right" bold>
                {formatCurrency(c.estimatedMonthlyRevenue)}
              </Cell>
            </View>
          ))}
        </View>

        <Text style={styles.h2}>Recommended pricing</Text>
        <View style={styles.table}>
          <View style={[styles.tr, styles.headRow]}>
            <Text style={[styles.th, { width: '20%' }]}>Format</Text>
            <Text style={[styles.th, { width: '18%', textAlign: 'right' }]}>Recommended</Text>
            <Text style={[styles.th, { width: '22%', textAlign: 'right' }]}>Range</Text>
            <Text style={[styles.th, { width: '18%', textAlign: 'right' }]}>Royalty</Text>
            <Text style={[styles.th, { width: '22%', textAlign: 'right' }]}>Per sale</Text>
          </View>
          {report.pricing.map((p, i, arr) => (
            <View key={p.format} style={i === arr.length - 1 ? styles.trLast : styles.tr}>
              <Cell width="20%" bold>
                {p.format}
              </Cell>
              <Cell width="18%" align="right">
                ${p.recommended.toFixed(2)}
              </Cell>
              <Cell width="22%" align="right">
                ${p.low.toFixed(2)}–${p.high.toFixed(2)}
              </Cell>
              <Cell width="18%" align="right">
                {Math.round(p.royaltyRate * 100)}%
              </Cell>
              <Cell width="22%" align="right" bold>
                ${p.royaltyPerSale.toFixed(2)}
              </Cell>
            </View>
          ))}
        </View>

        <Text style={styles.h2}>Estimated monthly revenue</Text>
        <View style={styles.statRow}>
          {(
            [
              ['Conservative', report.revenue.low, report.revenue.assumedMonthlyUnits.low],
              ['Expected', report.revenue.mid, report.revenue.assumedMonthlyUnits.mid],
              ['Strong', report.revenue.high, report.revenue.assumedMonthlyUnits.high],
            ] as const
          ).map(([label, value, units]) => (
            <View key={label} style={styles.stat}>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={styles.statValue}>{formatCurrency(value)}</Text>
              <Text style={{ fontSize: 7.5, color: COLORS.muted }}>
                {formatNumber(units)} units/mo
              </Text>
            </View>
          ))}
        </View>
        {report.revenue.assumptions.map((assumption) => (
          <View key={assumption} style={styles.bullet}>
            <Text style={{ color: COLORS.muted }}>•</Text>
            <Text style={{ color: COLORS.muted, flex: 1 }}>{assumption}</Text>
          </View>
        ))}

        {report.nicheDown.length > 0 && (
          <>
            <Text style={[styles.h2, { marginTop: 14 }]}>Niche-down suggestions</Text>
            <View style={styles.table}>
              {report.nicheDown.map((n, i, arr) => (
                <View key={n.topic} style={i === arr.length - 1 ? styles.trLast : styles.tr}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Helvetica-Bold' }}>{n.topic}</Text>
                    <Text style={{ fontSize: 7.5, color: COLORS.muted }}>{n.reason}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.footer} fixed>
          <Text>{BRAND.amazonDisclaimer}</Text>
          <Text style={{ marginTop: 4 }}>
            {report.market.source === 'mock'
              ? 'Generated from BookSignal sample data, not a live marketplace feed.'
              : `Data source: ${report.market.source}.`}{' '}
            Report generated {generated} by {BRAND.name}.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
