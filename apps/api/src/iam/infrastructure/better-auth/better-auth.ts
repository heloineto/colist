import { cimd } from '@better-auth/cimd';
import { fetchClientMetadataResource } from '@better-auth/cimd/node';
import { mcp } from '@better-auth/mcp';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { jwt } from 'better-auth/plugins';
import type { ConfigService } from '@/common/infrastructure/config/config.service';
import type { Drizzle } from '@/common/infrastructure/persistence/drizzle/drizzle.token';
import {
  account,
  jwks,
  oauthAccessToken,
  oauthClient,
  oauthClientAssertion,
  oauthClientResource,
  oauthConsent,
  oauthRefreshToken,
  oauthResource,
  session,
  user,
  verification,
} from '@/iam/infrastructure/persistence/drizzle/iam.schema';
import {
  hashAnyPassword,
  verifyAnyPassword,
} from '@/iam/infrastructure/utils/password.util';

export const AUTH_BASE_PATH = '/api/auth';

/** The one resource scope a Connected app gets: read and edit the user's lists. */
export const MCP_SCOPE = 'lists';

/** OAuth `resource` (RFC 8707) = the MCP endpoint URL, e.g. `https://colist.heloineto.com/api/mcp`. */
export function getMcpResource(baseURL: string): string {
  return new URL('/api/mcp', baseURL).href;
}

export function createBetterAuth(db: Drizzle, configService: ConfigService) {
  const baseURL = configService.get('BETTER_AUTH_URL');
  const webUrl = configService.get('WEB_URL') ?? baseURL;

  return betterAuth({
    baseURL,
    basePath: AUTH_BASE_PATH,
    // OAuth provider mode: `/oauth2/token` and `/oauth2/userinfo` replace these.
    disabledPaths: ['/token'],
    secret: configService.get('BETTER_AUTH_SECRET'),
    trustedOrigins: [webUrl],
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user,
        session,
        account,
        verification,
        jwks,
        oauthClient,
        oauthClientAssertion,
        oauthResource,
        oauthClientResource,
        oauthRefreshToken,
        oauthAccessToken,
        oauthConsent,
      },
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
    plugins: [
      jwt({ disableSettingJwtHeader: true }),
      // Client registration is CIMD only (DCR off). Refresh: 30 d, rotating (defaults).
      mcp({
        resource: getMcpResource(baseURL),
        loginPage: '/auth',
        consentPage: '/oauth/consent',
        scopes: ['openid', 'profile', 'email', 'offline_access', MCP_SCOPE],
        grantTypes: ['authorization_code', 'refresh_token'],
        // JWTs can't be revoked: short-lived so "Disconnect" bites fast.
        accessTokenExpiresIn: 15 * 60,
        // No user-managed clients over HTTP (`/oauth2/create-client` & co).
        clientPrivileges: () => false,
      }),
      cimd({ fetchClientMetadataResource, metadataProfile: 'mcp-2026-07-28' }),
    ],
  });
}

export type BetterAuth = ReturnType<typeof createBetterAuth>;

export abstract class BetterAuthInstance {
  abstract readonly auth: BetterAuth;
  /** See `getMcpResource`; the MCP route checks the token audience against it. */
  abstract readonly mcpResource: string;
}
