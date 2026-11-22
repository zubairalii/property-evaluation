import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { AuthForm } from '@/components/AuthForm';
import { Screen } from '@/components/Screen';
import { supabase } from '@/lib/supabase';
import { palette } from '@/lib/theme';
import { forgotSchema, type ForgotValues } from '@/lib/validation/auth';
import * as Linking from 'expo-linking';

export default function ForgotPasswordScreen() {
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(values: ForgotValues) {
    setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: Linking.createURL('/reset-password'),
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage('If an account exists for that email, a reset link is on its way.');
  }

  return (
    <Screen>
      <Text style={styles.title}>Reset your password</Text>
      <Text style={styles.copy}>We will email you a link that opens this app so you can choose a new password.</Text>
      {message ? <Text style={styles.note}>{message}</Text> : null}
      <AuthForm
        schema={forgotSchema}
        defaults={{ email: '' }}
        submitLabel="Send reset link"
        onSubmit={onSubmit}
        fields={[{ name: 'email', label: 'Email', keyboard: 'email-address' }]}
      />
      <Link href="/(auth)/login" style={styles.link}>
        Back to sign in
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: palette.navy, fontSize: 32, fontWeight: '800' },
  copy: { color: palette.muted, lineHeight: 22 },
  note: { color: palette.navy },
  link: { color: palette.blue, fontWeight: '600', marginTop: 12 },
});
