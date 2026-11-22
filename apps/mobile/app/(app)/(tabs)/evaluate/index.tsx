import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { HelperText, Text, TextInput } from 'react-native-paper';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen, ScreenHeader, SectionTitle } from '@/components/Screen';
import { SelectField } from '@/components/SelectField';
import { SuggestionField } from '@/components/SuggestionField';
import { useDraft } from '@/context/draft';
import { api } from '@/lib/api';
import {
  areaUnitOptions,
  conditionOptions,
  currencyOptions,
  labelFor,
  propertyTypeOptions,
} from '@/lib/labels';
import { fonts, palette } from '@/lib/theme';
import type { ApiEnvelope, AreaUnit, PropertyType } from '@/lib/types';
import { propertyFormSchema, type PropertyFormValues } from '@/lib/validation/property';

interface MarketMeta {
  cities: Array<{ city: string; count: number }>;
  property_types: Array<{ property_type: PropertyType; count: number }>;
  area_units: Array<{ area_unit: AreaUnit; count: number }>;
}

export default function PropertyFormScreen() {
  const router = useRouter();
  const { draft, setDraft } = useDraft();
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      ...draft,
      country: draft.country || 'Pakistan',
    },
  });

  const city = useWatch({ control: form.control, name: 'city' });
  const propertyType = useWatch({ control: form.control, name: 'property_type' });
  const location = useWatch({ control: form.control, name: 'location' });

  const metaQuery = useQuery({
    queryKey: ['market-meta', city || null, propertyType || null],
    queryFn: async () => {
      const response = await api.get<ApiEnvelope<MarketMeta>>('/market/meta', {
        params: {
          city: city || undefined,
          property_type: city ? propertyType : undefined,
        },
      });
      return response.data.data;
    },
  });

  const locationsQuery = useQuery({
    queryKey: ['market-locations', city || null, location?.trim() || ''],
    enabled: Boolean(city),
    queryFn: async () => {
      const response = await api.get<ApiEnvelope<string[]>>('/market/locations', {
        params: {
          city,
          q: location?.trim() || undefined,
          limit: 25,
        },
      });
      return response.data.data;
    },
  });

  const cityOptions = useMemo(
    () => (metaQuery.data?.cities ?? []).map((item) => ({ value: item.city, label: item.city })),
    [metaQuery.data?.cities],
  );

  const typeOptions = useMemo(() => {
    const available = metaQuery.data?.property_types ?? [];
    if (available.length === 0) return propertyTypeOptions;
    return available.map((item) => ({
      value: item.property_type,
      label: `${labelFor(propertyTypeOptions, item.property_type)} (${item.count.toLocaleString()})`,
    }));
  }, [metaQuery.data?.property_types]);

  const unitOptions = useMemo(() => {
    const available = metaQuery.data?.area_units ?? [];
    if (available.length === 0) return areaUnitOptions;
    return available.map((item) => ({
      value: item.area_unit,
      label: `${labelFor(areaUnitOptions, item.area_unit)} (${item.count.toLocaleString()})`,
    }));
  }, [metaQuery.data?.area_units]);

  useEffect(() => {
    if (!typeOptions.some((option) => option.value === propertyType) && typeOptions[0]) {
      form.setValue('property_type', typeOptions[0].value as PropertyType);
    }
  }, [form, propertyType, typeOptions]);

  useEffect(() => {
    const currentUnit = form.getValues('area_unit');
    if (!unitOptions.some((option) => option.value === currentUnit) && unitOptions[0]) {
      form.setValue('area_unit', unitOptions[0].value as AreaUnit);
    }
  }, [form, unitOptions]);

  function onSubmit(values: PropertyFormValues) {
    setDraft({ ...values, country: 'Pakistan' });
    router.push('/(app)/(tabs)/evaluate/review');
  }

  return (
    <Screen>
      <ScreenHeader
        eyebrow="New evaluation"
        title="Property details"
        subtitle="Choose a city and area from market records to get a sharper valuation."
      />
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
        name="city"
        render={({ field, fieldState }) => (
          <SelectField
            label="City"
            value={field.value}
            options={cityOptions}
            onChange={(next) => {
              field.onChange(next);
              form.setValue('location', '');
            }}
            error={fieldState.error?.message ?? (metaQuery.isError ? 'Could not load cities' : undefined)}
          />
        )}
      />
      <Controller
        control={form.control}
        name="property_type"
        render={({ field, fieldState }) => (
          <SelectField
            label="Property type"
            value={field.value}
            options={typeOptions}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={form.control}
        name="location"
        render={({ field, fieldState }) => (
          <SuggestionField
            label="Area / neighborhood"
            value={field.value}
            onChangeText={field.onChange}
            suggestions={locationsQuery.data ?? []}
            disabled={!city}
            placeholder={city ? 'Start typing an area' : 'Choose a city first'}
            error={fieldState.error?.message}
          />
        )}
      />
      {!city ? <Text style={styles.hint}>Choose a city to load matching areas and property types.</Text> : null}
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
          <SelectField label="Area unit" value={field.value} options={unitOptions} onChange={field.onChange} error={fieldState.error?.message} />
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
      <PrimaryButton
        label="Review details"
        onPress={() => {
          void form.handleSubmit(onSubmit)();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { color: palette.muted, fontFamily: fonts.body, marginBottom: 4, lineHeight: 20 },
});
