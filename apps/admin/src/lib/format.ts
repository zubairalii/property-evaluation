export function formatMoney(value: number | string | null | undefined, currency: string): string {
  if (value == null || value === '') return 'Not available';
  const amount = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(amount)) return 'Not available';
  return `${currency} ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount)}`;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function titleCase(value: string): string {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export interface EvaluationFilters {
  page: number;
  limit: number;
  search: string;
  propertyType: string;
  status: string;
}

export function toEvaluationParams(filters: EvaluationFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page,
    limit: filters.limit,
  };
  if (filters.search.trim()) params.search = filters.search.trim();
  if (filters.propertyType) params.property_type = filters.propertyType;
  if (filters.status) params.status = filters.status;
  return params;
}
