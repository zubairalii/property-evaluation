import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { Screen, SectionTitle } from '@/components/Screen';
import { SelectField } from '@/components/SelectField';
import { useDraft } from '@/context/draft';
import {
  areaUnitOptions,
  conditionOptions,
  currencyOptions,
  propertyTypeOptions,
} from '@/lib/labels';
import { palette } from '@/lib/theme';
import { propertyFormSchema, type PropertyFormValues } from '@/lib/validation/property';

export default function PropertyFormScreen() {
  const router = useRouter();
  const { draft, setDraft } = useDraft();
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: draft,
  });

  function onSubmit(values: PropertyFormValues) {
    setDraft(values);
    router.push('/(app)/(tabs)/evaluate/review');
  }

  return (
    <Screen>
      <SectionTitle>Basic information</SectionTitle>
      <Controller
        control={form.control}
        name="property_title"
        render={({ field, fieldState }) => (
          <>
            <TextInput mode="outlined" label="Property title (optional)" value={field.value} onChangeText={field.onChange} error={Boolean(fieldState.error)} />
            {fieldState.error ? <HelperText type="error">{fieldState.error.message}</HelperText> : null}
          </>
        )}
      />
      <Controller
        control={form.control}
        name="property_type"
        render={({ field, fieldState }) => (
          <SelectField label="Property type" value={field.value} options={propertyTypeOptions} onChange={field.onChange} error={fieldState.error?.message} />
        )}
      />
      <Controller
        control={form.control}
        name="country"
        render={({ field, fieldState }) => (
          <>
            <TextInput mode="outlined" label="Country" value={field.value} onChangeText={field.onChange} error={Boolean(fieldState.error)} />
            {fieldState.error ? <HelperText type="error">{fieldState.error.message}</HelperText> : null}
          </>
        )}
      />
      <Controller
        control={form.control}
        name="city"
        render={({ field, fieldState }) => (
          <>
            <TextInput mode="outlined" label="City" value={field.value} onChangeText={field.onChange} error={Boolean(fieldState.error)} />
            {fieldState.error ? <HelperText type="error">{fieldState.error.message}</HelperText> : null}
          </>
        )}
      />
      <Controller
        control={form.control}
        name="location"
        render={({ field, fieldState }) => (
          <>
            <TextInput mode="outlined" label="Area / neighborhood" value={field.value} onChangeText={field.onChange} error={Boolean(fieldState.error)} />
            {fieldState.error ? <HelperText type="error">{fieldState.error.message}</HelperText> : null}
          </>
        )}
      />
      <Controller
        control={form.control}
        name="property_size"
        render={({ field, fieldState }) => (
          <>
            <TextInput mode="outlined" label="Property size" value={field.value} keyboardType="decimal-pad" onChangeText={field.onChange} error={Boolean(fieldState.error)} />
            {fieldState.error ? <HelperText type="error">{fieldState.error.message}</HelperText> : null}
          </>
        )}
      />
      <Controller
        control={form.control}
        name="area_unit"
        render={({ field, fieldState }) => (
          <SelectField label="Area unit" value={field.value} options={areaUnitOptions} onChange={field.onChange} error={fieldState.error?.message} />
        )}
      />
      <SectionTitle>Property details</SectionTitle>
      <Controller
        control={form.control}
        name="covered_area"
        render={({ field, fieldState }) => (
          <>
            <TextInput mode="outlined" label="Covered area (optional)" value={field.value} keyboardType="decimal-pad" onChangeText={field.onChange} error={Boolean(fieldState.error)} />
            {fieldState.error ? <HelperText type="error">{fieldState.error.message}</HelperText> : null}
          </>
        )}
      />
      <Controller
        control={form.control}
        name="bedrooms"
        render={({ field, fieldState }) => (
          <>
            <TextInput mode="outlined" label="Bedrooms (optional)" value={field.value} keyboardType="number-pad" onChangeText={field.onChange} error={Boolean(fieldState.error)} />
            {fieldState.error ? <HelperText type="error">{fieldState.error.message}</HelperText> : null}
          </>
        )}
      />
      <Controller
        control={form.control}
        name="bathrooms"
        render={({ field, fieldState }) => (
          <>
            <TextInput mode="outlined" label="Bathrooms (optional)" value={field.value} keyboardType="number-pad" onChangeText={field.onChange} error={Boolean(fieldState.error)} />
            {fieldState.error ? <HelperText type="error">{fieldState.error.message}</HelperText> : null}
          </>
        )}
      />
      <Controller
        control={form.control}
        name="property_condition"
        render={({ field, fieldState }) => (
          <SelectField label="Condition" value={field.value} options={conditionOptions} onChange={field.onChange} error={fieldState.error?.message} />
        )}
      />
      <SectionTitle>Pricing</SectionTitle>
      <Controller
        control={form.control}
        name="asking_price"
        render={({ field, fieldState }) => (
          <>
            <TextInput mode="outlined" label="Asking price" value={field.value} keyboardType="decimal-pad" onChangeText={field.onChange} error={Boolean(fieldState.error)} />
            {fieldState.error ? <HelperText type="error">{fieldState.error.message}</HelperText> : null}
          </>
        )}
      />
      <Controller
        control={form.control}
        name="currency"
        render={({ field, fieldState }) => (
          <SelectField label="Currency" value={field.value} options={currencyOptions} onChange={field.onChange} error={fieldState.error?.message} />
        )}
      />
      <Button mode="contained" style={styles.button} onPress={() => {
        void form.handleSubmit(onSubmit)();
      }}>
        Review details
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: { marginTop: 8, borderRadius: 12, backgroundColor: palette.navy },
});
