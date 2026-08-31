import type { INestApplication } from '@nestjs/common';
import { toNodeHandler } from 'better-auth/node';
import {
  AUTH_BASE_PATH,
  BetterAuthInstance,
} from '@/iam/infrastructure/better-auth/better-auth';

/** Mounted before Nest's JSON parser (see `setupApp`): better-auth reads the raw body. */
export function mountBetterAuth(app: INestApplication): void {
  const { auth } = app.get(BetterAuthInstance);
  app.use(`${AUTH_BASE_PATH}/*splat`, toNodeHandler(auth));
}
