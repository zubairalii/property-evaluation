import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import type { ZodTypeAny } from 'zod';
import { palette } from '@/lib/theme';

export function Field({
  label,
  value,
  onChange,
  onBlur,
  error,
  secure = false,
  keyboard = 'default' as 'default' | 'email-address' | 'numeric' | 'phone-pad',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  secure?: boolean;
  keyboard?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}) {
  return (
    <View>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        secureTextEntry={secure}
        keyboardType={keyboard}
        autoCapitalize={keyboard === 'email-address' ? 'none' : 'sentences'}
        error={Boolean(error)}
      />
      {error ? <HelperText type="error">{error}</HelperText> : null}
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
              secure={field.secure}
              keyboard={field.keyboard}
            />
          )}
        />
      ))}
      <Button
        mode="contained"
        loading={form.formState.isSubmitting}
        disabled={form.formState.isSubmitting}
        onPress={() => {
          void form.handleSubmit((values) => onSubmit(values as never))();
        }}
        style={styles.button}
      >
        {submitLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 4 },
  button: { marginTop: 8, borderRadius: 12, backgroundColor: palette.navy },
});
