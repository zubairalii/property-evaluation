import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { HistoryEmpty } from '@/components/HistoryEmpty';
import { Screen, ScreenHeader } from '@/components/Screen';
import { api, getErrorMessage } from '@/lib/api';
import { formatDate, formatMoney, propertyHeading, recommendationLabels, statusLabels } from '@/lib/labels';
import { fonts, palette, spacing } from '@/lib/theme';
import type { ApiEnvelope, EvaluationSummary } from '@/lib/types';

export default function HistoryScreen() {
  const router = useRouter();
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['evaluations', 'history'],
    queryFn: async () => {
      const response = await api.get<ApiEnvelope<EvaluationSummary[]>>('/evaluations', {
        params: { page: 1, limit: 50 },
      });
      return response.data;
    },
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/evaluations/${id}`);
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['evaluations'] });
    },
  });

  function confirmDelete(id: string) {
    Alert.alert('Delete evaluation', 'This removes the property and its valuation from your account.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove.mutate(id) },
    ]);
  }

  const items = query.data?.data ?? [];

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Archive"
        title="Evaluation history"
        subtitle="Revisit past valuations or clean up properties you no longer need."
      />
      {query.isLoading ? <Text style={styles.meta}>Loading your evaluations…</Text> : null}
      {query.isError ? <Text style={styles.error}>{getErrorMessage(query.error)}</Text> : null}
      {remove.isError ? <Text style={styles.error}>{getErrorMessage(remove.error)}</Text> : null}
      {!query.isLoading && items.length === 0 ? (
        <HistoryEmpty onEvaluate={() => router.push('/(app)/(tabs)/evaluate')} />
      ) : null}
      {items.map((item) => (
        <Pressable key={item.id} style={styles.card} onPress={() => router.push(`/(app)/evaluations/${item.id}`)}>
          <View style={styles.row}>
            <Text style={styles.cardTitle}>{propertyHeading(item.property_title, item.property_type, item.city)}</Text>
            <Pressable onPress={() => confirmDelete(item.id)} hitSlop={8}>
              <Text style={styles.delete}>Delete</Text>
            </Pressable>
          </View>
          <Text style={styles.meta}>
            {formatDate(item.created_at)} · {item.location}, {item.city}
          </Text>
          <Text style={styles.meta}>
            {statusLabels[item.status]}
            {item.investment_recommendation ? ` · ${recommendationLabels[item.investment_recommendation]}` : ''}
          </Text>
          <Text style={styles.price}>Asking {formatMoney(item.asking_price, item.currency)}</Text>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: 20,
    padding: spacing.md,
    gap: 4,
    borderWidth: 1,
    borderColor: palette.line,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cardTitle: { color: palette.navy, fontFamily: fonts.bodyBold, fontSize: 16, flex: 1 },
  meta: { color: palette.muted, fontFamily: fonts.body },
  price: { color: palette.ink, fontFamily: fonts.bodyMedium, marginTop: 4 },
  delete: { color: palette.danger, fontFamily: fonts.bodyBold },
  error: { color: palette.danger, fontFamily: fonts.bodyMedium },
});
