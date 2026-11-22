import { useMutation } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { api, getErrorMessage } from '@/lib/api';
import { queryClient } from '@/lib/query-client';
import { palette } from '@/lib/theme';
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
      {mutation.isError ? (
        <>
          <Text style={styles.title}>Evaluation could not be completed</Text>
          <Text style={styles.copy}>{getErrorMessage(mutation.error)}</Text>
          <Button mode="contained" style={styles.button} onPress={() => mutation.mutate()}>
            Try again
          </Button>
          <Button mode="text" onPress={() => router.replace('/(app)/(tabs)/history')}>
            Back to history
          </Button>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color={palette.blue} />
          <Text style={styles.title}>Analyzing this property</Text>
          <Text style={styles.copy}>
            The server is checking verified market records and requesting a structured valuation. This can take a
            moment.
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 12,
  },
  title: { color: palette.navy, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  copy: { color: palette.muted, textAlign: 'center', lineHeight: 22 },
  button: { borderRadius: 12, backgroundColor: palette.navy, marginTop: 8 },
});
