/**
 * PM2 staging process file for backend (3036) and admin (3037).
 *
 * Server env (not committed):
 * - apps/backend/.env  → PORT=3036, NODE_ENV=production,
 *   CORS_ORIGIN=http://168.231.74.154:3037, plus Supabase/OpenRouter keys
 * - apps/admin/.env or .env.local → NEXT_PUBLIC_API_URL=http://168.231.74.154:3036,
 *   plus Supabase public keys
 *
 * Usage:
 *   npm run build:staging
 *   npm run pm2:start
 *   pm2 save && pm2 startup
 */
const path = require('path');

const root = __dirname;
const logsDir = path.join(root, 'logs');

module.exports = {
  apps: [
    {
      name: 'spe-backend',
      cwd: path.join(root, 'apps/backend'),
      script: 'dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3036,
      },
      error_file: path.join(logsDir, 'spe-backend-error.log'),
      out_file: path.join(logsDir, 'spe-backend-out.log'),
      merge_logs: true,
      time: true,
    },
    {
      name: 'spe-admin',
      cwd: path.join(root, 'apps/admin'),
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3037',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3037,
      },
      error_file: path.join(logsDir, 'spe-admin-error.log'),
      out_file: path.join(logsDir, 'spe-admin-out.log'),
      merge_logs: true,
      time: true,
    },
  ],
};
