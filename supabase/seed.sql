-- Reference data only. Do not insert fabricated comparable sales.
-- Verified market rows belong in market_comparables with verification_status = 'verified'
-- and a real source. Unverified rows are ignored by the valuation service.

insert into public.system_settings (setting_key, setting_value)
values
  (
    'valuation_disclaimer',
    '{"text":"AI valuations are estimates based on the details you submit and any verified market records on file. They are not certified professional property valuations."}'::jsonb
  ),
  (
    'investment_disclaimer',
    '{"text":"Investment recommendations are informational only and are not guaranteed financial, legal, or real estate advice."}'::jsonb
  ),
  (
    'prompt_version',
    '{"version":"1"}'::jsonb
  )
on conflict (setting_key) do nothing;

-- Create the first administrator after that person has registered:
-- update public.profiles set role = 'admin' where email = 'you@example.com';
