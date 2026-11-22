import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { AuthForm } from '@/components/AuthForm';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/context/auth';
import { supabase } from '@/lib/supabase';
import { fonts, palette } from '@/lib/theme';
import { changePasswordSchema, type ChangePasswordValues } from '@/lib/validation/auth';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(values: ChangePasswordValues) {
    setMessage(null);
    const email = profile?.email;
    if (!email) {
      setMessage('Unable to verify your account. Sign in again and retry.');
      return;
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: values.current_password,
    });
    if (verifyError) {
      setMessage('Current password is incorrect.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setMessage(error.message);
      return;
    }

    router.back();
  }

  return (
    <Screen>
      <Text style={styles.subtitle}>Confirm your current password, then choose a new one.</Text>
      {message ? <Text style={styles.note}>{message}</Text> : null}
      <AuthForm
        schema={changePasswordSchema}
        defaults={{ current_password: '', password: '', confirm_password: '' }}
        submitLabel="Update password"
        onSubmit={onSubmit}
        fields={[
          { name: 'current_password', label: 'Current password', secure: true },
          {
            name: 'password',
            label: 'New password',
            secure: true,
            hint: '8+ characters with upper, lower, number, and a special character.',
          },
          { name: 'confirm_password', label: 'Confirm new password', secure: true },
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: palette.muted, fontFamily: fonts.body, lineHeight: 22, fontSize: 15 },
  note: { color: palette.danger, fontFamily: fonts.bodyMedium, lineHeight: 21 },
});
