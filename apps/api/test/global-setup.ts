import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const API_ROOT = resolve(__dirname, '..');
const COMPOSE =
  'docker compose --env-file .env.test -f docker-compose.test.yml';

config({ path: resolve(API_ROOT, '.env.test'), override: true, quiet: true });

export async function setup() {
  execSync(`${COMPOSE} up -d --wait`, { stdio: 'inherit', cwd: API_ROOT });

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL missing from .env.test');

  const db = drizzle(databaseUrl);
  await migrate(db, { migrationsFolder: resolve(API_ROOT, 'migrations') });
  await db.$client.end();
}

export function teardown() {
  execSync(`${COMPOSE} down`, { stdio: 'inherit', cwd: API_ROOT });
}
