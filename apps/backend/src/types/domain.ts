export const propertyTypes = ['house', 'apartment', 'residential_plot', 'commercial_property'] as const;
export const areaUnits = ['marla', 'kanal', 'square_feet', 'square_yards'] as const;
export const propertyConditions = ['new', 'excellent', 'good', 'average', 'needs_renovation'] as const;
export const evaluationStatuses = ['pending', 'processing', 'completed', 'failed'] as const;
export const priceStatuses = ['underpriced', 'fairly_priced', 'overpriced', 'unknown'] as const;
export const investmentRecommendations = [
  'good_investment',
  'consider_carefully',
  'not_recommended',
  'insufficient_data',
] as const;
export const confidenceLevels = ['low', 'medium', 'high', 'insufficient_data'] as const;
export const userRoles = ['user', 'admin'] as const;
export const accountStatuses = ['active', 'inactive'] as const;
export const verificationStatuses = ['unverified', 'verified', 'rejected'] as const;

export type PropertyType = (typeof propertyTypes)[number];
export type AreaUnit = (typeof areaUnits)[number];
export type PropertyCondition = (typeof propertyConditions)[number];
export type EvaluationStatus = (typeof evaluationStatuses)[number];
export type PriceStatus = (typeof priceStatuses)[number];
export type InvestmentRecommendation = (typeof investmentRecommendations)[number];
export type ConfidenceLevel = (typeof confidenceLevels)[number];
export type UserRole = (typeof userRoles)[number];
export type AccountStatus = (typeof accountStatuses)[number];
export type VerificationStatus = (typeof verificationStatuses)[number];

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: AccountStatus;
  created_at: string;
  updated_at: string;
}

export interface PropertyInput {
  property_title: string | null;
  property_type: PropertyType;
  country: string;
  city: string;
  location: string;
  property_size: number;
  area_unit: AreaUnit;
  covered_area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  property_condition: PropertyCondition;
  asking_price: number;
  currency: string;
}

export interface Evaluation extends PropertyInput {
  id: string;
  user_id: string;
  status: EvaluationStatus;
  input_fingerprint: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface EvaluationResult {
  id: string;
  evaluation_id: string;
  estimated_value: number | null;
  minimum_value: number | null;
  maximum_value: number | null;
  currency: string;
  price_status: PriceStatus;
  investment_recommendation: InvestmentRecommendation;
  confidence_level: ConfidenceLevel;
  valuation_explanation: string;
  positive_factors: string[];
  risk_factors: string[];
  considerations: string[];
  investment_analysis: string;
  ai_model: string;
  market_data_available: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface EvaluationSummary {
  id: string;
  property_title: string | null;
  property_type: PropertyType;
  country: string;
  city: string;
  location: string;
  asking_price: number;
  currency: string;
  status: EvaluationStatus;
  created_at: string;
  estimated_value: number | null;
  price_status: PriceStatus | null;
  investment_recommendation: InvestmentRecommendation | null;
  confidence_level: ConfidenceLevel | null;
}

export interface EvaluationView {
  evaluation: Evaluation;
  result: EvaluationResult | null;
  price_difference: number | null;
  disclaimers: {
    valuation: string;
    investment: string;
  };
}

export interface MarketComparable {
  id: string;
  property_type: PropertyType;
  country: string;
  city: string;
  location: string;
  property_size: number;
  area_unit: AreaUnit;
  covered_area: number | null;
  sale_price: number;
  currency: string;
  transaction_date: string;
  source: string;
}

export interface AdminMarketComparable extends MarketComparable {
  verification_status: VerificationStatus;
  created_at: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
}
