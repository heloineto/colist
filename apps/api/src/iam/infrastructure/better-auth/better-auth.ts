import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { ConfigService } from '@/common/infrastructure/config/config.service';
import type { Drizzle } from '@/common/infrastructure/persistence/drizzle/drizzle.token';
import {
  account,
  session,
  user,
  verification,
} from '@/iam/infrastructure/persistence/drizzle/iam.schema';
import {
  hashAnyPassword,
  verifyAnyPassword,
} from '@/iam/infrastructure/utils/password.util';

export const AUTH_BASE_PATH = '/api/auth';

export function createBetterAuth(db: Drizzle, configService: ConfigService) {
  const baseURL = configService.get('BETTER_AUTH_URL');
  const webUrl = configService.get('WEB_URL') ?? baseURL;

  return betterAuth({
    baseURL,
    basePath: AUTH_BASE_PATH,
    secret: configService.get('BETTER_AUTH_SECRET'),
    trustedOrigins: [webUrl],
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: { user, session, account, verification },
    }),
    advanced: { database: { generateId: 'uuid' } },
    emailAndPassword: {
      enabled: true,
      password: { hash: hashAnyPassword, verify: verifyAnyPassword },
    },
    socialProviders: {
      google: {
        clientId: configService.get('GOOGLE_CLIENT_ID'),
        clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      },
    },
    account: {
      accountLinking: { enabled: true, trustedProviders: ['google'] },
    },
  });
}

export type BetterAuth = ReturnType<typeof createBetterAuth>;

export abstract class BetterAuthInstance {
  abstract readonly auth: BetterAuth;
}
