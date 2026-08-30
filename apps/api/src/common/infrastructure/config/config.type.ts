import { z } from 'zod';

export const ConfigSchema = z.object({
  PORT: z.coerce.number(),
  MODE: z.enum(['development', 'test', 'production']),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  DATABASE_URL: z.url(),
  WEB_URL: z.url(),
});

export type Config = z.infer<typeof ConfigSchema>;
