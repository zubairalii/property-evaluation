import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { AuthForm } from '@/components/AuthForm';
import { Screen, ScreenHeader } from '@/components/Screen';
import { supabase } from '@/lib/supabase';
import { fonts, palette } from '@/lib/theme';
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
      <ScreenHeader
        eyebrow="Smart Property Evaluator"
        title="Welcome back"
        subtitle="Sign in to evaluate a property or review your history."
      />
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
  error: { color: palette.danger, fontFamily: fonts.bodyMedium },
  link: { color: palette.teal, fontFamily: fonts.bodyBold, marginTop: 8 },
});
