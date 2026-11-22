import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuth } from '@/context/auth';
import { ONBOARDING_KEY, secureStoreAdapter } from '@/lib/secure-store';
import { palette } from '@/lib/theme';

export default function Index() {
  const { ready, session, configured } = useAuth();
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    secureStoreAdapter.getItem(ONBOARDING_KEY).then((seen) => {
      if (!seen) {
        setHref('/onboarding');
        return;
      }
      setHref(session ? '/(app)/(tabs)/home' : '/(auth)/login');
    });
  }, [ready, session]);

  if (!configured) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Smart Property Evaluator</Text>
        <Text style={styles.copy}>Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to apps/mobile/.env.</Text>
      </View>
    );
  }

  if (!href) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Smart Property Evaluator</Text>
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }

  return <Redirect href={href as never} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.navy,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center' },
  copy: { color: '#DBEAFE', textAlign: 'center', lineHeight: 22 },
});
