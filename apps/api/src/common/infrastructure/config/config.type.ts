import { z } from 'zod';

export const ConfigSchema = z.object({
  PORT: z.coerce.number(),
  MODE: z.enum(['development', 'test', 'production']),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  DATABASE_URL: z.url(),
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  WEB_URL: z.url().optional(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  UPLOADS_BUCKET: z.string().min(1),
  AWS_REGION: z.string().default('us-east-2'),
});

export type Config = z.infer<typeof ConfigSchema>;
