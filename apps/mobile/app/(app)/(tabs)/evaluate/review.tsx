import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { Screen } from '@/components/Screen';
import { useDraft } from '@/context/draft';
import { api, getErrorMessage } from '@/lib/api';
import { queryClient } from '@/lib/query-client';
import {
  areaUnitOptions,
  conditionOptions,
  formatMoney,
  labelFor,
  propertyTypeOptions,
} from '@/lib/labels';
import { palette } from '@/lib/theme';
import type { ApiEnvelope, Evaluation } from '@/lib/types';
import { toPropertyPayload } from '@/lib/validation/property';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function ReviewScreen() {
  const router = useRouter();
  const { draft, clearDraft } = useDraft();
  const payload = toPropertyPayload(draft);
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<ApiEnvelope<Evaluation>>('/evaluations', payload);
      return response.data.data;
    },
    onSuccess: async (evaluation) => {
      await queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      clearDraft();
      router.replace({ pathname: '/(app)/(tabs)/evaluate/loading', params: { id: evaluation.id } });
    },
  });

  return (
    <Screen>
      <Text style={styles.intro}>Confirm these details before the valuation is generated.</Text>
      <Card style={styles.card}>
        <Card.Content style={styles.rows}>
          <Row label="Title" value={payload.property_title ?? 'Not provided'} />
          <Row label="Type" value={labelFor(propertyTypeOptions, payload.property_type)} />
          <Row label="Location" value={`${payload.location}, ${payload.city}, ${payload.country}`} />
          <Row label="Size" value={`${payload.property_size} ${labelFor(areaUnitOptions, payload.area_unit)}`} />
          <Row label="Covered area" value={payload.covered_area == null ? 'Not provided' : String(payload.covered_area)} />
          <Row label="Bedrooms" value={payload.bedrooms == null ? 'Not provided' : String(payload.bedrooms)} />
          <Row label="Bathrooms" value={payload.bathrooms == null ? 'Not provided' : String(payload.bathrooms)} />
          <Row label="Condition" value={labelFor(conditionOptions, payload.property_condition)} />
          <Row label="Asking price" value={formatMoney(payload.asking_price, payload.currency)} />
        </Card.Content>
      </Card>
      {mutation.isError ? <Text style={styles.error}>{getErrorMessage(mutation.error)}</Text> : null}
      <Button mode="contained" loading={mutation.isPending} disabled={mutation.isPending} style={styles.button} onPress={() => mutation.mutate()}>
        Generate evaluation
      </Button>
      <Button mode="outlined" onPress={() => router.back()}>
        Edit details
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { color: palette.muted, lineHeight: 22 },
  card: { borderRadius: 16, backgroundColor: '#fff' },
  rows: { gap: 10 },
  row: { gap: 2 },
  label: { color: palette.muted, fontSize: 12, fontWeight: '600' },
  value: { color: palette.navy, fontSize: 16, fontWeight: '600' },
  button: { borderRadius: 12, backgroundColor: palette.navy },
  error: { color: palette.danger },
});
