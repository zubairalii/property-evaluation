import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/auth';

export default function AppLayout() {
  const { ready, session } = useAuth();
  if (!ready) return null;
  if (!session) return <Redirect href="/(auth)/login" />;
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="evaluations/[id]" options={{ title: 'Evaluation', headerTintColor: '#172554' }} />
    </Stack>
  );
}
