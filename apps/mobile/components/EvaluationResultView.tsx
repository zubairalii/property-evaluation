import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { confidenceLabels, formatMoney, priceStatusLabels, recommendationLabels } from '@/lib/labels';
import { fonts, palette, spacing } from '@/lib/theme';
import type { EvaluationView } from '@/lib/types';

function tone(status: string): string {
  if (status === 'underpriced' || status === 'good_investment') return palette.success;
  if (status === 'overpriced' || status === 'not_recommended') return palette.danger;
  if (status === 'consider_carefully' || status === 'fairly_priced') return palette.warning;
  return palette.muted;
}

function FactorList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <View style={styles.block}>
      <Text style={styles.label}>{title}</Text>
      {items.map((item) => (
        <View key={item} style={styles.bulletRow}>
          <View style={styles.bullet} />
          <Text style={styles.item}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function EvaluationResultView({
  view,
  section,
}: {
  view: EvaluationView;
  section: 'valuation' | 'investment';
}) {
  const { evaluation, result, price_difference: difference, disclaimers } = view;
  if (!result) {
    return (
      <View style={styles.panel}>
        <Text style={styles.title}>
          {evaluation.status === 'failed' ? 'Evaluation failed' : 'Result not ready'}
        </Text>
        <Text style={styles.body}>
          {evaluation.error_message ?? 'This evaluation does not have a valuation result yet.'}
        </Text>
      </View>
    );
  }

  const limited = result.confidence_level === 'insufficient_data' || result.estimated_value == null;

  if (section === 'valuation') {
    return (
      <View style={styles.stack}>
        <View style={[styles.panel, styles.hero]}>
          <Text style={styles.kicker}>Estimated market value</Text>
          {limited ? (
            <Text style={styles.title}>Numeric valuation unavailable</Text>
          ) : (
            <Text style={styles.value}>{formatMoney(result.estimated_value, result.currency)}</Text>
          )}
          {!limited ? (
            <Text style={styles.body}>
              Range {formatMoney(result.minimum_value, result.currency)} –{' '}
              {formatMoney(result.maximum_value, result.currency)}
            </Text>
          ) : (
            <Text style={styles.body}>
              Verified market records were limited for this property, so confidence is reduced and the estimate leans
              on the details you submitted.
            </Text>
          )}
          <View style={[styles.chip, { backgroundColor: `${tone(result.price_status)}18` }]}>
            <Text style={[styles.chipText, { color: tone(result.price_status) }]}>
              {priceStatusLabels[result.price_status]} · Confidence {confidenceLabels[result.confidence_level]}
            </Text>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.label}>Asking price</Text>
          <Text style={styles.emphasis}>{formatMoney(evaluation.asking_price, evaluation.currency)}</Text>
          <Text style={[styles.label, styles.spaced]}>Difference from estimate</Text>
          <Text style={styles.body}>
            {difference == null
              ? 'Not available without an estimated value'
              : `${formatMoney(Math.abs(difference), evaluation.currency)} ${difference > 0 ? 'above' : difference < 0 ? 'below' : 'matching'} the estimate`}
          </Text>
          <Text style={[styles.body, styles.spaced]}>{result.valuation_explanation}</Text>
          <FactorList title="Factors" items={[...result.positive_factors, ...result.risk_factors]} />
        </View>
        <Text style={styles.disclaimer}>{disclaimers.valuation}</Text>
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      <View style={styles.panel}>
        <Text style={styles.kicker}>Investment recommendation</Text>
        <Text style={[styles.title, { color: tone(result.investment_recommendation) }]}>
          {recommendationLabels[result.investment_recommendation]}
        </Text>
        <Text style={styles.body}>{result.investment_analysis}</Text>
        <FactorList title="Potential advantages" items={result.positive_factors} />
        <FactorList title="Potential risks" items={result.risk_factors} />
        <FactorList title="Suggested considerations" items={result.considerations} />
      </View>
      <Text style={styles.disclaimer}>{disclaimers.investment}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  panel: {
    borderRadius: 22,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.lg,
    gap: 10,
  },
  hero: {
    backgroundColor: '#F7FBFC',
  },
  kicker: {
    color: palette.teal,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: palette.navy,
    fontFamily: fonts.displayBold,
    fontSize: 24,
    lineHeight: 30,
  },
  value: {
    color: palette.navy,
    fontFamily: fonts.displayBold,
    fontSize: 32,
    lineHeight: 38,
  },
  emphasis: {
    color: palette.navy,
    fontFamily: fonts.bodyBold,
    fontSize: 18,
  },
  body: {
    color: palette.ink,
    fontFamily: fonts.body,
    lineHeight: 22,
    fontSize: 15,
  },
  label: {
    color: palette.muted,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  spaced: { marginTop: 8 },
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
  },
  chipText: { fontFamily: fonts.bodyBold, fontSize: 13 },
  item: { color: palette.ink, fontFamily: fonts.body, lineHeight: 22, flex: 1 },
  block: { gap: 8, marginTop: 6 },
  bulletRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bullet: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: palette.bronze,
    marginTop: 7,
  },
  disclaimer: {
    color: palette.muted,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
});
