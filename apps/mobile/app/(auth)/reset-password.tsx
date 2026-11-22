import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { AuthForm } from '@/components/AuthForm';
import { Screen, ScreenHeader } from '@/components/Screen';
import { useAuth } from '@/context/auth';
import { supabase } from '@/lib/supabase';
import { fonts, palette } from '@/lib/theme';
import { resetSchema, type ResetValues } from '@/lib/validation/auth';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { clearPasswordRecovery } = useAuth();
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(values: ResetValues) {
    setMessage(null);
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setMessage(error.message);
      return;
    }
    clearPasswordRecovery();
    router.replace('/(app)/(tabs)/home');
  }

  return (
    <Screen>
      <ScreenHeader eyebrow="Account recovery" title="Choose a new password" />
      {message ? <Text style={styles.note}>{message}</Text> : null}
      <AuthForm
        schema={resetSchema}
        defaults={{ password: '', confirm_password: '' }}
        submitLabel="Update password"
        onSubmit={onSubmit}
        fields={[
          {
            name: 'password',
            label: 'New password',
            secure: true,
            hint: '8+ characters with upper, lower, number, and a special character.',
          },
          { name: 'confirm_password', label: 'Confirm password', secure: true },
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { color: palette.danger, fontFamily: fonts.bodyMedium },
});
