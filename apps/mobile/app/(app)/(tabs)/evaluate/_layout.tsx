import { Stack } from 'expo-router';
import { palette } from '@/lib/theme';

export default function EvaluateLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerTintColor: palette.navy,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Property details' }} />
      <Stack.Screen name="review" options={{ title: 'Review details' }} />
      <Stack.Screen name="loading" options={{ title: 'Evaluating', headerBackVisible: false }} />
    </Stack>
  );
}
