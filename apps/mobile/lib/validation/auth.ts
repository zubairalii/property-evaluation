import { z } from 'zod';

const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Include at least one lowercase letter')
  .regex(/[A-Z]/, 'Include at least one uppercase letter')
  .regex(/[0-9]/, 'Include at least one number')
  .regex(/[^A-Za-z0-9]/, 'Include at least one special character');

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z
  .object({
    full_name: z.string().trim().min(2, 'Enter your full name'),
    email: z.string().trim().email('Enter a valid email'),
    password: strongPassword,
    confirm_password: z.string().min(1, 'Confirm your password'),
  })
  .refine((value) => value.password === value.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export const forgotSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
});

export const recoveryCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6,8}$/, 'Enter the 6-digit code from your email'),
});

export const resetSchema = z
  .object({
    password: strongPassword,
    confirm_password: z.string().min(1, 'Confirm your password'),
  })
  .refine((value) => value.password === value.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Enter your current password'),
    password: strongPassword,
    confirm_password: z.string().min(1, 'Confirm your password'),
  })
  .refine((value) => value.password === value.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })
  .refine((value) => value.current_password !== value.password, {
    message: 'New password must be different from your current password',
    path: ['password'],
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
export type RecoveryCodeValues = z.infer<typeof recoveryCodeSchema>;
export type ResetValues = z.infer<typeof resetSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
