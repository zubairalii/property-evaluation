import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Zod `.default()` runs only when the value is `undefined`.
 * A `.env` line like `OPENROUTER_APP_URL=` is `""`, which skips the default and fails `.url()`.
 */
function blankToUndefined(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

/** OpenRouter's HTTP-Referer. A host without a scheme is treated as http. */
function normalizeAppUrl(value: unknown): unknown {
  const trimmed = blankToUndefined(value);
  if (typeof trimmed !== 'string') return trimmed;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return `http://${trimmed}`;
}

const optionalUrl = (fallback: string) =>
  z.preprocess(blankToUndefined, z.string().url().default(fallback));

const optionalText = (fallback: string) =>
  z.preprocess(blankToUndefined, z.string().min(1).default(fallback));

export const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  OPENAI_API_KEY: z.preprocess(blankToUndefined, z.string().default('')),
  OPENAI_BASE_URL: optionalUrl('https://openrouter.ai/api/v1'),
  OPENAI_MODEL: optionalText('google/gemini-2.5-flash'),
  OPENROUTER_APP_URL: z.preprocess(
    normalizeAppUrl,
    z
      .string()
      .url('OPENROUTER_APP_URL must be an absolute URL such as https://example.com')
      .default('http://localhost:5000'),
  ),
  OPENROUTER_APP_NAME: optionalText('Smart Property Evaluator'),
  PORT: z.preprocess(blankToUndefined, z.coerce.number().int().positive().default(5000)),
  NODE_ENV: z.preprocess(
    blankToUndefined,
    z.enum(['development', 'test', 'production']).default('development'),
  ),
  CORS_ORIGIN: z.preprocess(blankToUndefined, z.string().default('http://localhost:3000')),
  JWT_AUDIENCE: optionalText('authenticated'),
});

export const env = envSchema.parse(process.env);

export const corsOrigins = env.CORS_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);
