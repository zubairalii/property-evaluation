import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DashboardOverview } from '@/components/dashboard-overview';
import type { DashboardData } from '@/lib/types';

const empty: DashboardData = {
  total_users: 0,
  total_evaluations: 0,
  evaluations_completed: 0,
  evaluations_failed: 0,
  recent_users: [],
  recent_evaluations: [],
};

describe('dashboard loading', () => {
  it('shows an error state', () => {
    render(<DashboardOverview loading={false} error="Network down" data={null} />);
    expect(screen.getByText(/Unable to load the dashboard/)).toBeTruthy();
  });

  it('shows an empty state when no evaluations exist', () => {
    render(<DashboardOverview loading={false} error={null} data={empty} />);
    expect(screen.getByText(/No evaluations yet/)).toBeTruthy();
  });
});
