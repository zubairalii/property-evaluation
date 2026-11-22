import { Redirect, Stack, useSegments } from 'expo-router';
import { useAuth } from '@/context/auth';
import { fonts, palette } from '@/lib/theme';

export default function AuthLayout() {
  const { ready, session, passwordRecovery } = useAuth();
  const segments = useSegments();
  const onResetPassword = segments.includes('reset-password');

  if (ready && session && passwordRecovery && !onResetPassword) {
    return <Redirect href="/(auth)/reset-password" />;
  }

  if (ready && session && !passwordRecovery) {
    return <Redirect href="/(app)/(tabs)/home" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.background },
        headerTitleStyle: { fontFamily: fonts.bodyBold },
      }}
    />
  );
}
