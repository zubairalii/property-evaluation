import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = loginSchema
  .extend({
    full_name: z.string().trim().min(2, 'Enter your full name'),
    confirm_password: z.string().min(8, 'Confirm your password'),
  })
  .refine((value) => value.password === value.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export const forgotSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
});

export const resetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().min(8, 'Confirm your password'),
  })
  .refine((value) => value.password === value.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'Enter your full name'),
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || /^\+?[0-9 ()-]{7,20}$/.test(value), 'Enter a valid phone number'),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotValues = z.infer<typeof forgotSchema>;
export type ResetValues = z.infer<typeof resetSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
