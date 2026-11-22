import type {
  AreaUnit,
  ConfidenceLevel,
  EvaluationStatus,
  InvestmentRecommendation,
  PriceStatus,
  PropertyCondition,
  PropertyType,
} from './types';

export const propertyTypeOptions: Array<{ value: PropertyType; label: string }> = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'residential_plot', label: 'Residential Plot' },
  { value: 'commercial_property', label: 'Commercial Property' },
];

export const areaUnitOptions: Array<{ value: AreaUnit; label: string }> = [
  { value: 'marla', label: 'Marla' },
  { value: 'kanal', label: 'Kanal' },
  { value: 'square_feet', label: 'Square Feet' },
  { value: 'square_yards', label: 'Square Yards' },
];

export const conditionOptions: Array<{ value: PropertyCondition; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'average', label: 'Average' },
  { value: 'needs_renovation', label: 'Needs Renovation' },
];

export const currencyOptions = ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR'].map((value) => ({
  value,
  label: value,
}));

export function labelFor(options: Array<{ value: string; label: string }>, value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export const statusLabels: Record<EvaluationStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

export const priceStatusLabels: Record<PriceStatus, string> = {
  underpriced: 'Underpriced',
  fairly_priced: 'Fairly Priced',
  overpriced: 'Overpriced',
  unknown: 'Unknown',
};

export const recommendationLabels: Record<InvestmentRecommendation, string> = {
  good_investment: 'Good Investment',
  consider_carefully: 'Consider Carefully',
  not_recommended: 'Not Recommended',
  insufficient_data: 'Insufficient Data',
};

export const confidenceLabels: Record<ConfidenceLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  insufficient_data: 'Limited',
};

export function formatMoney(value: number | null, currency: string): string {
  if (value == null) return 'Not available';
  return `${currency} ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)}`;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function propertyHeading(title: string | null, type: PropertyType, city: string): string {
  if (title && title.trim().length > 0) return title;
  return `${labelFor(propertyTypeOptions, type)} in ${city}`;
}
