import type { INestApplication } from '@nestjs/common';
import { toNodeHandler } from 'better-auth/node';
import {
  AUTH_BASE_PATH,
  BetterAuthInstance,
} from '@/iam/infrastructure/better-auth/better-auth';

/**
 * better-auth reads the raw body, so it is mounted before Nest's JSON parser:
 * create the app with `bodyParser: false`, call this, then `app.useBodyParser('json')`.
 */
export function mountBetterAuth(app: INestApplication): void {
  const { auth } = app.get(BetterAuthInstance);
  app.use(`${AUTH_BASE_PATH}/*splat`, toNodeHandler(auth));
}
