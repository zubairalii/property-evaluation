import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UserStatusButton } from '@/components/user-status-button';
import { toEvaluationParams } from '@/lib/format';

describe('user management', () => {
  it('asks to deactivate an active account', () => {
    const onChange = vi.fn();
    render(<UserStatusButton status="active" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Deactivate' }));
    expect(onChange).toHaveBeenCalledWith('inactive');
  });

  it('asks to activate an inactive account', () => {
    const onChange = vi.fn();
    render(<UserStatusButton status="inactive" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Activate' }));
    expect(onChange).toHaveBeenCalledWith('active');
  });
});

describe('evaluation management filters', () => {
  it('builds query params from the selected filters', () => {
    expect(
      toEvaluationParams({
        page: 2,
        limit: 20,
        search: ' Lahore ',
        propertyType: 'house',
        status: 'failed',
      }),
    ).toEqual({
      page: 2,
      limit: 20,
      search: 'Lahore',
      property_type: 'house',
      status: 'failed',
    });
  });

  it('omits empty filters', () => {
    expect(toEvaluationParams({ page: 1, limit: 20, search: ' ', propertyType: '', status: '' })).toEqual({
      page: 1,
      limit: 20,
    });
  });
});
