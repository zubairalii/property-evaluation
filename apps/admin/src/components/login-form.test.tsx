import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LoginForm } from '@/components/login-form';

describe('admin login', () => {
  it('shows validation messages before calling the server', async () => {
    const onSubmit = vi.fn(async () => null);
    render(<LoginForm onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Enter a valid email')).toBeTruthy();
    expect(screen.getByText('Password must be at least 8 characters')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
