'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ onSubmit }: { onSubmit: (values: LoginValues) => Promise<string | null> }) {
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        setFormError(null);
        const message = await onSubmit(values);
        if (message) setFormError(message);
      })}
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
        {form.formState.errors.email ? <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p> : null}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <Input id="password" type="password" autoComplete="current-password" {...form.register('password')} />
        {form.formState.errors.password ? (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.password.message}</p>
        ) : null}
      </div>
      {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
      <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
