# Setup guide

## 1. Supabase

Create a project at https://supabase.com.

In the SQL editor, run these files in order:

1. `supabase/migrations/20261122000000_init.sql`
2. `supabase/seed.sql`

Or, with the Supabase CLI installed and the project linked:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

`seed.sql` inserts disclaimer settings only. It does not insert property sales. Add real comparable sales yourself, and set `verification_status` to `verified` only when the source is one you trust. Unverified and rejected rows are ignored.

For local development, email confirmations are disabled in `supabase/config.toml`. Hosted projects can keep confirmations on. The mobile app tells the user to confirm their email when Supabase does not return a session after sign-up.

### Auth redirect URLs

In Authentication → URL configuration, allow:

- Site URL: `http://localhost:3000` for the admin app
- Redirect URL: `smartpropertyevaluator://reset-password`

The mobile forgot-password screen uses `Linking.createURL('/reset-password')`, which resolves to that scheme in a dev build. Expo Go may use an `exp://` URL; add the URL printed by Expo if the reset link should open Expo Go.

### Keys

From Project Settings → API, copy:

- Project URL
- `anon` public key, used by the mobile app, admin app, and backend token check
- `service_role` key, used only by `apps/backend`

Do not put the service role key in `EXPO_PUBLIC_*` or `NEXT_PUBLIC_*` variables.

## 2. Backend

```bash
cd apps/backend
copy .env.example .env
npm install
npm run dev
```

On macOS or Linux, use `cp` instead of `copy`.

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openrouter-key
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=google/gemini-2.5-flash
OPENROUTER_APP_URL=http://localhost:5000
OPENROUTER_APP_NAME=Smart Property Evaluator
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
JWT_AUDIENCE=authenticated
```

Put your **OpenRouter** API key in `OPENAI_API_KEY`. The backend uses the OpenAI-compatible SDK against OpenRouter (`OPENAI_BASE_URL`). The default model is Gemini via OpenRouter (`google/gemini-2.5-flash`). Other OpenRouter model ids work if they support structured JSON schema output.

Set `OPENROUTER_APP_URL` and `OPENROUTER_APP_NAME` per environment so OpenRouter attribution matches local, staging, or production.

If `OPENAI_API_KEY` is empty, other API routes still run and `POST /api/v1/evaluations/:id/analyze` returns 503.

Check the process with http://localhost:5000/api/v1/health.

## 3. Admin dashboard

```bash
cd apps/admin
copy .env.example .env.local
npm install
npm run dev
```

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Open http://localhost:3000/login.

Promote the first admin after that person has a profile row:

```sql
update public.profiles
set role = 'admin'
where email = 'you@example.com';
```

Deactivating a user sets `profiles.status` to `inactive` and bans the Supabase auth user, so existing access tokens stop working. You cannot deactivate your own account.

## 4. Mobile app

```bash
cd apps/mobile
copy .env.example .env
npm install
npx expo start
```

```env
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Use your computer's LAN IP instead of `localhost` when the app runs on a physical device. The Android emulator reaches the host machine at `http://10.0.2.2:5000`.

```bash
npx expo start --android
npx expo start --ios
```

iOS requires macOS. Android requires an emulator or device.

## 5. End-to-end check

1. Register in the mobile app.
2. Sign in.
3. Submit a property and generate an evaluation.
4. Open the valuation and investment sections.
5. Confirm the evaluation appears in History.
6. Promote that user, or a second user, to admin.
7. Sign in at http://localhost:3000 and open the same evaluation.

Without verified comparable sales, the completed evaluation should explain that a numeric value was not produced.

## 6. Tests

```bash
cd apps/backend && npm test
cd apps/admin && npm test
cd apps/mobile && npm test
```

These tests mock Supabase and do not call OpenRouter.
