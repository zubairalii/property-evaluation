import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { AuthForm } from '@/components/AuthForm';
import { Screen } from '@/components/Screen';
import { supabase } from '@/lib/supabase';
import { palette } from '@/lib/theme';
import { resetSchema, type ResetValues } from '@/lib/validation/auth';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(values: ResetValues) {
    setMessage(null);
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setMessage(error.message);
      return;
    }
    router.replace('/(app)/(tabs)/home');
  }

  return (
    <Screen>
      <Text style={styles.title}>Choose a new password</Text>
      <Text style={styles.copy}>Use at least 8 characters. This replaces the password on your account.</Text>
      {message ? <Text style={styles.note}>{message}</Text> : null}
      <AuthForm
        schema={resetSchema}
        defaults={{ password: '', confirm_password: '' }}
        submitLabel="Update password"
        onSubmit={onSubmit}
        fields={[
          { name: 'password', label: 'New password', secure: true },
          { name: 'confirm_password', label: 'Confirm password', secure: true },
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: palette.navy, fontSize: 32, fontWeight: '800' },
  copy: { color: palette.muted, lineHeight: 22 },
  note: { color: palette.danger },
});
