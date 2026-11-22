/**
 * Apply migration + seed to a hosted Supabase Postgres database.
 *
 * Usage:
 *   node scripts/apply-schema.mjs "postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres"
 * or set DATABASE_URL in the environment.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';

const connectionString = process.argv[2] || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Missing database URL. Pass it as the first argument or set DATABASE_URL.');
  process.exit(1);
}

const root = resolve(import.meta.dirname, '..');
const migration = readFileSync(resolve(root, 'supabase/migrations/20261122000000_init.sql'), 'utf8');
const seed = readFileSync(resolve(root, 'supabase/seed.sql'), 'utf8');

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  console.log('Applying migration…');
  await client.query(migration);
  console.log('Applying seed…');
  await client.query(seed);
  const settings = await client.query('select setting_key from public.system_settings order by setting_key');
  console.log('system_settings:', settings.rows.map((row) => row.setting_key).join(', '));
  console.log('Done.');
} finally {
  await client.end();
}
