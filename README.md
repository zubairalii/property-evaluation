# Smart Property Evaluator

AI-assisted property evaluation platform with three applications:

- `apps/mobile` — Expo React Native app for property owners and buyers
- `apps/admin` — Next.js dashboard for administrators
- `apps/backend` — Express API that owns business logic, OpenAI calls, and database access

Supabase provides Postgres, authentication, and row-level security. The mobile and admin apps use Supabase only to sign in and store the session. Evaluations, profiles, and admin data go through the API.

## Prerequisites

- Node.js 20 or newer
- npm
- A Supabase project
- An OpenRouter API key for live valuations (Gemini or another OpenRouter model)

## Setup

1. Create a Supabase project and run the SQL in `supabase/migrations`, then `supabase/seed.sql`. See [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md).
2. Copy each `.env.example` to `.env` (admin also accepts `.env.local`) and fill in the values. Never commit those files.
3. Install and start each app from its own directory. They are not an npm workspace.

```bash
cd apps/backend && npm install && npm run dev
cd apps/admin && npm install && npm run dev
cd apps/mobile && npm install && npx expo start
```

- API: http://localhost:5000
- Admin: http://localhost:3000
- Mobile: Expo dev server (Android, iOS, or web)

From the repository root, after each app has its dependencies installed:

```bash
npm run dev:backend
npm run dev:admin
npm run dev:mobile
npm run typecheck
npm test
npm run lint
```

## First administrator

Register a user in the mobile app or the Supabase dashboard, then in the SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Sign in to the admin app with that account. The API rejects every admin route unless the verified profile role is `admin` and the account is active.

## Valuations

The valuation service only uses rows in `market_comparables` with `verification_status = 'verified'`. If none match the property's country, city, type, area unit, and currency, the API stores `insufficient_data` and does not invent a price or comparable sale. A numeric estimate is produced only when verified records exist and the model response passes schema checks.

AI calls go through OpenRouter from the backend. Set `OPENAI_API_KEY` to your OpenRouter key and leave `OPENAI_BASE_URL=https://openrouter.ai/api/v1`. The default model is `google/gemini-2.5-flash`.

## Documentation

- [Setup guide](docs/SETUP_GUIDE.md)
- [API reference](docs/API_DOCUMENTATION.md)
- [Database schema](docs/DATABASE_SCHEMA.md)
