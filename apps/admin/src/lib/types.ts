export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  evaluation_count?: number;
}

export interface EvaluationSummary {
  id: string;
  property_title: string | null;
  property_type: string;
  country: string;
  city: string;
  location: string;
  asking_price: number | string;
  currency: string;
  status: string;
  created_at: string;
  estimated_value: number | null;
  price_status: string | null;
  investment_recommendation: string | null;
  confidence_level: string | null;
  error_message?: string | null;
  user?: { full_name: string; email: string } | null;
}

export interface DashboardData {
  total_users: number;
  total_evaluations: number;
  evaluations_completed: number;
  evaluations_failed: number;
  recent_users: Array<Pick<Profile, 'id' | 'full_name' | 'email' | 'role' | 'status' | 'created_at'>>;
  recent_evaluations: Array<{
    id: string;
    property_title: string | null;
    property_type: string;
    city: string;
    country: string;
    status: string;
    asking_price: number | string;
    currency: string;
    created_at: string;
    user: { full_name: string; email: string } | null;
  }>;
}

export interface AnalyticsData {
  evaluations_over_time: Array<{ date: string; count: number }>;
  registrations_over_time: Array<{ date: string; count: number }>;
  by_property_type: Array<{ property_type: string; count: number }>;
  by_city: Array<{ city: string; count: number }>;
}

export interface EvaluationView {
  evaluation: {
    id: string;
    property_title: string | null;
    property_type: string;
    country: string;
    city: string;
    location: string;
    property_size: number | string;
    area_unit: string;
    covered_area: number | string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    property_condition: string;
    asking_price: number | string;
    currency: string;
    status: string;
    error_message: string | null;
    created_at: string;
  };
  result: {
    estimated_value: number | null;
    minimum_value: number | null;
    maximum_value: number | null;
    currency: string;
    price_status: string;
    investment_recommendation: string;
    confidence_level: string;
    valuation_explanation: string;
    positive_factors: string[];
    risk_factors: string[];
    considerations: string[];
    investment_analysis: string;
    ai_model: string;
    market_data_available: boolean;
  } | null;
  price_difference: number | null;
  disclaimers: { valuation: string; investment: string };
  user: { full_name: string; email: string } | null;
}

export interface AdminUser extends Profile {
  evaluation_count: number;
  recent_evaluations: EvaluationSummary[];
}

export interface MarketComparable {
  id: string;
  property_type: string;
  country: string;
  city: string;
  location: string;
  property_size: number | string;
  area_unit: string;
  covered_area: number | string | null;
  sale_price: number | string;
  currency: string;
  transaction_date: string;
  source: string;
  verification_status: 'unverified' | 'verified' | 'rejected';
  created_at: string;
}
