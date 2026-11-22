import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { ONBOARDING_KEY, secureStoreAdapter } from '@/lib/secure-store';
import { palette } from '@/lib/theme';

const slides = [
  {
    title: 'Understand the asking price',
    body: 'Enter the property details you already have and compare the asking price with an AI-assisted estimate.',
  },
  {
    title: 'See the investment case',
    body: 'Review advantages, risks, and points to check before you make an offer.',
  },
  {
    title: 'Keep every evaluation',
    body: 'Your history stays private to your account so you can revisit a property later.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const slide = slides[index] ?? slides[0];

  async function finish() {
    await secureStoreAdapter.setItem(ONBOARDING_KEY, '1');
    router.replace('/(auth)/login');
  }

  if (!slide) return null;

  return (
    <View style={styles.screen}>
      <Text style={styles.brand}>Smart Property Evaluator</Text>
      <View style={styles.card}>
        <Text style={styles.step}>
          {index + 1} / {slides.length}
        </Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>
      <View style={styles.actions}>
        <Button mode="text" textColor="#DBEAFE" onPress={finish}>
          Skip
        </Button>
        {index < slides.length - 1 ? (
          <Button mode="contained" buttonColor="#FFFFFF" textColor={palette.navy} onPress={() => setIndex(index + 1)}>
            Next
          </Button>
        ) : (
          <Button mode="contained" buttonColor="#FFFFFF" textColor={palette.navy} onPress={finish}>
            Get started
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.navy, padding: 24, justifyContent: 'center', gap: 24 },
  brand: { color: '#93C5FD', fontWeight: '700', letterSpacing: 0.4 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, gap: 12 },
  step: { color: palette.muted, fontWeight: '600' },
  title: { color: palette.navy, fontSize: 28, fontWeight: '800' },
  body: { color: '#334155', fontSize: 16, lineHeight: 24 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
