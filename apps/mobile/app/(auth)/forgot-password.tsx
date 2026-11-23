import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { AuthForm } from '@/components/AuthForm';
import { AuthPanel, Screen, ScreenHeader } from '@/components/Screen';
import { supabase } from '@/lib/supabase';
import { fonts, palette } from '@/lib/theme';
import { forgotSchema, type ForgotValues } from '@/lib/validation/auth';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(values: ForgotValues) {
    setMessage(null);
    const email = values.email.trim().toLowerCase();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setMessage(error.message);
      return;
    }
    router.push({
      pathname: '/(auth)/verify-recovery',
      params: { email },
    });
  }

  return (
    <Screen centered>
      <AuthPanel>
        <ScreenHeader
          eyebrow="Account recovery"
          title="Reset your password"
          subtitle="Enter your email and we’ll send a verification code you can use in the app."
        />
        {message ? <Text style={styles.note}>{message}</Text> : null}
        <AuthForm
          schema={forgotSchema}
          defaults={{ email: '' }}
          submitLabel="Send verification code"
          onSubmit={onSubmit}
          fields={[{ name: 'email', label: 'Email', keyboard: 'email-address' }]}
        />
        <Link href="/(auth)/login" style={styles.link}>
          Back to sign in
        </Link>
      </AuthPanel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { color: palette.danger, fontFamily: fonts.bodyMedium, lineHeight: 21 },
  link: { color: palette.teal, fontFamily: fonts.bodyBold, marginTop: 8 },
});
