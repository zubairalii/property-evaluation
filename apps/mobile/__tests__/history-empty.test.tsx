import { render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { HistoryEmpty } from '../components/HistoryEmpty';

describe('evaluation history', () => {
  it('shows an empty state', async () => {
    const view = await render(
      <PaperProvider>
        <HistoryEmpty />
      </PaperProvider>,
    );
    expect(view.getByText('No evaluations yet')).toBeTruthy();
    expect(view.getByText(/Submit a property/)).toBeTruthy();
  });
});
