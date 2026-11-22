import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { Screen, SectionTitle } from '@/components/Screen';
import { useAuth } from '@/context/auth';
import { api, getErrorMessage } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { palette } from '@/lib/theme';
import { profileSchema, resetSchema, type ProfileValues, type ResetValues } from '@/lib/validation/auth';

export default function ProfileScreen() {
  const { profile, refreshProfile, signOut } = useAuth();
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: { full_name: profile?.full_name ?? '', phone: profile?.phone ?? '' },
  });
  const passwordForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirm_password: '' },
  });

  async function saveProfile(values: ProfileValues) {
    setProfileMessage(null);
    try {
      await api.patch('/users/me', {
        full_name: values.full_name,
        phone: values.phone.trim() ? values.phone.trim() : null,
      });
      await refreshProfile();
      setProfileMessage('Profile updated.');
    } catch (error) {
      setProfileMessage(getErrorMessage(error));
    }
  }

  async function savePassword(values: ResetValues) {
    setPasswordMessage(null);
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setPasswordMessage(error.message);
      return;
    }
    passwordForm.reset();
    setPasswordMessage('Password updated.');
  }

  return (
    <Screen>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.email}>{profile?.email}</Text>
      <SectionTitle>Account details</SectionTitle>
      <Controller
        control={profileForm.control}
        name="full_name"
        render={({ field, fieldState }) => (
          <>
            <TextInput mode="outlined" label="Full name" value={field.value} onChangeText={field.onChange} error={Boolean(fieldState.error)} />
            {fieldState.error ? <HelperText type="error">{fieldState.error.message}</HelperText> : null}
          </>
        )}
      />
      <Controller
        control={profileForm.control}
        name="phone"
        render={({ field, fieldState }) => (
          <>
            <TextInput mode="outlined" label="Phone" value={field.value} keyboardType="phone-pad" onChangeText={field.onChange} error={Boolean(fieldState.error)} />
            {fieldState.error ? <HelperText type="error">{fieldState.error.message}</HelperText> : null}
          </>
        )}
      />
      {profileMessage ? <Text style={styles.note}>{profileMessage}</Text> : null}
      <Button mode="contained" style={styles.button} loading={profileForm.formState.isSubmitting} onPress={() => {
        void profileForm.handleSubmit(saveProfile)();
      }}>
        Save profile
      </Button>
      <SectionTitle>Change password</SectionTitle>
      <Controller
        control={passwordForm.control}
        name="password"
        render={({ field, fieldState }) => (
          <>
            <TextInput mode="outlined" label="New password" secureTextEntry value={field.value} onChangeText={field.onChange} error={Boolean(fieldState.error)} />
            {fieldState.error ? <HelperText type="error">{fieldState.error.message}</HelperText> : null}
          </>
        )}
      />
      <Controller
        control={passwordForm.control}
        name="confirm_password"
        render={({ field, fieldState }) => (
          <>
            <TextInput mode="outlined" label="Confirm password" secureTextEntry value={field.value} onChangeText={field.onChange} error={Boolean(fieldState.error)} />
            {fieldState.error ? <HelperText type="error">{fieldState.error.message}</HelperText> : null}
          </>
        )}
      />
      {passwordMessage ? <Text style={styles.note}>{passwordMessage}</Text> : null}
      <Button mode="outlined" loading={passwordForm.formState.isSubmitting} onPress={() => {
        void passwordForm.handleSubmit(savePassword)();
      }}>
        Update password
      </Button>
      <Button mode="text" textColor={palette.danger} onPress={() => signOut()}>
        Log out
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: palette.navy, fontSize: 28, fontWeight: '800' },
  email: { color: palette.muted },
  button: { borderRadius: 12, backgroundColor: palette.navy },
  note: { color: palette.navy },
});
