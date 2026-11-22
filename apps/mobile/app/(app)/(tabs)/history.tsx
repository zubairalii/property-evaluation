import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { HistoryEmpty } from '@/components/HistoryEmpty';
import { Screen } from '@/components/Screen';
import { api, getErrorMessage } from '@/lib/api';
import { formatDate, formatMoney, propertyHeading, recommendationLabels, statusLabels } from '@/lib/labels';
import { palette } from '@/lib/theme';
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
      <Text style={styles.title}>Evaluation history</Text>
      {query.isLoading ? <Text>Loading your evaluations…</Text> : null}
      {query.isError ? <Text style={styles.error}>{getErrorMessage(query.error)}</Text> : null}
      {remove.isError ? <Text style={styles.error}>{getErrorMessage(remove.error)}</Text> : null}
      {!query.isLoading && items.length === 0 ? (
        <HistoryEmpty onEvaluate={() => router.push('/(app)/(tabs)/evaluate')} />
      ) : null}
      {items.map((item) => (
        <Pressable key={item.id} style={styles.card} onPress={() => router.push(`/(app)/evaluations/${item.id}`)}>
          <View style={styles.row}>
            <Text style={styles.cardTitle}>{propertyHeading(item.property_title, item.property_type, item.city)}</Text>
            <Pressable onPress={() => confirmDelete(item.id)}>
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
  title: { color: palette.navy, fontSize: 28, fontWeight: '800' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: palette.line,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cardTitle: { color: palette.navy, fontWeight: '700', fontSize: 16, flex: 1 },
  meta: { color: palette.muted },
  price: { color: '#0F172A', fontWeight: '600', marginTop: 4 },
  delete: { color: palette.danger, fontWeight: '700' },
  error: { color: palette.danger },
});
