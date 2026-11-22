import { z } from 'zod';
import type { PropertyInput } from '../types';

const DEFAULT_COUNTRY = 'Pakistan';

const requiredNumber = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter the ${label}`)
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, `Enter a valid ${label}`);

const optionalNumber = (label: string) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || (Number.isFinite(Number(value)) && Number(value) > 0), `Enter a valid ${label}`);

const optionalCount = (label: string) =>
  z.string().trim().refine((value) => {
    if (value === '') return true;
    return /^\d+$/.test(value) && Number(value) <= 50;
  }, `Enter a valid ${label}`);

export const propertyFormSchema = z.object({
  property_title: z.string().trim().max(120, 'Title must be 120 characters or fewer'),
  property_type: z.enum(['house', 'apartment', 'residential_plot', 'commercial_property']),
  country: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2, 'Choose a city').max(80),
  location: z.string().trim().min(2, 'Enter or choose an area').max(120),
  property_size: requiredNumber('property size'),
  area_unit: z.enum(['marla', 'kanal', 'square_feet', 'square_yards']),
  covered_area: optionalNumber('covered area'),
  bedrooms: optionalCount('bedroom count'),
  bathrooms: optionalCount('bathroom count'),
  property_condition: z.enum(['new', 'excellent', 'good', 'average', 'needs_renovation']),
  asking_price: requiredNumber('asking price'),
  currency: z.string().trim().regex(/^[A-Za-z]{3}$/, 'Choose a currency'),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export const emptyPropertyForm: PropertyFormValues = {
  property_title: '',
  property_type: 'house',
  country: DEFAULT_COUNTRY,
  city: '',
  location: '',
  property_size: '',
  area_unit: 'marla',
  covered_area: '',
  bedrooms: '',
  bathrooms: '',
  property_condition: 'good',
  asking_price: '',
  currency: 'PKR',
};

export function toPropertyPayload(values: PropertyFormValues): PropertyInput {
  return {
    property_title: values.property_title.trim() ? values.property_title.trim() : null,
    property_type: values.property_type,
    country: values.country.trim() || DEFAULT_COUNTRY,
    city: values.city.trim(),
    location: values.location.trim(),
    property_size: Number(values.property_size),
    area_unit: values.area_unit,
    covered_area: values.covered_area.trim() ? Number(values.covered_area) : null,
    bedrooms: values.bedrooms.trim() ? Number(values.bedrooms) : null,
    bathrooms: values.bathrooms.trim() ? Number(values.bathrooms) : null,
    property_condition: values.property_condition,
    asking_price: Number(values.asking_price),
    currency: values.currency.toUpperCase(),
  };
}
