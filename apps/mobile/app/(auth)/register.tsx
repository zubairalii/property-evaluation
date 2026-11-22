import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { AuthForm } from '@/components/AuthForm';
import { Screen } from '@/components/Screen';
import { supabase } from '@/lib/supabase';
import { palette } from '@/lib/theme';
import { registerSchema, type RegisterValues } from '@/lib/validation/auth';

export default function RegisterScreen() {
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(values: RegisterValues) {
    setMessage(null);
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.full_name } },
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    if (!data.session) {
      setMessage('Account created. Confirm your email if your project requires it, then sign in.');
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.copy}>Use the same account to view evaluations on this device.</Text>
      {message ? <Text style={styles.note}>{message}</Text> : null}
      <AuthForm
        schema={registerSchema}
        defaults={{ full_name: '', email: '', password: '', confirm_password: '' }}
        submitLabel="Create account"
        onSubmit={onSubmit}
        fields={[
          { name: 'full_name', label: 'Full name' },
          { name: 'email', label: 'Email', keyboard: 'email-address' },
          { name: 'password', label: 'Password', secure: true },
          { name: 'confirm_password', label: 'Confirm password', secure: true },
        ]}
      />
      <Link href="/(auth)/login" style={styles.link}>
        Already have an account? Sign in
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
