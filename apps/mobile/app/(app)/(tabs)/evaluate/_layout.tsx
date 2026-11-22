import { Stack } from 'expo-router';
import { fonts, palette } from '@/lib/theme';

export default function EvaluateLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerTintColor: palette.navy,
        headerTitleStyle: { fontFamily: fonts.bodyBold, fontSize: 17 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: palette.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Property details' }} />
      <Stack.Screen name="review" options={{ title: 'Review' }} />
      <Stack.Screen
        name="loading"
        options={{
          title: 'Evaluating',
          headerBackVisible: true,
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
