import { useMutation } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { PrimaryButton } from '@/components/PrimaryButton';
import { api, getErrorMessage } from '@/lib/api';
import { queryClient } from '@/lib/query-client';
import { fonts, palette, spacing } from '@/lib/theme';
import type { ApiEnvelope, EvaluationView } from '@/lib/types';

export default function LoadingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const started = useRef(false);
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<ApiEnvelope<EvaluationView>>(`/evaluations/${id}/analyze`);
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      router.replace(`/(app)/evaluations/${id}`);
    },
  });

  useEffect(() => {
    if (!id || started.current) return;
    started.current = true;
    mutation.mutate();
  }, [id, mutation]);

  return (
    <View style={styles.screen}>
      <LinearGradient colors={[palette.mist, palette.background, '#F8FBFD']} style={StyleSheet.absoluteFill} />
      <View style={styles.card}>
        {mutation.isError ? (
          <>
            <Text style={styles.title}>Evaluation could not be completed</Text>
            <Text style={styles.copy}>{getErrorMessage(mutation.error)}</Text>
            <PrimaryButton label="Try again" onPress={() => mutation.mutate()} />
            <PrimaryButton
              label="Back to history"
              mode="outlined"
              onPress={() => router.replace('/(app)/(tabs)/history')}
            />
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color={palette.teal} />
            <Text style={styles.title}>Analyzing this property</Text>
            <Text style={styles.copy}>
              Matching local market records and preparing your valuation. This usually takes a few seconds.
            </Text>
            <PrimaryButton
              label="Cancel to history"
              mode="text"
              onPress={() => router.replace('/(app)/(tabs)/history')}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.xl,
    gap: spacing.md,
    alignItems: 'center',
  },
  title: {
    color: palette.navy,
    fontFamily: fonts.displayBold,
    fontSize: 26,
    textAlign: 'center',
    lineHeight: 32,
  },
  copy: {
    color: palette.muted,
    fontFamily: fonts.body,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 15,
  },
});
