import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { AuthForm } from '@/components/AuthForm';
import { AuthPanel, Screen, ScreenHeader } from '@/components/Screen';
import { supabase } from '@/lib/supabase';
import { fonts, palette } from '@/lib/theme';
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
    <Screen centered>
      <AuthPanel>
        <ScreenHeader
          eyebrow="Get started"
          title="Create your account"
          subtitle="Use the same account to view evaluations on this device."
        />
        {message ? <Text style={styles.note}>{message}</Text> : null}
        <AuthForm
          schema={registerSchema}
          defaults={{ full_name: '', email: '', password: '', confirm_password: '' }}
          submitLabel="Create account"
          onSubmit={onSubmit}
          fields={[
            { name: 'full_name', label: 'Full name' },
            { name: 'email', label: 'Email', keyboard: 'email-address' },
            {
              name: 'password',
              label: 'Password',
              secure: true,
              hint: '8+ characters with upper, lower, number, and a special character.',
            },
            { name: 'confirm_password', label: 'Confirm password', secure: true },
          ]}
        />
        <Link href="/(auth)/login" style={styles.link}>
          Already have an account? Sign in
        </Link>
      </AuthPanel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { color: palette.navy, fontFamily: fonts.bodyMedium, lineHeight: 21 },
  link: { color: palette.teal, fontFamily: fonts.bodyBold, marginTop: 4 },
});
