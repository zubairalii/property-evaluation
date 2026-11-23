import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HelperText, TextInput } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import type { ZodTypeAny } from 'zod';
import { PrimaryButton } from '@/components/PrimaryButton';
import { palette } from '@/lib/theme';

export function Field({
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  secure = false,
  keyboard = 'default' as 'default' | 'email-address' | 'numeric' | 'phone-pad',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: string;
  secure?: boolean;
  keyboard?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        secureTextEntry={secure && !visible}
        keyboardType={keyboard}
        autoCapitalize={keyboard === 'email-address' || keyboard === 'numeric' ? 'none' : 'sentences'}
        autoCorrect={false}
        error={Boolean(error)}
        outlineColor={palette.line}
        activeOutlineColor={palette.teal}
        style={styles.input}
        right={
          secure ? (
            <TextInput.Icon
              icon={visible ? 'eye-off-outline' : 'eye-outline'}
              color={palette.muted}
              onPress={() => setVisible((current) => !current)}
              forceTextInputFocus={false}
              accessibilityLabel={visible ? 'Hide password' : 'Show password'}
            />
          ) : undefined
        }
      />
      {error ? <HelperText type="error">{error}</HelperText> : null}
      {!error && hint ? <HelperText type="info">{hint}</HelperText> : null}
    </View>
  );
}

export function AuthForm({
  schema,
  defaults,
  submitLabel,
  onSubmit,
  fields,
}: {
  schema: ZodTypeAny;
  defaults: Record<string, string>;
  submitLabel: string;
  onSubmit: (values: never) => Promise<void>;
  fields: Array<{
    name: string;
    label: string;
    secure?: boolean;
    keyboard?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    hint?: string;
  }>;
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  return (
    <View style={styles.form}>
      {fields.map((field) => (
        <Controller
          key={field.name}
          control={form.control}
          name={field.name}
          render={({ field: control, fieldState }) => (
            <Field
              label={field.label}
              value={String(control.value ?? '')}
              onChange={control.onChange}
              onBlur={control.onBlur}
              error={fieldState.error?.message}
              hint={field.hint}
              secure={field.secure}
              keyboard={field.keyboard}
            />
          )}
        />
      ))}
      <PrimaryButton
        label={form.formState.isSubmitting ? `${submitLabel}` : submitLabel}
        loading={form.formState.isSubmitting}
        onPress={() => {
          void form.handleSubmit((values) => onSubmit(values as never))();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  input: { backgroundColor: palette.card },
});
