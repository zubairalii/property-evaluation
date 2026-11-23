import { describe, expect, it } from 'vitest';
import { envSchema } from './env';

const required = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_ANON_KEY: 'anon',
  SUPABASE_SERVICE_ROLE_KEY: 'service',
};

describe('envSchema OPENROUTER_APP_URL', () => {
  it('uses the default when the variable is missing or blank', () => {
    expect(envSchema.parse(required).OPENROUTER_APP_URL).toBe('http://localhost:5000');
    expect(envSchema.parse({ ...required, OPENROUTER_APP_URL: '' }).OPENROUTER_APP_URL).toBe(
      'http://localhost:5000',
    );
    expect(envSchema.parse({ ...required, OPENROUTER_APP_URL: '   ' }).OPENROUTER_APP_URL).toBe(
      'http://localhost:5000',
    );
  });

  it('accepts an absolute URL and a host without a scheme', () => {
    expect(
      envSchema.parse({ ...required, OPENROUTER_APP_URL: 'https://app.example.com' })
        .OPENROUTER_APP_URL,
    ).toBe('https://app.example.com');
    expect(
      envSchema.parse({ ...required, OPENROUTER_APP_URL: '168.231.74.154:3036' }).OPENROUTER_APP_URL,
    ).toBe('http://168.231.74.154:3036');
  });

  it('rejects a value that is not a URL', () => {
    const result = envSchema.safeParse({ ...required, OPENROUTER_APP_URL: 'not a url' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['OPENROUTER_APP_URL']);
    }
  });
});
