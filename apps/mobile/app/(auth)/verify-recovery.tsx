import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { AuthForm } from '@/components/AuthForm';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen, ScreenHeader } from '@/components/Screen';
import { useAuth } from '@/context/auth';
import { supabase } from '@/lib/supabase';
import { fonts, palette } from '@/lib/theme';
import { recoveryCodeSchema, type RecoveryCodeValues } from '@/lib/validation/auth';

export default function VerifyRecoveryScreen() {
  const router = useRouter();
  const { beginPasswordRecovery } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = String(params.email ?? '')
    .trim()
    .toLowerCase();
  const [message, setMessage] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  async function onSubmit(values: RecoveryCodeValues) {
    setMessage(null);
    if (!email) {
      setMessage('Missing email. Go back and request a new code.');
      return;
    }

    // Mark recovery before verify so a new session does not bounce to home.
    beginPasswordRecovery();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: values.code.trim(),
      type: 'recovery',
    });
    if (error) {
      setMessage(error.message);
      return;
    }

    router.replace('/(auth)/reset-password');
  }

  async function resendCode() {
    if (!email) return;
    setResending(true);
    setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setResending(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage('A new verification code was sent to your email.');
  }

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Account recovery"
        title="Enter verification code"
        subtitle={
          email
            ? `Type the code we sent to ${email}, then set a new password.`
            : 'Type the code from your email, then set a new password.'
        }
      />
      {message ? <Text style={styles.note}>{message}</Text> : null}
      <AuthForm
        schema={recoveryCodeSchema}
        defaults={{ code: '' }}
        submitLabel="Verify code"
        onSubmit={onSubmit}
        fields={[{ name: 'code', label: 'Verification code', keyboard: 'numeric' }]}
      />
      <PrimaryButton
        label={resending ? 'Sending' : 'Resend code'}
        mode="outlined"
        loading={resending}
        onPress={() => {
          void resendCode();
        }}
      />
      <Link href="/(auth)/forgot-password" style={styles.link}>
        Use a different email
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { color: palette.navy, fontFamily: fonts.bodyMedium, lineHeight: 21 },
  link: { color: palette.teal, fontFamily: fonts.bodyBold, marginTop: 4 },
});
