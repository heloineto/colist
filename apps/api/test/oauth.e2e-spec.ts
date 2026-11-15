import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { BetterAuthInstance } from '@/iam/infrastructure/better-auth/better-auth';
import { connectApp, createTestApp, signUp } from './helpers';

let app: INestApplication<App>;
let resource: string;
let issuer: string;

beforeAll(async () => {
  app = await createTestApp();
  resource = app.get(BetterAuthInstance).mcpResource;
  issuer = new URL('/api/auth', resource).href;
});

afterAll(async () => {
  await app.close();
});

describe('GET /.well-known/oauth-protected-resource/api/mcp', () => {
  it('points at the authorization server with the lists scope', async () => {
    const response = await request(app.getHttpServer())
      .get('/.well-known/oauth-protected-resource/api/mcp')
      .expect(200);

    expect(response.body).toMatchObject({
      resource,
      authorization_servers: [issuer],
      scopes_supported: ['lists'],
    });
  });
});

describe('GET /.well-known/oauth-authorization-server/api/auth', () => {
  it('advertises CIMD, public clients and PKCE, without DCR', async () => {
    const response = await request(app.getHttpServer())
      .get('/.well-known/oauth-authorization-server/api/auth')
      .expect(200);

    expect(response.body).toMatchObject({
      issuer,
      client_id_metadata_document_supported: true,
      token_endpoint_auth_methods_supported: expect.arrayContaining([
        'none',
      ]) as string[],
      code_challenge_methods_supported: ['S256'],
      scopes_supported: expect.arrayContaining([
        'lists',
        'offline_access',
      ]) as string[],
    });
    expect(response.body).not.toHaveProperty('registration_endpoint');
  });
});

describe('POST /api/auth/oauth2/token', () => {
  it('issues a 15 min JWT bound to the MCP resource', async () => {
    const user = await signUp(app);

    const { accessToken } = await connectApp(app, user);

    const [, payload] = accessToken.split('.');
    const claims = JSON.parse(
      Buffer.from(payload, 'base64url').toString()
    ) as Record<string, unknown>;
    expect(claims).toMatchObject({ sub: user.id, aud: resource, iss: issuer });
    expect(String(claims.scope).split(' ')).toContain('lists');
    expect(Number(claims.exp) - Number(claims.iat)).toBe(15 * 60);
  });
});
