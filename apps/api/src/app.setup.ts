import type { NestExpressApplication } from '@nestjs/platform-express';
import { mountBetterAuth } from '@/iam/infrastructure/better-auth/mount-better-auth';

/**
 * Shared by `main.ts` and the e2e helper. Order is load-bearing: better-auth
 * reads the raw body, so it mounts before Nest's JSON parser (create the app
 * with `bodyParser: false`).
 */
export function setupApp(app: NestExpressApplication): void {
  app.setGlobalPrefix('api');
  mountBetterAuth(app);
  app.useBodyParser('json');
}
