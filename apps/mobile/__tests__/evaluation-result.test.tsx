import { render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { EvaluationResultView } from '../components/EvaluationResultView';
import type { EvaluationView } from '../lib/types';

const baseEvaluation: EvaluationView['evaluation'] = {
  id: '22222222-2222-4222-8222-222222222222',
  user_id: '11111111-1111-4111-8111-111111111111',
  property_title: 'Corner house',
  property_type: 'house',
  country: 'Pakistan',
  city: 'Lahore',
  location: 'DHA Phase 5',
  property_size: 10,
  area_unit: 'marla',
  covered_area: null,
  bedrooms: 4,
  bathrooms: 4,
  property_condition: 'good',
  asking_price: 45000000,
  currency: 'PKR',
  status: 'completed',
  error_message: null,
  created_at: '2026-11-22T00:00:00.000Z',
  updated_at: '2026-11-22T00:00:00.000Z',
};

function view(result: EvaluationView['result'], difference: number | null): EvaluationView {
  return {
    evaluation: baseEvaluation,
    result,
    price_difference: difference,
    disclaimers: {
      valuation: 'AI valuations are estimates and are not certified appraisals.',
      investment: 'This is not guaranteed financial advice.',
    },
  };
}

const priced = view(
  {
    id: '33333333-3333-4333-8333-333333333333',
    evaluation_id: baseEvaluation.id,
    estimated_value: 40000000,
    minimum_value: 38000000,
    maximum_value: 42000000,
    currency: 'PKR',
    price_status: 'overpriced',
    investment_recommendation: 'consider_carefully',
    confidence_level: 'medium',
    valuation_explanation: 'Based on verified records supplied to the model.',
    positive_factors: ['Good condition'],
    risk_factors: ['Asking price is above the estimate'],
    considerations: ['Verify the title'],
    investment_analysis: 'Negotiate before purchase.',
    ai_model: 'gpt-4o-mini',
    market_data_available: true,
    created_at: '2026-11-22T00:00:00.000Z',
  },
  5000000,
);

describe('evaluation result rendering', () => {
  it('shows a priced valuation and the certified-valuation disclaimer', async () => {
    const pricedView = await render(
      <PaperProvider>
        <EvaluationResultView view={priced} section="valuation" />
      </PaperProvider>,
    );
    expect(pricedView.getByText(/PKR 40,000,000/)).toBeTruthy();
    expect(pricedView.getByText(/Overpriced/)).toBeTruthy();
    expect(pricedView.getByText(/not certified appraisals/)).toBeTruthy();
  });

  it('shows a limitation state without a fabricated figure', async () => {
    const limitedView = await render(
      <PaperProvider>
        <EvaluationResultView
          view={view(
            {
              ...priced.result!,
              estimated_value: null,
              minimum_value: null,
              maximum_value: null,
              price_status: 'unknown',
              confidence_level: 'insufficient_data',
              investment_recommendation: 'insufficient_data',
              market_data_available: false,
            },
            null,
          )}
          section="valuation"
        />
      </PaperProvider>,
    );
    expect(limitedView.getByText('Numeric valuation unavailable')).toBeTruthy();
    expect(limitedView.queryByText(/PKR 40,000,000/)).toBeNull();
  });

  it('shows the investment recommendation and advice disclaimer', async () => {
    const investmentView = await render(
      <PaperProvider>
        <EvaluationResultView view={priced} section="investment" />
      </PaperProvider>,
    );
    expect(investmentView.getByText('Consider Carefully')).toBeTruthy();
    expect(investmentView.getByText('Negotiate before purchase.')).toBeTruthy();
    expect(investmentView.getByText(/not guaranteed financial advice/)).toBeTruthy();
  });
});
