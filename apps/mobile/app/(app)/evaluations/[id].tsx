import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, SegmentedButtons, Text } from 'react-native-paper';
import { EvaluationResultView } from '@/components/EvaluationResultView';
import { Screen } from '@/components/Screen';
import { api, getErrorMessage } from '@/lib/api';
import {
  areaUnitOptions,
  conditionOptions,
  formatDate,
  formatMoney,
  labelFor,
  propertyHeading,
  propertyTypeOptions,
  statusLabels,
} from '@/lib/labels';
import { palette } from '@/lib/theme';
import type { ApiEnvelope, EvaluationView } from '@/lib/types';

export default function EvaluationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const client = useQueryClient();
  const [section, setSection] = useState<'valuation' | 'investment'>('valuation');
  const query = useQuery({
    queryKey: ['evaluations', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await api.get<ApiEnvelope<EvaluationView>>(`/evaluations/${id}`);
      return response.data.data;
    },
  });
  const remove = useMutation({
    mutationFn: async () => {
      await api.delete(`/evaluations/${id}`);
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['evaluations'] });
      router.replace('/(app)/(tabs)/history');
    },
  });

  if (query.isLoading) {
    return (
      <Screen>
        <Text>Loading evaluation…</Text>
      </Screen>
    );
  }
  if (query.isError || !query.data) {
    return (
      <Screen>
        <Text style={styles.error}>{getErrorMessage(query.error)}</Text>
      </Screen>
    );
  }

  const { evaluation } = query.data;
  return (
    <Screen>
      <Text style={styles.title}>{propertyHeading(evaluation.property_title, evaluation.property_type, evaluation.city)}</Text>
      <Text style={styles.meta}>
        {formatDate(evaluation.created_at)} · {statusLabels[evaluation.status]}
      </Text>
      <View style={styles.facts}>
        <Text style={styles.fact}>
          {labelFor(propertyTypeOptions, evaluation.property_type)} · {evaluation.location}, {evaluation.city}, {evaluation.country}
        </Text>
        <Text style={styles.fact}>
          {evaluation.property_size} {labelFor(areaUnitOptions, evaluation.area_unit)} · {labelFor(conditionOptions, evaluation.property_condition)}
        </Text>
        <Text style={styles.fact}>Asking {formatMoney(evaluation.asking_price, evaluation.currency)}</Text>
        {evaluation.bedrooms != null ? <Text style={styles.fact}>{evaluation.bedrooms} bedrooms</Text> : null}
        {evaluation.bathrooms != null ? <Text style={styles.fact}>{evaluation.bathrooms} bathrooms</Text> : null}
      </View>
      {evaluation.status === 'completed' ? (
        <SegmentedButtons
          value={section}
          onValueChange={(value) => setSection(value as 'valuation' | 'investment')}
          buttons={[
            { value: 'valuation', label: 'Valuation' },
            { value: 'investment', label: 'Investment' },
          ]}
        />
      ) : null}
      <EvaluationResultView view={query.data} section={section} />
      {remove.isError ? <Text style={styles.error}>{getErrorMessage(remove.error)}</Text> : null}
      <Button
        mode="text"
        textColor={palette.danger}
        onPress={() =>
          Alert.alert('Delete evaluation', 'This removes the property and its valuation from your account.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => remove.mutate() },
          ])
        }
      >
        Delete evaluation
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: palette.navy, fontSize: 26, fontWeight: '800' },
  meta: { color: palette.muted },
  facts: { gap: 4 },
  fact: { color: '#0F172A', lineHeight: 22 },
  error: { color: palette.danger },
});
