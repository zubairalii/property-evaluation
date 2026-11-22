import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { HistoryEmpty } from '@/components/HistoryEmpty';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/context/auth';
import { api, getErrorMessage } from '@/lib/api';
import { formatDate, formatMoney, propertyHeading, statusLabels } from '@/lib/labels';
import { palette } from '@/lib/theme';
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
      <Text style={styles.kicker}>Smart Property Evaluator</Text>
      <Text style={styles.title}>Welcome, {name}</Text>
      <Text style={styles.copy}>Check an asking price before you commit to a purchase.</Text>
      <Button mode="contained" style={styles.cta} onPress={() => router.push('/(app)/(tabs)/evaluate')}>
        Evaluate new property
      </Button>
      <View style={styles.stats}>
        <Card style={styles.stat}>
          <Card.Content>
            <Text style={styles.statValue}>{query.data?.meta?.total ?? 0}</Text>
            <Text style={styles.statLabel}>Total evaluations</Text>
          </Card.Content>
        </Card>
        <Card style={styles.stat}>
          <Card.Content>
            <Text style={styles.statValue}>{items.filter((item) => item.status === 'completed').length}</Text>
            <Text style={styles.statLabel}>Recent completed</Text>
          </Card.Content>
        </Card>
      </View>
      <View style={styles.row}>
        <Text style={styles.section}>Recent evaluations</Text>
        <Pressable onPress={() => router.push('/(app)/(tabs)/history')}>
          <Text style={styles.link}>View history</Text>
        </Pressable>
      </View>
      {query.isLoading ? <Text>Loading evaluations…</Text> : null}
      {query.isError ? <Text style={styles.error}>{getErrorMessage(query.error)}</Text> : null}
      {!query.isLoading && items.length === 0 ? (
        <HistoryEmpty onEvaluate={() => router.push('/(app)/(tabs)/evaluate')} />
      ) : null}
      {items.map((item) => (
        <Pressable key={item.id} onPress={() => router.push(`/(app)/evaluations/${item.id}`)}>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>{propertyHeading(item.property_title, item.property_type, item.city)}</Text>
              <Text style={styles.meta}>
                {item.city} · {formatDate(item.created_at)} · {statusLabels[item.status]}
              </Text>
              <Text style={styles.meta}>Asking {formatMoney(item.asking_price, item.currency)}</Text>
            </Card.Content>
          </Card>
        </Pressable>
      ))}
      <Button mode="outlined" onPress={() => router.push('/(app)/(tabs)/profile')}>
        Profile
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: palette.blue, fontWeight: '700' },
  title: { color: palette.navy, fontSize: 30, fontWeight: '800' },
  copy: { color: palette.muted, lineHeight: 22 },
  cta: { borderRadius: 12, backgroundColor: palette.navy },
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, borderRadius: 16, backgroundColor: '#fff' },
  statValue: { color: palette.navy, fontSize: 28, fontWeight: '800' },
  statLabel: { color: palette.muted },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  section: { color: palette.navy, fontSize: 18, fontWeight: '700' },
  link: { color: palette.blue, fontWeight: '700' },
  card: { borderRadius: 16, backgroundColor: '#fff' },
  cardTitle: { color: palette.navy, fontWeight: '700', fontSize: 16 },
  meta: { color: palette.muted, marginTop: 4 },
  error: { color: palette.danger },
});
