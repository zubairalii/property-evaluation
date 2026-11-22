# Database schema

Postgres on Supabase. The migration is `supabase/migrations/20261122000000_init.sql`.

The backend uses the service role and bypasses row-level security. Policies still protect the database if a client uses the anon key directly. Clients are not given policies that can write valuation results, change roles, or read another user's rows.

## profiles

| Column | Notes |
| --- | --- |
| id | UUID primary key, references `auth.users` |
| full_name | text, default empty |
| email | unique text |
| phone | nullable text |
| role | `user` or `admin` |
| status | `active` or `inactive` |
| created_at, updated_at | timestamptz |

`handle_new_user` runs after insert on `auth.users` and copies id, email, and `raw_user_meta_data.full_name`. A second trigger blocks authenticated users from changing `role`, `status`, email, or id.

Authenticated users can select and update their own profile. They cannot insert profiles directly.

## property_evaluations

Stores the submitted property and workflow status: `pending`, `processing`, `completed`, `failed`.

`user_id` references `profiles`. `input_fingerprint` is a SHA-256 of the normalized property inputs. A partial unique index on `(user_id, input_fingerprint)` where status is `pending` or `processing` stops duplicate in-flight requests.

`error_message` is set when analysis fails.

Authenticated users can select, insert, and delete their own rows. There is no update policy, so clients cannot change status or prices. Deletes cascade to results.

Indexes: `(user_id, created_at desc)`, `(status, created_at desc)`, `(city, property_type)`.

## evaluation_results

One row per evaluation (`evaluation_id` is unique). Numeric estimates are nullable. A check constraint requires `minimum_value <= estimated_value <= maximum_value` when an estimate is present.

`positive_factors`, `risk_factors`, `considerations`, and `metadata` are JSONB. `metadata` stores the prompt version, latency, and the ids of comparables actually sent to the model. `market_data_available` records whether that list was empty. `ai_model` stores the configured model name.

Authenticated users can select a result only when they own the parent evaluation. They cannot insert, update, or delete results.

## market_comparables

Optional verified sales for a future or manually loaded dataset.

`verification_status` is `unverified`, `verified`, or `rejected`. The valuation service reads only `verified` rows that match country, city, property type, area unit, and currency.

No policies are granted to `anon` or `authenticated`. The service role is the only client.

## system_settings

`setting_key` is unique. `setting_value` is JSONB. The seed file stores the valuation disclaimer, the investment disclaimer, and prompt version `1`. The API also keeps the same disclaimer text in code so a missing settings row does not change the user-facing warning. No client policies.

## admin_analytics

`admin_analytics(p_days integer)` returns JSON for the admin charts. Execute is revoked from `public`, `anon`, and `authenticated`, and granted to `service_role`.
