import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/**/infrastructure/persistence/drizzle/*.schema.ts',
  out: './migrations',
});
