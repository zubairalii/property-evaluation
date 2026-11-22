import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().default(''),
  OPENAI_BASE_URL: z.string().url().default('https://openrouter.ai/api/v1'),
  OPENAI_MODEL: z.string().min(1).default('google/gemini-2.5-flash'),
  OPENROUTER_APP_URL: z.string().url().default('http://localhost:5000'),
  OPENROUTER_APP_NAME: z.string().min(1).default('Smart Property Evaluator'),
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  JWT_AUDIENCE: z.string().min(1).default('authenticated'),
});

export const env = envSchema.parse(process.env);

export const corsOrigins = env.CORS_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);
