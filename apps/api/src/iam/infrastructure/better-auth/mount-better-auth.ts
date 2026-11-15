import type { INestApplication } from '@nestjs/common';
import { toNodeHandler } from 'better-auth/node';
import {
  AUTH_BASE_PATH,
  BetterAuthInstance,
} from '@/iam/infrastructure/better-auth/better-auth';

/** Mounted before Nest's JSON parser (see `setupApp`): better-auth reads the raw body. */
export function mountBetterAuth(app: INestApplication): void {
  const { auth } = app.get(BetterAuthInstance);
  // Plain prefix mount (no `*splat`): with a splat pattern Express 5 puts the
  // whole matched path in `req.baseUrl`, and better-call then rebuilds the URL
  // without the query string - which drops `?state=&code=` on OAuth callbacks.
  const handler = toNodeHandler(auth);
  app.use(AUTH_BASE_PATH, handler);
  // OAuth discovery lives at the origin root (RFC 8414 / RFC 9728), outside
  // `/api`; the mcp/oauth-provider `onRequest` hooks answer it.
  app.use('/.well-known', handler);
}
