import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SegmentedButtons, Text } from 'react-native-paper';
import { EvaluationResultView } from '@/components/EvaluationResultView';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen, ScreenHeader } from '@/components/Screen';
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
import { fonts, palette, spacing } from '@/lib/theme';
import type { ApiEnvelope, EvaluationView } from '@/lib/types';

export default function EvaluationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/(app)/(tabs)/home');
          }}
          style={styles.backHit}
        >
          <Text style={styles.backLabel}>← Back</Text>
        </Pressable>
      ),
    });
  }, [navigation, router]);

  if (query.isLoading) {
    return (
      <Screen>
        <Text style={styles.meta}>Loading evaluation…</Text>
      </Screen>
    );
  }
  if (query.isError || !query.data) {
    return (
      <Screen>
        <ScreenHeader title="Unable to open evaluation" subtitle={getErrorMessage(query.error)} />
        <PrimaryButton label="Back to history" onPress={() => router.replace('/(app)/(tabs)/history')} />
      </Screen>
    );
  }

  const { evaluation } = query.data;
  return (
    <Screen>
      <ScreenHeader
        eyebrow={statusLabels[evaluation.status]}
        title={propertyHeading(evaluation.property_title, evaluation.property_type, evaluation.city)}
        subtitle={`${formatDate(evaluation.created_at)} · Asking ${formatMoney(evaluation.asking_price, evaluation.currency)}`}
      />

      <View style={styles.facts}>
        <Text style={styles.fact}>
          {labelFor(propertyTypeOptions, evaluation.property_type)} · {evaluation.location}, {evaluation.city}
        </Text>
        <Text style={styles.fact}>
          {evaluation.property_size} {labelFor(areaUnitOptions, evaluation.area_unit)} ·{' '}
          {labelFor(conditionOptions, evaluation.property_condition)}
        </Text>
        {evaluation.bedrooms != null || evaluation.bathrooms != null ? (
          <Text style={styles.fact}>
            {evaluation.bedrooms != null ? `${evaluation.bedrooms} beds` : 'Beds n/a'}
            {' · '}
            {evaluation.bathrooms != null ? `${evaluation.bathrooms} baths` : 'Baths n/a'}
          </Text>
        ) : null}
      </View>

      {evaluation.status === 'completed' ? (
        <SegmentedButtons
          value={section}
          onValueChange={(value) => setSection(value as 'valuation' | 'investment')}
          style={styles.segments}
          buttons={[
            { value: 'valuation', label: 'Valuation' },
            { value: 'investment', label: 'Investment' },
          ]}
        />
      ) : null}

      <EvaluationResultView view={query.data} section={section} />

      <View style={styles.actions}>
        <PrimaryButton label="Done" onPress={() => router.replace('/(app)/(tabs)/home')} />
        <PrimaryButton
          label="Evaluate another"
          mode="outlined"
          onPress={() => router.replace('/(app)/(tabs)/evaluate')}
        />
        {remove.isError ? <Text style={styles.error}>{getErrorMessage(remove.error)}</Text> : null}
        <PrimaryButton
          label="Delete evaluation"
          mode="text"
          tone="danger"
          loading={remove.isPending}
          onPress={() =>
            Alert.alert('Delete evaluation', 'This removes the property and its valuation from your account.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => remove.mutate() },
            ])
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backHit: { paddingHorizontal: 4, paddingVertical: 8 },
  backLabel: { color: palette.navy, fontFamily: fonts.bodyBold, fontSize: 16 },
  facts: {
    gap: 6,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
  },
  fact: { color: palette.ink, fontFamily: fonts.bodyMedium, lineHeight: 22 },
  meta: { color: palette.muted, fontFamily: fonts.body },
  segments: { backgroundColor: palette.mist, borderRadius: 14 },
  actions: { gap: 10, marginTop: spacing.md },
  error: { color: palette.danger, fontFamily: fonts.bodyMedium },
});
