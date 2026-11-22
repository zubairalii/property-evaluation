import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { HelperText, Text, TextInput } from 'react-native-paper';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen, ScreenHeader, SectionTitle } from '@/components/Screen';
import { useAuth } from '@/context/auth';
import { api, getErrorMessage } from '@/lib/api';
import { fonts, palette } from '@/lib/theme';
import { profileSchema, type ProfileValues } from '@/lib/validation/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, refreshProfile, signOut } = useAuth();
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: { full_name: profile?.full_name ?? '', phone: profile?.phone ?? '' },
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

  return (
    <Screen>
      <ScreenHeader eyebrow="Account" title="Profile" subtitle={profile?.email ?? 'Signed in'} />
      <SectionTitle>Account details</SectionTitle>
      <Controller
        control={profileForm.control}
        name="full_name"
        render={({ field, fieldState }) => (
          <>
            <TextInput
              mode="outlined"
              label="Full name"
              value={field.value}
              onChangeText={field.onChange}
              outlineColor={palette.line}
              activeOutlineColor={palette.teal}
              style={styles.input}
              error={Boolean(fieldState.error)}
            />
            {fieldState.error ? <HelperText type="error">{fieldState.error.message}</HelperText> : null}
          </>
        )}
      />
      <Controller
        control={profileForm.control}
        name="phone"
        render={({ field, fieldState }) => (
          <>
            <TextInput
              mode="outlined"
              label="Phone"
              value={field.value}
              keyboardType="phone-pad"
              onChangeText={field.onChange}
              outlineColor={palette.line}
              activeOutlineColor={palette.teal}
              style={styles.input}
              error={Boolean(fieldState.error)}
            />
            {fieldState.error ? <HelperText type="error">{fieldState.error.message}</HelperText> : null}
          </>
        )}
      />
      {profileMessage ? <Text style={styles.note}>{profileMessage}</Text> : null}
      <PrimaryButton
        label="Save profile"
        loading={profileForm.formState.isSubmitting}
        onPress={() => {
          void profileForm.handleSubmit(saveProfile)();
        }}
      />
      <PrimaryButton
        label="Change password"
        mode="outlined"
        onPress={() => router.push('/(app)/change-password')}
      />
      <PrimaryButton label="Log out" mode="text" tone="danger" onPress={() => signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { backgroundColor: palette.card },
  note: { color: palette.navy, fontFamily: fonts.bodyMedium },
});
