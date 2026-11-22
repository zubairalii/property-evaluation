import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen, ScreenHeader } from '@/components/Screen';
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
import { fonts, palette, spacing } from '@/lib/theme';
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
      <ScreenHeader
        eyebrow="Review"
        title="Confirm property details"
        subtitle="Double-check the summary before we generate your valuation."
      />
      <View style={styles.card}>
        <Row label="Title" value={payload.property_title ?? 'Not provided'} />
        <Row label="Type" value={labelFor(propertyTypeOptions, payload.property_type)} />
        <Row label="Location" value={`${payload.location}, ${payload.city}`} />
        <Row label="Size" value={`${payload.property_size} ${labelFor(areaUnitOptions, payload.area_unit)}`} />
        <Row label="Covered area" value={payload.covered_area == null ? 'Not provided' : String(payload.covered_area)} />
        <Row label="Bedrooms" value={payload.bedrooms == null ? 'Not provided' : String(payload.bedrooms)} />
        <Row label="Bathrooms" value={payload.bathrooms == null ? 'Not provided' : String(payload.bathrooms)} />
        <Row label="Condition" value={labelFor(conditionOptions, payload.property_condition)} />
        <Row label="Asking price" value={formatMoney(payload.asking_price, payload.currency)} />
      </View>
      {mutation.isError ? <Text style={styles.error}>{getErrorMessage(mutation.error)}</Text> : null}
      <View style={styles.actions}>
        <PrimaryButton
          label={mutation.isPending ? 'Generating' : 'Generate evaluation'}
          loading={mutation.isPending}
          onPress={() => mutation.mutate()}
        />
        <PrimaryButton label="Edit details" mode="outlined" disabled={mutation.isPending} onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.lg,
    gap: 14,
  },
  row: { gap: 4 },
  label: {
    color: palette.muted,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  value: {
    color: palette.navy,
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    lineHeight: 22,
  },
  actions: { gap: 10, marginTop: spacing.sm },
  error: { color: palette.danger, fontFamily: fonts.bodyMedium, lineHeight: 20 },
});
