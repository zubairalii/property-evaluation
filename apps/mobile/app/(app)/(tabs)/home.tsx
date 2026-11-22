import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { HistoryEmpty } from '@/components/HistoryEmpty';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen, ScreenHeader } from '@/components/Screen';
import { useAuth } from '@/context/auth';
import { api, getErrorMessage } from '@/lib/api';
import { formatDate, formatMoney, propertyHeading, statusLabels } from '@/lib/labels';
import { fonts, palette, spacing } from '@/lib/theme';
import type { ApiEnvelope, EvaluationSummary } from '@/lib/types';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const query = useQuery({
    queryKey: ['evaluations', 'recent'],
    queryFn: async () => {
      const response = await api.get<ApiEnvelope<EvaluationSummary[]>>('/evaluations', {
        params: { page: 1, limit: 5 },
      });
      return response.data;
    },
  });

  const name = profile?.full_name?.trim() || 'there';
  const items = query.data?.data ?? [];

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Smart Property Evaluator"
        title={`Welcome, ${name}`}
        subtitle="Check an asking price before you commit to a purchase."
      />
      <PrimaryButton label="Evaluate new property" tone="teal" onPress={() => router.push('/(app)/(tabs)/evaluate')} />

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{query.data?.meta?.total ?? 0}</Text>
          <Text style={styles.statLabel}>Total evaluations</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{items.filter((item) => item.status === 'completed').length}</Text>
          <Text style={styles.statLabel}>Recent completed</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.section}>Recent evaluations</Text>
        <Pressable onPress={() => router.push('/(app)/(tabs)/history')}>
          <Text style={styles.link}>View history</Text>
        </Pressable>
      </View>

      {query.isLoading ? <Text style={styles.meta}>Loading evaluations…</Text> : null}
      {query.isError ? <Text style={styles.error}>{getErrorMessage(query.error)}</Text> : null}
      {!query.isLoading && items.length === 0 ? (
        <HistoryEmpty onEvaluate={() => router.push('/(app)/(tabs)/evaluate')} />
      ) : null}
      {items.map((item) => (
        <Pressable key={item.id} onPress={() => router.push(`/(app)/evaluations/${item.id}`)} style={styles.card}>
          <Text style={styles.cardTitle}>{propertyHeading(item.property_title, item.property_type, item.city)}</Text>
          <Text style={styles.meta}>
            {item.city} · {formatDate(item.created_at)} · {statusLabels[item.status]}
          </Text>
          <Text style={styles.price}>Asking {formatMoney(item.asking_price, item.currency)}</Text>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 12 },
  stat: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.md,
    gap: 4,
  },
  statValue: { color: palette.navy, fontFamily: fonts.displayBold, fontSize: 28 },
  statLabel: { color: palette.muted, fontFamily: fonts.bodyMedium, fontSize: 13 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  section: { color: palette.navy, fontFamily: fonts.bodyBold, fontSize: 17 },
  link: { color: palette.teal, fontFamily: fonts.bodyBold },
  card: {
    borderRadius: 20,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.md,
    gap: 4,
  },
  cardTitle: { color: palette.navy, fontFamily: fonts.bodyBold, fontSize: 16 },
  meta: { color: palette.muted, fontFamily: fonts.body, marginTop: 2 },
  price: { color: palette.ink, fontFamily: fonts.bodyMedium, marginTop: 4 },
  error: { color: palette.danger, fontFamily: fonts.bodyMedium },
});
