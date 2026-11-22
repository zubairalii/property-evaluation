import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/auth';

export default function AuthLayout() {
  const { ready, session } = useAuth();
  if (ready && session) return <Redirect href="/(app)/(tabs)/home" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
