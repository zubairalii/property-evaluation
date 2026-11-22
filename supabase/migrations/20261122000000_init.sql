-- Smart Property Evaluator initial schema.
-- Business writes go through the backend service role. RLS is defense in depth.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null,
  phone text,
  role text not null default 'user' check (role in ('user', 'admin')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_email_key on public.profiles (email);
create index profiles_role_status_idx on public.profiles (role, status);

create table public.property_evaluations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  property_title text,
  property_type text not null check (property_type in ('house', 'apartment', 'residential_plot', 'commercial_property')),
  country text not null,
  city text not null,
  location text not null,
  property_size numeric(14, 2) not null check (property_size > 0),
  area_unit text not null check (area_unit in ('marla', 'kanal', 'square_feet', 'square_yards')),
  covered_area numeric(14, 2) check (covered_area is null or covered_area > 0),
  bedrooms integer check (bedrooms is null or bedrooms >= 0),
  bathrooms integer check (bathrooms is null or bathrooms >= 0),
  property_condition text not null check (property_condition in ('new', 'excellent', 'good', 'average', 'needs_renovation')),
  asking_price numeric(16, 2) not null check (asking_price > 0),
  currency char(3) not null check (char_length(currency) = 3),
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  input_fingerprint text not null,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index property_evaluations_user_created_idx
  on public.property_evaluations (user_id, created_at desc);
create index property_evaluations_status_created_idx
  on public.property_evaluations (status, created_at desc);
create index property_evaluations_city_type_idx
  on public.property_evaluations (city, property_type);
create unique index property_evaluations_inflight_fingerprint_idx
  on public.property_evaluations (user_id, input_fingerprint)
  where status in ('pending', 'processing');

create table public.evaluation_results (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null unique references public.property_evaluations (id) on delete cascade,
  estimated_value numeric(16, 2) check (estimated_value is null or estimated_value >= 0),
  minimum_value numeric(16, 2) check (minimum_value is null or minimum_value >= 0),
  maximum_value numeric(16, 2) check (maximum_value is null or maximum_value >= 0),
  currency char(3) not null,
  price_status text not null check (price_status in ('underpriced', 'fairly_priced', 'overpriced', 'unknown')),
  investment_recommendation text not null check (
    investment_recommendation in ('good_investment', 'consider_carefully', 'not_recommended', 'insufficient_data')
  ),
  confidence_level text not null check (confidence_level in ('low', 'medium', 'high', 'insufficient_data')),
  valuation_explanation text not null,
  positive_factors jsonb not null default '[]'::jsonb,
  risk_factors jsonb not null default '[]'::jsonb,
  considerations jsonb not null default '[]'::jsonb,
  investment_analysis text not null,
  ai_model text not null,
  market_data_available boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint evaluation_results_range_check check (
    estimated_value is null
    or (
      minimum_value is not null
      and maximum_value is not null
      and minimum_value <= estimated_value
      and estimated_value <= maximum_value
    )
  )
);

create index evaluation_results_evaluation_idx on public.evaluation_results (evaluation_id);

create table public.market_comparables (
  id uuid primary key default gen_random_uuid(),
  property_type text not null check (property_type in ('house', 'apartment', 'residential_plot', 'commercial_property')),
  country text not null,
  city text not null,
  location text not null,
  property_size numeric(14, 2) not null check (property_size > 0),
  area_unit text not null check (area_unit in ('marla', 'kanal', 'square_feet', 'square_yards')),
  covered_area numeric(14, 2) check (covered_area is null or covered_area > 0),
  sale_price numeric(16, 2) not null check (sale_price > 0),
  currency char(3) not null check (char_length(currency) = 3),
  transaction_date date not null,
  source text not null,
  verification_status text not null default 'unverified' check (verification_status in ('unverified', 'verified', 'rejected')),
  created_at timestamptz not null default now()
);

create index market_comparables_lookup_idx
  on public.market_comparables (country, city, property_type, area_unit, verification_status);

create table public.system_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger property_evaluations_set_updated_at
  before update on public.property_evaluations
  for each row execute function public.set_updated_at();

create trigger system_settings_set_updated_at
  before update on public.system_settings
  for each row execute function public.set_updated_at();

create or replace function public.prevent_profile_privilege_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'authenticated' then
    if new.role is distinct from old.role
      or new.status is distinct from old.status
      or new.email is distinct from old.email
      or new.id is distinct from old.id then
      raise exception 'protected profile fields cannot be changed';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_privileged_columns
  before update on public.profiles
  for each row execute function public.prevent_profile_privilege_change();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.admin_analytics(p_days integer default 30)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with bounds as (
    select greatest(coalesce(p_days, 30), 1) as days
  ),
  eval_series as (
    select to_char(date_trunc('day', property_evaluations.created_at), 'YYYY-MM-DD') as day,
           count(*)::int as total
    from public.property_evaluations
    cross join bounds
    where property_evaluations.created_at >= now() - make_interval(days => bounds.days)
    group by 1
  ),
  user_series as (
    select to_char(date_trunc('day', profiles.created_at), 'YYYY-MM-DD') as day,
           count(*)::int as total
    from public.profiles
    cross join bounds
    where profiles.created_at >= now() - make_interval(days => bounds.days)
    group by 1
  ),
  by_type as (
    select property_type, count(*)::int as total
    from public.property_evaluations
    group by property_type
  ),
  by_city as (
    select city, count(*)::int as total
    from public.property_evaluations
    group by city
    order by count(*) desc
    limit 12
  )
  select jsonb_build_object(
    'evaluations_over_time',
    coalesce((select jsonb_agg(jsonb_build_object('date', day, 'count', total) order by day) from eval_series), '[]'::jsonb),
    'registrations_over_time',
    coalesce((select jsonb_agg(jsonb_build_object('date', day, 'count', total) order by day) from user_series), '[]'::jsonb),
    'by_property_type',
    coalesce((select jsonb_agg(jsonb_build_object('property_type', property_type, 'count', total) order by total desc) from by_type), '[]'::jsonb),
    'by_city',
    coalesce((select jsonb_agg(jsonb_build_object('city', city, 'count', total) order by total desc) from by_city), '[]'::jsonb)
  );
$$;

revoke all on function public.admin_analytics(integer) from public, anon, authenticated;
grant execute on function public.admin_analytics(integer) to service_role;

alter table public.profiles enable row level security;
alter table public.property_evaluations enable row level security;
alter table public.evaluation_results enable row level security;
alter table public.market_comparables enable row level security;
alter table public.system_settings enable row level security;

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy evaluations_select_own
  on public.property_evaluations
  for select
  to authenticated
  using (user_id = auth.uid());

create policy evaluations_insert_own
  on public.property_evaluations
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy evaluations_delete_own
  on public.property_evaluations
  for delete
  to authenticated
  using (user_id = auth.uid());

create policy results_select_own
  on public.evaluation_results
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.property_evaluations as evaluation
      where evaluation.id = evaluation_results.evaluation_id
        and evaluation.user_id = auth.uid()
    )
  );

grant select, update on public.profiles to authenticated;
grant select, insert, delete on public.property_evaluations to authenticated;
grant select on public.evaluation_results to authenticated;

revoke all on public.market_comparables from anon, authenticated;
revoke all on public.system_settings from anon, authenticated;

grant all privileges on public.profiles to service_role;
grant all privileges on public.property_evaluations to service_role;
grant all privileges on public.evaluation_results to service_role;
grant all privileges on public.market_comparables to service_role;
grant all privileges on public.system_settings to service_role;
