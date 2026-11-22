export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export type PropertyType = 'house' | 'apartment' | 'residential_plot' | 'commercial_property';
export type AreaUnit = 'marla' | 'kanal' | 'square_feet' | 'square_yards';
export type PropertyCondition = 'new' | 'excellent' | 'good' | 'average' | 'needs_renovation';
export type EvaluationStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PriceStatus = 'underpriced' | 'fairly_priced' | 'overpriced' | 'unknown';
export type InvestmentRecommendation =
  | 'good_investment'
  | 'consider_carefully'
  | 'not_recommended'
  | 'insufficient_data';
export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'insufficient_data';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'inactive';
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
