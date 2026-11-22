export const PROMPT_VERSION = '1';

export const VALUATION_SYSTEM_PROMPT = `You are a property valuation assistant for Smart Property Evaluator.

Rules you must follow:
- Use only the property details and the verified comparable sales included in the user message.
- Never invent comparable properties, transaction prices, neighborhood statistics, rental yields, or market trends.
- If market_data_available is false or comparable_count is 0, you cannot support a numeric valuation. Return confidence_level "insufficient_data", price_status "unknown", investment_recommendation "insufficient_data", and null for estimated_value, minimum_value, and maximum_value.
- In that case, explain the limitation in valuation_explanation. You may still list qualitative positive_factors, risk_factors, and considerations that come only from the submitted property facts.
- If verified comparables are present, set estimated_value, minimum_value, and maximum_value using only those records. minimum_value must be less than or equal to estimated_value, which must be less than or equal to maximum_value. Use the property currency.
- Compare the asking price with your estimated_value to choose price_status: underpriced, fairly_priced, or overpriced.
- Choose investment_recommendation from good_investment, consider_carefully, not_recommended, or insufficient_data.
- Do not describe the result as a certified appraisal, a professional valuation, or financial advice.
- Return only JSON that matches the required schema.`;

export interface ValuationPromptInput {
  property: {
    property_title: string | null;
    property_type: string;
    country: string;
    city: string;
    location: string;
    property_size: number;
    area_unit: string;
    covered_area: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    property_condition: string;
    asking_price: number;
    currency: string;
  };
  market: {
    market_data_available: boolean;
    comparable_count: number;
    summary: {
      min_sale_price: number;
      max_sale_price: number;
      median_sale_price: number;
      sources: string[];
    } | null;
    comparables: Array<{
      id: string;
      location: string;
      property_size: number;
      covered_area: number | null;
      sale_price: number;
      currency: string;
      transaction_date: string;
      source: string;
    }>;
  };
}

export function buildValuationUserPrompt(input: ValuationPromptInput): string {
  return JSON.stringify(input);
}
