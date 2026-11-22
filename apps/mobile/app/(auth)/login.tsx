import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { AuthForm } from '@/components/AuthForm';
import { Screen } from '@/components/Screen';
import { getErrorMessage } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { palette } from '@/lib/theme';
import { loginSchema, type LoginValues } from '@/lib/validation/auth';

export default function LoginScreen() {
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(values: LoginValues) {
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) setMessage(error.message);
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.brand}>Smart Property Evaluator</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.copy}>Sign in to evaluate a property or review your history.</Text>
      </View>
      {message ? <Text style={styles.error}>{message}</Text> : null}
      <AuthForm
        schema={loginSchema}
        defaults={{ email: '', password: '' }}
        submitLabel="Sign in"
        onSubmit={onSubmit}
        fields={[
          { name: 'email', label: 'Email', keyboard: 'email-address' },
          { name: 'password', label: 'Password', secure: true },
        ]}
      />
      <Link href="/(auth)/forgot-password" style={styles.link}>
        Forgot password?
      </Link>
      <Link href="/(auth)/register" style={styles.link}>
        Create an account
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 6, marginBottom: 8 },
  brand: { color: palette.blue, fontWeight: '700' },
  title: { color: palette.navy, fontSize: 32, fontWeight: '800' },
  copy: { color: palette.muted, lineHeight: 22 },
  error: { color: palette.danger },
  link: { color: palette.blue, fontWeight: '600', marginTop: 8 },
});
