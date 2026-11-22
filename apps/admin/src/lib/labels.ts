export const propertyTypeOptions = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'residential_plot', label: 'Residential Plot' },
  { value: 'commercial_property', label: 'Commercial Property' },
] as const;

export function labelFor(options: Array<{ value: string; label: string }>, value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}
