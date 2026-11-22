import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/auth';
import { fonts, palette } from '@/lib/theme';

export default function AppLayout() {
  const { ready, session } = useAuth();
  if (!ready) return null;
  if (!session) return <Redirect href="/(auth)/login" />;
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
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="change-password"
        options={{
          title: 'Change password',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="evaluations/[id]"
        options={{
          title: 'Evaluation',
          headerBackTitle: 'Back',
        }}
      />

    </Stack>
  );
}
