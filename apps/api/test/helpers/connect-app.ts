import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import {
  DRIZZLE,
  type Drizzle,
} from '@/common/infrastructure/persistence/drizzle/drizzle.token';
import { BetterAuthInstance } from '@/iam/infrastructure/better-auth/better-auth';
import {
  oauthClient,
  oauthClientResource,
} from '@/iam/infrastructure/persistence/drizzle/iam.schema';
import type { TestUser } from './sign-up';

const REDIRECT_URI = 'http://127.0.0.1/callback';

export type ConnectedApp = {
  clientId: string;
  accessToken: string;
  refreshToken: string;
};

/**
 * Public PKCE client shaped like the one `cimd()` creates from a metadata
 * document (e2e can't serve one over HTTPS), linked to the MCP resource.
 */
async function createPublicClient(app: INestApplication<App>) {
  const db = app.get<Drizzle>(DRIZZLE);
  const { mcpResource } = app.get(BetterAuthInstance);
  const clientId = `https://client.test/${randomUUID()}`;
  const now = new Date();

  await db.insert(oauthClient).values({
    clientId,
    name: 'Test client',
    redirectUris: [REDIRECT_URI],
    tokenEndpointAuthMethod: 'none',
    grantTypes: ['authorization_code', 'refresh_token'],
    responseTypes: ['code'],
    applicationType: 'native',
    requirePKCE: true,
    createdAt: now,
    updatedAt: now,
  });
  await db
    .insert(oauthClientResource)
    .values({ clientId, resourceId: mcpResource, createdAt: now });

  return { clientId, resource: mcpResource };
}

function pkce() {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

/** Real authorize -> consent -> token dance, as Claude does it, for `user`. */
export async function connectApp(
  app: INestApplication<App>,
  user: TestUser
): Promise<ConnectedApp> {
  // Seeds the MCP `oauth_resource` row (plugin init) before linking to it.
  await user.agent.get('/api/auth/get-session').expect(200);
  const { clientId, resource } = await createPublicClient(app);
  const { verifier, challenge } = pkce();

  const authorize = await user.agent.get('/api/auth/oauth2/authorize').query({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    scope: 'lists offline_access',
    state: 'state',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    resource,
  });
  const consentPage = new URL(authorize.headers.location, 'http://web');

  const consent = await user.agent
    .post('/api/auth/oauth2/consent')
    .send({ accept: true, oauth_query: consentPage.search.slice(1) })
    .expect(200);
  const callback = new URL((consent.body as { url: string }).url);

  const token = await request(app.getHttpServer())
    .post('/api/auth/oauth2/token')
    .type('form')
    .send({
      grant_type: 'authorization_code',
      code: callback.searchParams.get('code'),
      redirect_uri: REDIRECT_URI,
      client_id: clientId,
      code_verifier: verifier,
      resource,
    })
    .expect(200);
  const body = token.body as { access_token: string; refresh_token: string };

  return {
    clientId,
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
  };
}

export function refreshToken(
  app: INestApplication<App>,
  connected: ConnectedApp
) {
  return request(app.getHttpServer())
    .post('/api/auth/oauth2/token')
    .type('form')
    .send({
      grant_type: 'refresh_token',
      refresh_token: connected.refreshToken,
      client_id: connected.clientId,
    });
}
