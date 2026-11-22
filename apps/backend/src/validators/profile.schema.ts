import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    full_name: z.string().trim().min(2).max(80).optional(),
    phone: z
      .union([
        z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, 'Enter a valid phone number'),
        z.literal('').transform(() => null),
        z.null(),
      ])
      .optional(),
  })
  .refine((value) => value.full_name !== undefined || value.phone !== undefined, {
    message: 'Provide a name or phone number to update',
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
