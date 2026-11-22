import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { formatMoney, priceStatusLabels, recommendationLabels, confidenceLabels } from '@/lib/labels';
import { palette } from '@/lib/theme';
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
        <Text key={item} style={styles.item}>
          • {item}
        </Text>
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
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>
            {evaluation.status === 'failed' ? 'Evaluation failed' : 'Result not ready'}
          </Text>
          <Text style={styles.body}>
            {evaluation.error_message ?? 'This evaluation does not have a valuation result yet.'}
          </Text>
        </Card.Content>
      </Card>
    );
  }

  const limited = result.confidence_level === 'insufficient_data' || result.estimated_value == null;

  if (section === 'valuation') {
    return (
      <View style={styles.stack}>
        <Card style={styles.card}>
          <Card.Content style={styles.stack}>
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
                Verified market records were not available for this property, so the estimate has limited confidence
                and is based only on the information you submitted.
              </Text>
            )}
            <Text style={[styles.badge, { color: tone(result.price_status) }]}>
              {priceStatusLabels[result.price_status]} · Confidence {confidenceLabels[result.confidence_level]}
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content style={styles.stack}>
            <Text style={styles.label}>Asking price</Text>
            <Text style={styles.body}>{formatMoney(evaluation.asking_price, evaluation.currency)}</Text>
            <Text style={styles.label}>Difference from estimate</Text>
            <Text style={styles.body}>
              {difference == null
                ? 'Not available without an estimated value'
                : `${formatMoney(Math.abs(difference), evaluation.currency)} ${difference > 0 ? 'above' : difference < 0 ? 'below' : 'matching'} the estimate`}
            </Text>
            <Text style={styles.body}>{result.valuation_explanation}</Text>
            <FactorList title="Factors" items={[...result.positive_factors, ...result.risk_factors]} />
          </Card.Content>
        </Card>
        <Text style={styles.disclaimer}>{disclaimers.valuation}</Text>
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      <Card style={styles.card}>
        <Card.Content style={styles.stack}>
          <Text style={styles.kicker}>Investment recommendation</Text>
          <Text style={[styles.title, { color: tone(result.investment_recommendation) }]}>
            {recommendationLabels[result.investment_recommendation]}
          </Text>
          <Text style={styles.body}>{result.investment_analysis}</Text>
          <FactorList title="Potential advantages" items={result.positive_factors} />
          <FactorList title="Potential risks" items={result.risk_factors} />
          <FactorList title="Suggested considerations" items={result.considerations} />
        </Card.Content>
      </Card>
      <Text style={styles.disclaimer}>{disclaimers.investment}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 12 },
  card: { borderRadius: 16, backgroundColor: palette.card },
  kicker: { color: palette.muted, fontSize: 13, fontWeight: '600' },
  title: { color: palette.navy, fontSize: 22, fontWeight: '700' },
  value: { color: palette.navy, fontSize: 28, fontWeight: '800' },
  body: { color: '#0F172A', lineHeight: 22 },
  label: { color: palette.muted, fontSize: 13, fontWeight: '600' },
  badge: { fontWeight: '700' },
  item: { color: '#0F172A', lineHeight: 22 },
  block: { gap: 4 },
  disclaimer: { color: palette.muted, fontSize: 12, lineHeight: 18 },
});
